// api/voices/sync-retell.ts
import type { VercelRequest, VercelResponse } from '../lib/types.js';
import { createClient } from '@supabase/supabase-js';

interface RetellVoice {
  voice_id: string;
  voice_name: string;
  provider: 'elevenlabs' | 'openai' | 'deepgram' | 'playht';
  accent?: string;
  gender?: 'male' | 'female';
  age?: string;
  preview_audio_url?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate admin secret
    const authHeader = req.headers['authorization'];
    const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : '';
    const adminSecret = process.env.ADMIN_SYNC_SECRET;

    if (!adminSecret || token !== adminSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const retellApiKey = process.env.RETELL_API_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }

    if (!retellApiKey) {
      return res.status(500).json({ error: 'RETELL_API_KEY is not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      return res.status(500).json({ error: `Retell API error: ${retellResponse.status}` });
    }

    const voices: RetellVoice[] = await retellResponse.json();
    console.log(`[Sync Retell Voices] Fetched ${voices.length} voices from Retell`);

    // Get existing Retell voices from database
    const { data: existingVoices } = await supabase
      .from('voice_library')
      .select('provider_voice_id')
      .eq('voice_provider', 'retell');

    const existingIds = new Set(existingVoices?.map(v => v.provider_voice_id) || []);

    // Prepare voices for upsert
    const voicesToUpsert = voices.map((voice, index) => {
      let mappedGender: 'male' | 'female' | 'neutral' | null = null;
      if (voice.gender === 'male') mappedGender = 'male';
      else if (voice.gender === 'female') mappedGender = 'female';

      return {
        voice_name: voice.voice_name,
        voice_provider: 'retell' as const,
        provider_voice_id: voice.voice_id,
        gender: mappedGender,
        accent: voice.accent || null,
        language: 'en-US',
        description: `${voice.provider} voice${voice.age ? ` (${voice.age})` : ''}${voice.accent ? ` - ${voice.accent} accent` : ''}`,
        sample_audio_url: voice.preview_audio_url || null,
        is_active: true,
        is_premium: false,
        display_order: 1000 + index,
        tags: [voice.provider, voice.gender, voice.accent].filter(Boolean) as string[],
      };
    });

    // Count new vs updated
    const newVoices = voicesToUpsert.filter(v => !existingIds.has(v.provider_voice_id));
    const updatedVoices = voicesToUpsert.filter(v => existingIds.has(v.provider_voice_id));

    // Upsert voices to database
    const { error: upsertError } = await supabase
      .from('voice_library')
      .upsert(voicesToUpsert, {
        onConflict: 'voice_provider,provider_voice_id',
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error('[Sync Retell Voices] Upsert error:', upsertError);
      return res.status(500).json({ error: `Database error: ${upsertError.message}` });
    }

    console.log(`[Sync Retell Voices] Synced ${voicesToUpsert.length} voices (${newVoices.length} new, ${updatedVoices.length} updated)`);

    return res.status(200).json({
      success: true,
      total: voicesToUpsert.length,
      new: newVoices.length,
      updated: updatedVoices.length,
      voices: voicesToUpsert.map(v => ({ name: v.voice_name, id: v.provider_voice_id })),
    });

  } catch (error: any) {
    console.error('[Sync Retell Voices] Error:', error);
    return res.status(500).json({ error: error.message || 'Sync failed' });
  }
}
