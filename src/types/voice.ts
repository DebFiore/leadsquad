// src/types/voice.ts
// TypeScript types for voice library

export type VoiceProvider = 'retell' | 'vapi' | 'elevenlabs';
export type VoiceGender = 'male' | 'female' | 'neutral';

export interface Voice {
  id: string;
  voice_name: string;
  voice_provider: VoiceProvider;
  provider_voice_id: string;
  gender: VoiceGender | null;
  accent: string | null;
  language: string;
  description: string | null;
  sample_audio_url: string | null;
  is_active: boolean;
  is_premium: boolean;
  display_order: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}
