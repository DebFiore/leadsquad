import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// API payload builders for voice providers
function buildVapiPayload(leadData: any, agentSettings: any, systemPrompt: string) {
  return {
    assistant: {
      name: `${agentSettings.agent_role}_agent`,
      voice: {
        provider: 'elevenlabs',
        voiceId: agentSettings.voice_settings?.voice_id || 'rachel',
        stability: agentSettings.voice_settings?.stability || 0.5,
        clarityEnhancement: agentSettings.voice_settings?.clarity || 0.75,
      },
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        systemPrompt: systemPrompt,
        functions: [
          {
            name: 'transfer_to_appointment_setter',
            description: 'Transfer the call to the appointment setter agent',
            parameters: { type: 'object', properties: {} },
          },
          {
            name: 'end_call_and_send_sms',
            description: 'End the call and send a follow-up SMS',
            parameters: {
              type: 'object',
              properties: {
                message: { type: 'string', description: 'SMS message to send' },
              },
              required: ['message'],
            },
          },
          {
            name: 'schedule_callback',
            description: 'Schedule a callback at a specific time',
            parameters: {
              type: 'object',
              properties: {
                callback_time: { type: 'string', description: 'When to call back' },
              },
              required: ['callback_time'],
            },
          },
        ],
      },
    },
    phoneNumber: {
      twilioPhoneNumber: agentSettings.phone_number,
    },
    customer: {
      number: leadData.phone,
      name: leadData.name || 'Unknown',
    },
  }
}

function buildRetellPayload(leadData: any, agentSettings: any, systemPrompt: string) {
  return {
    agent_id: agentSettings.retell_agent_id,
    from_number: agentSettings.phone_number,
    to_number: leadData.phone,
    metadata: {
      lead_id: leadData.id,
      organization_id: agentSettings.organization_id,
    },
    override_agent_config: {
      voice_id: agentSettings.voice_settings?.voice_id,
      ambient_sound: 'off',
      language: 'en-US',
      llm_websocket_url: null,
      prompt: systemPrompt,
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/call-webhook`,
    },
  }
}

// LeadEvent interface for reference - data structure in lead_events table

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action, organization_id, lead_data } = await req.json()

    console.log(`Automation Engine received action: ${action}`)

    // Helper: Get provider API key for an organization
    async function getProviderApiKey(orgId: string, provider: 'vapi' | 'retell'): Promise<string | null> {
      const { data, error } = await supabase
        .from('provider_settings')
        .select('api_key, is_connected')
        .eq('organization_id', orgId)
        .eq('provider', provider)
        .single()

      if (error || !data?.is_connected) {
        console.error(`No connected ${provider} provider for org ${orgId}`)
        return null
      }

      return data.api_key
    }

    // Helper: Get agent settings for an organization
    async function getAgentSettings(orgId: string, agentRole: string) {
      const { data, error } = await supabase
        .from('agent_settings')
        .select('*')
        .eq('organization_id', orgId)
        .eq('agent_role', agentRole)
        .single()

      if (error) {
        console.error('Failed to get agent settings:', error)
        return null
      }

      return data
    }

    // Helper: Get system prompt from intake data
    async function getSystemPrompt(orgId: string, agentRole: string): Promise<string> {
      const { data: intake } = await supabase
        .from('client_intake_responses')
        .select('*')
        .eq('organization_id', orgId)
        .single()

      const companyName = intake?.step1_business_basics?.companyName || 'the company'
      const industry = intake?.step1_business_basics?.industry || 'services'
      const callObjective = intake?.step3_call_logic?.callObjective || 'assist the customer'

      const prompts: Record<string, string> = {
        inbound_receptionist: `You are a friendly and professional receptionist for ${companyName}, a ${industry} business. Your primary goal is to ${callObjective}. Greet callers warmly, understand their needs, and either book an appointment or transfer them to the appropriate team member. Be helpful, concise, and maintain a professional tone.`,
        outbound_lead: `You are an outbound sales representative for ${companyName}. Your goal is to qualify leads and schedule callbacks or appointments. Be personable and engaging, ask qualifying questions, and determine if the lead is a good fit. If interested, offer to schedule a follow-up call or appointment.`,
        appointment_setter: `You are an appointment setter for ${companyName}. Your primary goal is to confirm, reschedule, or book appointments. Be efficient and professional, confirm all appointment details, and send confirmation messages. Handle scheduling conflicts gracefully and offer alternatives.`,
      }

      return prompts[agentRole] || prompts.inbound_receptionist
    }

    // Action: Initiate outbound call via Vapi or Retell
    if (action === 'initiate_call') {
      const { lead_id, agent_role, provider } = lead_data

      const agentSettings = await getAgentSettings(organization_id, agent_role || 'outbound_lead')
      if (!agentSettings) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Agent settings not found' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Get the provider to use (from agent settings or request)
      const selectedProvider = provider || agentSettings.provider || 'vapi'
      const apiKey = await getProviderApiKey(organization_id, selectedProvider)

      if (!apiKey) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `${selectedProvider} is not connected for this organization` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const systemPrompt = await getSystemPrompt(organization_id, agent_role || 'outbound_lead')

      let callPayload: any
      let callEndpoint: string

      if (selectedProvider === 'vapi') {
        callPayload = buildVapiPayload(lead_data, agentSettings, systemPrompt)
        callEndpoint = 'https://api.vapi.ai/call/phone'
      } else {
        callPayload = buildRetellPayload(lead_data, agentSettings, systemPrompt)
        callEndpoint = 'https://api.retellai.com/v2/create-phone-call'
      }

      // Make the API call to initiate the call
      const callResponse = await fetch(callEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callPayload),
      })

      const callResult = await callResponse.json()

      if (!callResponse.ok) {
        console.error(`${selectedProvider} call failed:`, callResult)
        
        // Log the failed attempt
        await supabase.from('lead_events').insert({
          organization_id,
          lead_id: lead_id || null,
          event_type: 'call_failed',
          event_data: {
            provider: selectedProvider,
            error: callResult.message || callResult.error || 'Unknown error',
            agent_role: agent_role,
          },
          status: 'failed',
        })

        return new Response(JSON.stringify({ 
          success: false, 
          error: callResult.message || 'Call initiation failed' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Log successful call initiation
      const { data: callEvent } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_id || null,
          event_type: 'call_attempted',
          event_data: {
            provider: selectedProvider,
            call_id: callResult.id || callResult.call_id,
            agent_role: agent_role,
            phone: lead_data.phone,
          },
          status: 'in_progress',
        })
        .select()
        .single()

      return new Response(JSON.stringify({ 
        success: true, 
        call_id: callResult.id || callResult.call_id,
        event_id: callEvent?.id,
        message: `Call initiated via ${selectedProvider}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: Process new web form submission
    if (action === 'process_new_lead') {
      // 1. Create the initial event record
      const { data: event, error: eventError } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_data?.id || null,
          event_type: 'web_form_inbound',
          event_data: lead_data,
          status: 'processing',
        })
        .select()
        .single()

      if (eventError) throw eventError

      console.log(`Created web_form_inbound event: ${event.id}`)

      // 2. Immediately trigger SMS response
      const { error: smsError } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_data?.id || null,
          event_type: 'sms_sent',
          event_data: {
            message: 'Thank you for reaching out! One of our team members will call you shortly.',
            phone: lead_data?.phone,
            triggered_by: event.id,
          },
          status: 'completed',
        })

      if (smsError) {
        console.error('Failed to create SMS event:', smsError)
      }

      // 3. Schedule call attempt (simulated 30-second delay via status)
      const { error: callError } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_data?.id || null,
          event_type: 'call_scheduled',
          event_data: {
            scheduled_for: new Date(Date.now() + 30000).toISOString(),
            agent_role: 'outbound_lead',
            triggered_by: event.id,
          },
          status: 'pending',
        })

      if (callError) {
        console.error('Failed to schedule call:', callError)
      }

      // Update original event as processed
      await supabase
        .from('lead_events')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', event.id)

      return new Response(JSON.stringify({ 
        success: true, 
        event_id: event.id,
        message: 'Lead processing initiated: SMS sent, call scheduled' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: Process appointment booking confirmation
    if (action === 'confirm_appointment') {
      // Create appointment set event
      const { data: appointmentEvent, error: appointmentError } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_data?.lead_id || null,
          event_type: 'appointment_set',
          event_data: {
            appointment_time: lead_data?.appointment_time,
            service: lead_data?.service,
            notes: lead_data?.notes,
          },
          status: 'completed',
        })
        .select()
        .single()

      if (appointmentError) throw appointmentError

      // Send confirmation SMS
      const { error: smsError } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_data?.lead_id || null,
          event_type: 'sms_sent',
          event_data: {
            message: `Your appointment is confirmed for ${lead_data?.appointment_time}. We look forward to seeing you!`,
            phone: lead_data?.phone,
            type: 'appointment_confirmation',
            triggered_by: appointmentEvent.id,
          },
          status: 'completed',
        })

      if (smsError) {
        console.error('Failed to send confirmation SMS:', smsError)
      }

      return new Response(JSON.stringify({ 
        success: true, 
        event_id: appointmentEvent.id,
        message: 'Appointment confirmed and SMS sent' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: Schedule lead rework
    if (action === 'schedule_rework') {
      const { retry_count, max_retries, hours_between } = lead_data

      if (retry_count >= max_retries) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Max retries reached for this lead' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const nextAttemptTime = new Date(Date.now() + (hours_between * 60 * 60 * 1000))

      const { data: reworkEvent, error: reworkError } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_data?.lead_id || null,
          event_type: 'rework_scheduled',
          event_data: {
            retry_count: retry_count + 1,
            max_retries,
            scheduled_for: nextAttemptTime.toISOString(),
            reason: 'unanswered_call',
          },
          status: 'pending',
        })
        .select()
        .single()

      if (reworkError) throw reworkError

      return new Response(JSON.stringify({ 
        success: true, 
        event_id: reworkEvent.id,
        next_attempt: nextAttemptTime.toISOString(),
        message: `Rework scheduled: attempt ${retry_count + 1} of ${max_retries}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: Get event statistics for an organization
    if (action === 'get_stats') {
      const { data: events, error: statsError } = await supabase
        .from('lead_events')
        .select('event_type, status')
        .eq('organization_id', organization_id)

      if (statsError) throw statsError

      const stats = {
        total: events?.length || 0,
        by_type: {} as Record<string, number>,
        by_status: {} as Record<string, number>,
      }

      events?.forEach(event => {
        stats.by_type[event.event_type] = (stats.by_type[event.event_type] || 0) + 1
        stats.by_status[event.status] = (stats.by_status[event.status] || 0) + 1
      })

      return new Response(JSON.stringify({ success: true, stats }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    console.error('Automation engine error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
