import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

// Create Retell agents based on client intake data
async function createRetellAgents(
  supabase: any,
  organizationId: string,
  apiKey: string
): Promise<{ success: boolean; agents: any[]; error?: string }> {
  console.log(`Creating Retell agents for org: ${organizationId}`)

  // Get intake data for agent configuration
  const { data: intake, error: intakeError } = await supabase
    .from('client_intake_responses')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (intakeError) {
    console.error('Failed to fetch intake data:', intakeError)
    return { success: false, agents: [], error: 'Intake data not found' }
  }

  // Get voice settings from agent_settings
  const { data: agentSettings } = await supabase
    .from('agent_settings')
    .select('voice_settings')
    .eq('organization_id', organizationId)
    .limit(1)
    .single()

  const voiceId = agentSettings?.voice_settings?.voice_id || 'eleven_rachel'
  const companyName = intake?.step1_business_basics?.companyName || 'the company'
  const industry = intake?.step1_business_basics?.industry || 'services'
  const callObjective = intake?.step3_call_logic?.callObjective || 'assist customers'

  // Define the 3 agent configurations
  const agentConfigs = [
    {
      role: 'inbound_receptionist',
      name: `${companyName} Receptionist`,
      prompt: `You are a friendly and professional receptionist for ${companyName}, a ${industry} business. Your primary goal is to ${callObjective}. Greet callers warmly, understand their needs, and either book an appointment or transfer them to the appropriate team member. Be helpful, concise, and maintain a professional tone. Always confirm the caller's name and contact information.`,
    },
    {
      role: 'outbound_lead',
      name: `${companyName} Outreach Agent`,
      prompt: `You are an outbound sales representative for ${companyName}. Your goal is to qualify leads and schedule callbacks or appointments. Be personable and engaging, ask qualifying questions, and determine if the lead is a good fit. If interested, offer to schedule a follow-up call or appointment. Be respectful of the prospect's time and never be pushy.`,
    },
    {
      role: 'appointment_setter',
      name: `${companyName} Appointment Setter`,
      prompt: `You are an appointment setter for ${companyName}. Your primary goal is to confirm, reschedule, or book appointments. Be efficient and professional, confirm all appointment details including date, time, and service type. Handle scheduling conflicts gracefully and offer alternatives. Always send a confirmation summary at the end of each call.`,
    },
  ]

  const createdAgents: any[] = []
  const errors: string[] = []

  for (const config of agentConfigs) {
    try {
      // Create agent in Retell
      const response = await fetch('https://api.retellai.com/create-agent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_name: config.name,
          voice_id: voiceId,
          response_engine: {
            type: 'retell-llm',
            llm_id: null, // Will use default
          },
          llm_websocket_url: null,
          general_prompt: config.prompt,
          begin_message: `Hello, thank you for calling ${companyName}. How may I assist you today?`,
          language: 'en-US',
          ambient_sound: 'off',
          responsiveness: 0.8,
          interruption_sensitivity: 0.8,
          enable_backchannel: true,
          backchannel_frequency: 0.9,
          reminder_trigger_ms: 10000,
          reminder_max_count: 2,
          normalize_for_speech: true,
          end_call_after_silence_ms: 30000,
          max_call_duration_ms: 1800000, // 30 minutes
          enable_voicemail_detection: true,
          voicemail_message: `Hi, this is ${companyName}. We tried reaching you. Please call us back at your earliest convenience.`,
          post_call_analysis_data: ['call_summary', 'user_sentiment', 'call_successful'],
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error(`Failed to create ${config.role} agent:`, result)
        errors.push(`${config.role}: ${result.message || 'Unknown error'}`)
        continue
      }

      console.log(`Created Retell agent for ${config.role}:`, result.agent_id)

      // Update agent_settings with Retell agent ID
      await supabase
        .from('agent_settings')
        .update({
          retell_agent_id: result.agent_id,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', organizationId)
        .eq('agent_role', config.role)

      createdAgents.push({
        role: config.role,
        agent_id: result.agent_id,
        name: config.name,
      })

    } catch (error) {
      console.error(`Error creating ${config.role} agent:`, error)
      errors.push(`${config.role}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Log the deployment event
  await supabase.from('lead_events').insert({
    organization_id: organizationId,
    event_type: 'agents_deployed',
    event_data: {
      provider: 'retell',
      agents_created: createdAgents.length,
      agents: createdAgents,
      errors: errors.length > 0 ? errors : null,
    },
    status: errors.length === 0 ? 'completed' : 'partial',
  })

  return {
    success: errors.length === 0,
    agents: createdAgents,
    error: errors.length > 0 ? errors.join('; ') : undefined,
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const webhookSecret = Deno.env.get('N8N_WEBHOOK_SECRET')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate webhook secret if configured
    const providedSecret = req.headers.get('x-webhook-secret')
    if (webhookSecret && providedSecret !== webhookSecret) {
      console.error('Invalid webhook secret')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { 
      organization_id, 
      provider_name, 
      api_key,
      auto_deploy_agents = true,
    } = await req.json()

    console.log(`Received provider key for org: ${organization_id}, provider: ${provider_name}`)

    // Validate required fields
    if (!organization_id) {
      return new Response(JSON.stringify({ error: 'organization_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!provider_name || !['vapi', 'retell'].includes(provider_name.toLowerCase())) {
      return new Response(JSON.stringify({ error: 'provider_name must be vapi or retell' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!api_key) {
      return new Response(JSON.stringify({ error: 'api_key is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const provider = provider_name.toLowerCase()

    // Check if provider setting exists
    const { data: existing } = await supabase
      .from('provider_settings')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('provider', provider)
      .maybeSingle()

    let providerSetting

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('provider_settings')
        .update({
          api_key: api_key,
          is_connected: true,
          last_tested_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      providerSetting = data
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('provider_settings')
        .insert({
          organization_id,
          provider,
          api_key,
          is_connected: true,
          last_tested_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      providerSetting = data
    }

    console.log(`Provider settings updated for org: ${organization_id}`)

    // Auto-deploy agents if enabled and provider is Retell
    let deploymentResult = null
    if (auto_deploy_agents && provider === 'retell') {
      console.log('Auto-deploying Retell agents...')
      deploymentResult = await createRetellAgents(supabase, organization_id, api_key)
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${provider} API key saved successfully`,
      provider_setting_id: providerSetting.id,
      deployment: deploymentResult,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    console.error('Receive provider keys error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
