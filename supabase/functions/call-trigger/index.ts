import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Webhook endpoint for N8N or external triggers to initiate calls
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { 
      organization_id, 
      lead_id, 
      phone, 
      name, 
      agent_role = 'outbound_lead',
      provider,
      metadata 
    } = await req.json()

    console.log(`Call trigger received for org: ${organization_id}, lead: ${lead_id}`)

    // Validate required fields
    if (!organization_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'organization_id is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!phone) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'phone number is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get agent settings
    const { data: agentSettings, error: agentError } = await supabase
      .from('agent_settings')
      .select('*')
      .eq('organization_id', organization_id)
      .eq('agent_role', agent_role)
      .single()

    if (agentError || !agentSettings) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Agent settings not found for this organization' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Determine provider
    const selectedProvider = provider || agentSettings.provider || 'vapi'

    // Get provider API key
    const { data: providerSettings, error: providerError } = await supabase
      .from('provider_settings')
      .select('api_key, is_connected')
      .eq('organization_id', organization_id)
      .eq('provider', selectedProvider)
      .single()

    if (providerError || !providerSettings?.is_connected || !providerSettings?.api_key) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `${selectedProvider} is not connected. Please configure it in Integrations.` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get system prompt from intake
    const { data: intake } = await supabase
      .from('client_intake_responses')
      .select('step1_business_basics, step3_call_logic')
      .eq('organization_id', organization_id)
      .single()

    const companyName = intake?.step1_business_basics?.companyName || 'the company'
    const industry = intake?.step1_business_basics?.industry || 'services'
    const callObjective = intake?.step3_call_logic?.callObjective || 'assist the customer'

    const systemPrompts: Record<string, string> = {
      inbound_receptionist: `You are a friendly and professional receptionist for ${companyName}, a ${industry} business. Your primary goal is to ${callObjective}. Greet callers warmly, understand their needs, and either book an appointment or transfer them to the appropriate team member.`,
      outbound_lead: `You are an outbound sales representative for ${companyName}. Your goal is to qualify leads and schedule callbacks or appointments. Be personable and engaging, ask qualifying questions, and determine if the lead is a good fit.`,
      appointment_setter: `You are an appointment setter for ${companyName}. Your primary goal is to confirm, reschedule, or book appointments. Be efficient and professional, confirm all appointment details, and send confirmation messages.`,
    }

    const systemPrompt = systemPrompts[agent_role] || systemPrompts.inbound_receptionist

    // Build API payload based on provider
    let callPayload: any
    let callEndpoint: string

    if (selectedProvider === 'vapi') {
      callPayload = {
        assistant: {
          name: `${agent_role}_agent`,
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
                  properties: { message: { type: 'string' } },
                  required: ['message'],
                },
              },
            ],
          },
        },
        customer: {
          number: phone,
          name: name || 'Unknown',
        },
      }
      callEndpoint = 'https://api.vapi.ai/call/phone'
    } else {
      callPayload = {
        from_number: agentSettings.phone_number,
        to_number: phone,
        metadata: {
          lead_id: lead_id,
          organization_id: organization_id,
          ...metadata,
        },
        override_agent_config: {
          voice_id: agentSettings.voice_settings?.voice_id,
          prompt: systemPrompt,
        },
      }
      callEndpoint = 'https://api.retellai.com/v2/create-phone-call'
    }

    // Initiate the call
    const callResponse = await fetch(callEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${providerSettings.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callPayload),
    })

    const callResult = await callResponse.json()

    if (!callResponse.ok) {
      console.error(`${selectedProvider} call failed:`, callResult)
      
      // Log failed attempt
      await supabase.from('lead_events').insert({
        organization_id,
        lead_id: lead_id || null,
        event_type: 'call_failed',
        event_data: {
          provider: selectedProvider,
          error: callResult.message || callResult.error || 'Unknown error',
          agent_role,
          phone,
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
          agent_role,
          phone,
          name,
          metadata,
        },
        status: 'in_progress',
      })
      .select()
      .single()

    console.log(`Call initiated successfully: ${callResult.id || callResult.call_id}`)

    return new Response(JSON.stringify({ 
      success: true, 
      call_id: callResult.id || callResult.call_id,
      event_id: callEvent?.id,
      provider: selectedProvider,
      message: 'Call initiated successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    console.error('Call trigger error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
