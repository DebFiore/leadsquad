import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { organization_id } = await req.json();

    if (!organization_id) {
      return new Response(
        JSON.stringify({ error: 'organization_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Deploy Retell Agents] Starting for org: ${organization_id}`);

    // Get workspace credentials
    const { data: workspace, error: workspaceError } = await supabase
      .from('retell_workspaces')
      .select('*')
      .eq('organization_id', organization_id)
      .single();

    if (workspaceError || !workspace) {
      return new Response(
        JSON.stringify({ error: 'Retell workspace not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log provisioning start
    await supabase.from('provisioning_events').insert({
      organization_id,
      step: 'deploying_agents',
      status: 'running',
      message: 'Starting agent deployment to Retell workspace',
      details: { workspace_id: workspace.workspace_id },
    });

    // Get client intake data
    const { data: intake } = await supabase
      .from('client_intake_responses')
      .select('*')
      .eq('organization_id', organization_id)
      .single();

    const businessName = intake?.business_name || 'Your Business';
    const introSentence = intake?.intro_sentence || `Hi, thanks for calling ${businessName}. How can I help you today?`;

    // Agent configurations
    const agents = [
      {
        role: 'inbound_receptionist',
        name: `${businessName} - Receptionist`,
        llm_websocket_url: 'wss://api.retellai.com/llm-websocket',
        general_prompt: `You are a professional receptionist for ${businessName}. ${introSentence}
        
Your job is to:
- Answer incoming calls professionally
- Gather caller information (name, phone, reason for calling)
- Qualify leads based on their needs
- Schedule appointments or take messages
- Transfer urgent calls when appropriate

Communication style: ${intake?.communication_style || 'Professional and friendly'}
Services offered: ${intake?.services?.join(', ') || 'Various services'}
Business hours: ${intake?.business_hours || 'Monday-Friday 9am-5pm'}`,
      },
      {
        role: 'outbound_lead',
        name: `${businessName} - Outreach`,
        llm_websocket_url: 'wss://api.retellai.com/llm-websocket',
        general_prompt: `You are an outbound sales representative for ${businessName}.
        
Your job is to:
- Follow up with new leads within minutes of inquiry
- Qualify leads using our criteria
- Build rapport and understand their needs
- Book appointments with qualified prospects
- Handle objections professionally

Qualification criteria: ${intake?.qualification_criteria?.join(', ') || 'Budget, timeline, decision-maker'}
Unique selling points: ${intake?.unique_selling_points?.join(', ') || 'Quality service, competitive pricing'}`,
      },
      {
        role: 'appointment_setter',
        name: `${businessName} - Setter`,
        llm_websocket_url: 'wss://api.retellai.com/llm-websocket',
        general_prompt: `You are an appointment setter for ${businessName}.
        
Your job is to:
- Schedule appointments with qualified leads
- Confirm appointment details (date, time, location)
- Send appointment reminders
- Handle rescheduling requests
- Update the calendar accordingly

Appointment types: ${intake?.appointment_types?.join(', ') || 'Consultation, estimate, service call'}
Appointment duration: ${intake?.appointment_duration || '30-60 minutes'}`,
      },
    ];

    const deployedAgents: Record<string, string> = {};

    // Create each agent in Retell
    for (const agentConfig of agents) {
      try {
        console.log(`[Deploy Retell Agents] Creating agent: ${agentConfig.name}`);

        const response = await fetch('https://api.retellai.com/create-agent', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${workspace.api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agent_name: agentConfig.name,
            llm_websocket_url: agentConfig.llm_websocket_url,
            general_prompt: agentConfig.general_prompt,
            voice_id: '11labs-Adrian', // Default voice
            language: 'en-US',
            responsiveness: 0.9,
            interruption_sensitivity: 0.8,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Failed to create agent ${agentConfig.role}:`, errorData);
          continue;
        }

        const agentData = await response.json();
        deployedAgents[agentConfig.role] = agentData.agent_id;

        // Update agent_settings with Retell agent ID
        await supabase
          .from('agent_settings')
          .update({ retell_agent_id: agentData.agent_id })
          .eq('organization_id', organization_id)
          .eq('role', agentConfig.role);

        console.log(`[Deploy Retell Agents] Created ${agentConfig.role}: ${agentData.agent_id}`);
      } catch (error) {
        console.error(`Error creating agent ${agentConfig.role}:`, error);
      }
    }

    // Log completion
    await supabase.from('provisioning_events').insert({
      organization_id,
      step: 'deploying_agents',
      status: 'success',
      message: `Successfully deployed ${Object.keys(deployedAgents).length} agents`,
      details: { agents: deployedAgents },
    });

    // Update workspace last synced
    await supabase
      .from('retell_workspaces')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', workspace.id);

    return new Response(
      JSON.stringify({
        success: true,
        agents_deployed: Object.keys(deployedAgents).length,
        agent_ids: deployedAgents,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Deploy Retell Agents] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Deployment failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
