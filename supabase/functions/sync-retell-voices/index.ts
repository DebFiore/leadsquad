import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// External Supabase instance (LeadSquad production)
const EXTERNAL_SUPABASE_URL = 'https://gcqqqbeufblpzdcwxoxi.supabase.co';

interface RetellVoice {
  voice_id: string;
  voice_name: string;
  provider: 'elevenlabs' | 'openai' | 'deepgram' | 'playht';
  accent?: string;
  gender?: 'male' | 'female';
  age?: string;
  preview_audio_url?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use the external Supabase service role key (stored in Lovable Cloud secrets)
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const retellApiKey = Deno.env.get('RETELL_API_KEY');

    if (!retellApiKey) {
      return new Response(
        JSON.stringify({ error: 'RETELL_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Connect to external LeadSquad Supabase instance
    const supabase = createClient(EXTERNAL_SUPABASE_URL, supabaseServiceKey);

    console.log('[Sync Retell Voices] Fetching voices from Retell API...');

    // Fetch voices from Retell API
    const retellResponse = await fetch('https://api.retellai.com/list-voices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!retellResponse.ok) {
      const errorText = await retellResponse.text();
      console.error('[Sync Retell Voices] Retell API error:', retellResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Retell API error: ${retellResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const voices: RetellVoice[] = await retellResponse.json();
    console.log(`[Sync Retell Voices] Fetched ${voices.length} voices from Retell`);

    // Get existing Retell voices from our database
    const { data: existingVoices } = await supabase
      .from('voice_library')
      .select('provider_voice_id')
      .eq('voice_provider', 'retell');

    const existingIds = new Set(existingVoices?.map(v => v.provider_voice_id) || []);

    // Prepare voices for upsert
    const voicesToUpsert = voices.map((voice, index) => {
      // Map Retell gender to our gender type
      let mappedGender: 'male' | 'female' | 'neutral' | null = null;
      if (voice.gender === 'male') mappedGender = 'male';
      else if (voice.gender === 'female') mappedGender = 'female';

      return {
        voice_name: voice.voice_name,
        voice_provider: 'retell' as const,
        provider_voice_id: voice.voice_id,
        gender: mappedGender,
        accent: voice.accent || null,
        language: 'en-US', // Default language
        description: `${voice.provider} voice${voice.age ? ` (${voice.age})` : ''}${voice.accent ? ` - ${voice.accent} accent` : ''}`,
        sample_audio_url: voice.preview_audio_url || null,
        is_active: true,
        is_premium: false,
        display_order: 1000 + index, // Put new voices at the end
        tags: [voice.provider, voice.gender, voice.accent].filter(Boolean) as string[],
      };
    });

    // Count new voices
    const newVoices = voicesToUpsert.filter(v => !existingIds.has(v.provider_voice_id));
    const updatedVoices = voicesToUpsert.filter(v => existingIds.has(v.provider_voice_id));

    // Upsert voices to database
    const { error: upsertError } = await supabase
      .from('voice_library')
      .upsert(voicesToUpsert, { 
        onConflict: 'voice_provider,provider_voice_id',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('[Sync Retell Voices] Upsert error:', upsertError);
      return new Response(
        JSON.stringify({ error: `Database error: ${upsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Sync Retell Voices] Synced ${voicesToUpsert.length} voices (${newVoices.length} new, ${updatedVoices.length} updated)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        total: voicesToUpsert.length,
        new: newVoices.length,
        updated: updatedVoices.length,
        voices: voicesToUpsert.map(v => ({ name: v.voice_name, id: v.provider_voice_id }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Sync Retell Voices] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Sync failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
