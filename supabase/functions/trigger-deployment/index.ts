import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const n8nWebhookUrl = Deno.env.get('N8N_DEPLOYMENT_WEBHOOK_URL')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { organization_id } = await req.json()

    if (!organization_id) {
      return new Response(JSON.stringify({ error: 'organization_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Starting deployment for org: ${organization_id}`)

    // Get organization details
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organization_id)
      .single()

    if (orgError) throw orgError

    // Get complete intake responses
    const { data: intake, error: intakeError } = await supabase
      .from('client_intake_responses')
      .select('*')
      .eq('organization_id', organization_id)
      .single()

    if (intakeError) {
      console.error('Intake fetch error:', intakeError)
    }

    // Get agent settings
    const { data: agentSettings, error: agentError } = await supabase
      .from('agent_settings')
      .select('*')
      .eq('organization_id', organization_id)

    if (agentError) {
      console.error('Agent settings fetch error:', agentError)
    }

    // Create or update deployment status record
    const { data: existingStatus } = await supabase
      .from('deployment_status')
      .select('id')
      .eq('organization_id', organization_id)
      .maybeSingle()

    if (existingStatus) {
      await supabase
        .from('deployment_status')
        .update({
          status: 'deploying',
          started_at: new Date().toISOString(),
          completed_at: null,
          error_message: null,
        })
        .eq('id', existingStatus.id)
    } else {
      await supabase
        .from('deployment_status')
        .insert({
          organization_id,
          status: 'deploying',
          started_at: new Date().toISOString(),
        })
    }

    // Prepare webhook payload for n8n
    const webhookPayload = {
      organization_id,
      organization: {
        name: org.name,
        industry: org.industry,
        owner_id: org.owner_id,
      },
      intake_responses: intake || {},
      agent_settings: agentSettings || [],
      callback_url: `${supabaseUrl}/functions/v1/deployment-callback`,
      timestamp: new Date().toISOString(),
    }

    // Fire webhook to n8n (if URL configured)
    if (n8nWebhookUrl) {
      console.log('Sending webhook to n8n:', n8nWebhookUrl)
      
      // Use background task for webhook
      EdgeRuntime.waitUntil(
        fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        }).then(async (response) => {
          const result = await response.text()
          console.log('n8n webhook response:', response.status, result)
        }).catch((error) => {
          console.error('n8n webhook failed:', error)
        })
      )
    } else {
      console.log('N8N_DEPLOYMENT_WEBHOOK_URL not configured, skipping webhook')
      
      // Auto-complete deployment after delay if no n8n
      EdgeRuntime.waitUntil(
        (async () => {
          // Simulate deployment time
          await new Promise(resolve => setTimeout(resolve, 10000))
          
          // Mark as completed
          await supabase
            .from('deployment_status')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              phone_numbers: {
                inbound: '+1 (555) 123-4567',
                outbound: '+1 (555) 123-4568',
                setter: '+1 (555) 123-4569',
              },
              agent_ids: {
                inbound_receptionist: 'demo_agent_1',
                outbound_lead: 'demo_agent_2',
                appointment_setter: 'demo_agent_3',
              },
            })
            .eq('organization_id', organization_id)
        })()
      )
    }

    // Log deployment event
    await supabase.from('lead_events').insert({
      organization_id,
      event_type: 'deployment_started',
      event_data: {
        intake_complete: !!intake?.is_complete,
        agents_configured: agentSettings?.length || 0,
      },
      status: 'processing',
    })

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Deployment initiated',
      organization_id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    console.error('Trigger deployment error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
