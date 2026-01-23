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

    const { organization_id, period_start, period_end } = await req.json();

    if (!organization_id) {
      return new Response(
        JSON.stringify({ error: 'organization_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Get Retell Usage] Fetching usage for org: ${organization_id}`);

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

    // Calculate date range (default to current month)
    const now = new Date();
    const startDate = period_start || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endDate = period_end || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // Fetch calls from Retell API
    const response = await fetch('https://api.retellai.com/list-calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${workspace.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter_criteria: {
          start_timestamp: Math.floor(new Date(startDate).getTime() / 1000),
          end_timestamp: Math.floor(new Date(endDate).getTime() / 1000),
        },
        limit: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to fetch Retell calls:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch usage from Retell' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const callsData = await response.json();
    const calls = callsData || [];

    // Calculate usage metrics
    let totalMinutes = 0;
    let inboundMinutes = 0;
    let outboundMinutes = 0;
    const agentBreakdown: Record<string, { minutes: number; calls: number; name: string }> = {};

    for (const call of calls) {
      const durationMinutes = (call.end_timestamp - call.start_timestamp) / 60;
      totalMinutes += durationMinutes;

      if (call.direction === 'inbound') {
        inboundMinutes += durationMinutes;
      } else {
        outboundMinutes += durationMinutes;
      }

      const agentId = call.agent_id || 'unknown';
      if (!agentBreakdown[agentId]) {
        agentBreakdown[agentId] = { minutes: 0, calls: 0, name: call.agent_name || 'Unknown Agent' };
      }
      agentBreakdown[agentId].minutes += durationMinutes;
      agentBreakdown[agentId].calls += 1;
    }

    // Estimate cost (Retell's approximate pricing)
    const costPerMinute = 0.10;
    const totalCost = totalMinutes * costPerMinute;

    const usageData = {
      organization_id,
      period_start: startDate,
      period_end: endDate,
      total_minutes: Math.round(totalMinutes * 100) / 100,
      total_calls: calls.length,
      inbound_minutes: Math.round(inboundMinutes * 100) / 100,
      outbound_minutes: Math.round(outboundMinutes * 100) / 100,
      cost_usd: Math.round(totalCost * 100) / 100,
      breakdown_by_agent: Object.entries(agentBreakdown).map(([agent_id, data]) => ({
        agent_id,
        agent_name: data.name,
        minutes: Math.round(data.minutes * 100) / 100,
        calls: data.calls,
      })),
    };

    // Cache usage data in database
    await supabase.from('usage_cache').upsert({
      organization_id,
      period_start: startDate,
      period_end: endDate,
      data: usageData,
      cached_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,period_start' });

    return new Response(
      JSON.stringify(usageData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Get Retell Usage] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to get usage' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
