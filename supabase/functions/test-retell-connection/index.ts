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

    console.log(`[Test Retell Connection] Testing for org: ${organization_id}`);

    // Get workspace credentials
    const { data: workspace, error: workspaceError } = await supabase
      .from('retell_workspaces')
      .select('*')
      .eq('organization_id', organization_id)
      .single();

    if (workspaceError || !workspace) {
      return new Response(
        JSON.stringify({ success: false, error: 'Retell workspace not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test API connection by listing agents
    const response = await fetch('https://api.retellai.com/list-agents', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${workspace.api_key}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Update connection status
      await supabase
        .from('retell_workspaces')
        .update({ 
          is_connected: true,
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', workspace.id);

      return new Response(
        JSON.stringify({ success: true, message: 'Connection successful' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const errorData = await response.json().catch(() => ({}));
    
    // Update connection status as failed
    await supabase
      .from('retell_workspaces')
      .update({ is_connected: false })
      .eq('id', workspace.id);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorData.message || `API returned status ${response.status}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Test Retell Connection] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
