import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

// Callback endpoint for n8n to signal deployment completion
Deno.serve(async (req) => {
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
      status,
      phone_numbers,
      agent_ids,
      error_message,
    } = await req.json()

    console.log(`Deployment callback for org: ${organization_id}, status: ${status}`)

    if (!organization_id) {
      return new Response(JSON.stringify({ error: 'organization_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!status || !['completed', 'failed'].includes(status)) {
      return new Response(JSON.stringify({ error: 'status must be completed or failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update deployment status
    const updateData: Record<string, unknown> = {
      status,
      completed_at: new Date().toISOString(),
    }

    if (status === 'completed') {
      if (phone_numbers) updateData.phone_numbers = phone_numbers
      if (agent_ids) updateData.agent_ids = agent_ids
    } else {
      updateData.error_message = error_message || 'Deployment failed'
    }

    const { error: updateError } = await supabase
      .from('deployment_status')
      .update(updateData)
      .eq('organization_id', organization_id)

    if (updateError) throw updateError

    // If successful, update agent settings with provider IDs
    if (status === 'completed' && agent_ids) {
      for (const [role, agentId] of Object.entries(agent_ids)) {
        await supabase
          .from('agent_settings')
          .update({
            retell_agent_id: agentId as string,
            updated_at: new Date().toISOString(),
          })
          .eq('organization_id', organization_id)
          .eq('agent_role', role)
      }
    }

    // Log deployment event
    await supabase.from('lead_events').insert({
      organization_id,
      event_type: status === 'completed' ? 'deployment_completed' : 'deployment_failed',
      event_data: {
        phone_numbers,
        agent_ids,
        error_message,
      },
      status: status === 'completed' ? 'completed' : 'failed',
    })

    console.log(`Deployment ${status} for org: ${organization_id}`)

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Deployment ${status}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    console.error('Deployment callback error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
