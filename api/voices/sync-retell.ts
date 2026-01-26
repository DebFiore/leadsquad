import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RetellVoice {
  voice_id: string;
  voice_name: string;
  provider: 'elevenlabs' | 'openai' | 'deepgram';
  accent?: string;
  gender?: 'male' | 'female';
  age?: string;
  preview_audio_url?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple auth check - require admin secret or auth header
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SYNC_SECRET;

  if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const retellApiKey = process.env.RETELL_API_KEY;

  if (!retellApiKey) {
    return res.status(500).json({ error: 'RETELL_API_KEY not configured' });
  }

  try {
    // Fetch voices from Retell API
    const response = await fetch('https://api.retellai.com/list-voices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Retell API error:', errorText);
      return res.status(response.status).json({ error: 'Failed to fetch voices from Retell' });
    }

    const voices: RetellVoice[] = await response.json();

    console.log(`Fetched ${voices.length} voices from Retell`);

    // Transform and upsert voices to database
    const voicesToUpsert = voices.map((voice) => ({
      provider_voice_id: voice.voice_id,
      name: voice.voice_name,
      provider: 'retell' as const,
      accent: voice.accent || null,
      gender: voice.gender || null,
      age: voice.age || null,
      preview_url: voice.preview_audio_url || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    }));

    // Upsert voices (insert or update on conflict)
    const { data, error } = await supabase
      .from('voice_library')
      .upsert(voicesToUpsert, {
        onConflict: 'provider_voice_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ error: 'Failed to save voices to database', details: error.message });
    }

    return res.status(200).json({
      success: true,
      message: `Synced ${voices.length} voices from Retell`,
      count: voices.length,
    });

  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({
      error: 'Failed to sync voices',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
