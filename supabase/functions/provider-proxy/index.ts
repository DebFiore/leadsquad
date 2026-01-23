import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProxyRequest {
  organization_id: string;
  provider: 'vapi' | 'retell';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { organization_id, provider, endpoint, method, body }: ProxyRequest = await req.json();

    // Validate required fields
    if (!organization_id || !provider || !endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: organization_id, provider, endpoint' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Provider Proxy] Org: ${organization_id}, Provider: ${provider}, Endpoint: ${endpoint}`);

    // Fetch the organization's API key for this provider
    const { data: providerSettings, error: settingsError } = await supabase
      .from('provider_settings')
      .select('api_key, is_connected')
      .eq('organization_id', organization_id)
      .eq('provider', provider)
      .maybeSingle();

    if (settingsError) {
      console.error('[Provider Proxy] Error fetching provider settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch provider settings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!providerSettings || !providerSettings.api_key || !providerSettings.is_connected) {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} is not connected for this organization` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine the base URL for the provider
    const baseUrls: Record<string, string> = {
      vapi: 'https://api.vapi.ai',
      retell: 'https://api.retellai.com',
    };

    const baseUrl = baseUrls[provider];
    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: `Unknown provider: ${provider}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the full URL
    const fullUrl = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    console.log(`[Provider Proxy] Making ${method} request to ${fullUrl}`);

    // Make the proxied request with the org's API key
    const proxyResponse = await fetch(fullUrl, {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${providerSettings.api_key}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await proxyResponse.json().catch(() => ({}));

    // Log the API call for billing/analytics
    try {
      await supabase.from('api_usage_logs').insert({
        organization_id,
        provider,
        endpoint,
        method: method || 'GET',
        status_code: proxyResponse.status,
        response_size: JSON.stringify(responseData).length,
      });
    } catch (logError) {
      console.log('[Provider Proxy] Failed to log API usage:', logError);
    }

    return new Response(
      JSON.stringify({
        success: proxyResponse.ok,
        status: proxyResponse.status,
        data: responseData,
      }),
      { 
        status: proxyResponse.ok ? 200 : proxyResponse.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[Provider Proxy] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Proxy request failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
