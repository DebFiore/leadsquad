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

    const { organization_id, resource_type } = await req.json();

    if (!organization_id) {
      return new Response(
        JSON.stringify({ error: 'organization_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Sync Retell Resources] Syncing ${resource_type} for org: ${organization_id}`);

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

    const results: Record<string, unknown[]> = {};

    // Sync phone numbers
    if (!resource_type || resource_type === 'phone_numbers') {
      const phoneResponse = await fetch('https://api.retellai.com/list-phone-numbers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${workspace.api_key}`,
          'Content-Type': 'application/json',
        },
      });

      if (phoneResponse.ok) {
        const phoneData = await phoneResponse.json();
        const phoneNumbers = phoneData || [];

        // Get agent assignments from our database
        const { data: agentSettings } = await supabase
          .from('agent_settings')
          .select('role, retell_agent_id')
          .eq('organization_id', organization_id);

        const agentRoleMap = new Map(
          agentSettings?.map(a => [a.retell_agent_id, a.role]) || []
        );

        // Upsert phone numbers to database
        for (const phone of phoneNumbers) {
          const agentRole = phone.inbound_agent_id ? agentRoleMap.get(phone.inbound_agent_id) : null;

          await supabase.from('retell_phone_numbers').upsert({
            organization_id,
            phone_number: phone.phone_number,
            retell_phone_id: phone.phone_number_id,
            nickname: phone.nickname || null,
            agent_id: phone.inbound_agent_id || null,
            agent_role: agentRole || null,
            is_active: phone.is_active !== false,
          }, { onConflict: 'organization_id,phone_number' });
        }

        results.phone_numbers = phoneNumbers.map((p: { phone_number: string; phone_number_id: string; nickname: string | null; inbound_agent_id: string | null; is_active: boolean }) => ({
          phone_number: p.phone_number,
          nickname: p.nickname,
          agent_id: p.inbound_agent_id,
          is_active: p.is_active !== false,
        }));

        console.log(`[Sync Retell Resources] Synced ${phoneNumbers.length} phone numbers`);
      }
    }

    // Sync agents
    if (!resource_type || resource_type === 'agents') {
      const agentResponse = await fetch('https://api.retellai.com/list-agents', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${workspace.api_key}`,
          'Content-Type': 'application/json',
        },
      });

      if (agentResponse.ok) {
        const agentData = await agentResponse.json();
        results.agents = agentData || [];
        console.log(`[Sync Retell Resources] Synced ${results.agents.length} agents`);
      }
    }

    // Update workspace last synced
    await supabase
      .from('retell_workspaces')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', workspace.id);

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Sync Retell Resources] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Sync failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
