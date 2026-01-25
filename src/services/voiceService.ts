import { supabase } from '@/lib/supabase';
import { Voice } from '@/types/voice';

export const voiceService = {
  // Get all active voices
  async getVoices(): Promise<Voice[]> {
    const { data, error } = await supabase
      .from('voice_library')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get voices by provider
  async getVoicesByProvider(provider: Voice['voice_provider']): Promise<Voice[]> {
    const { data, error } = await supabase
      .from('voice_library')
      .select('*')
      .eq('voice_provider', provider)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get a single voice by ID
  async getVoice(id: string): Promise<Voice | null> {
    const { data, error } = await supabase
      .from('voice_library')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Get voice by provider voice ID
  async getVoiceByProviderId(providerVoiceId: string): Promise<Voice | null> {
    const { data, error } = await supabase
      .from('voice_library')
      .select('*')
      .eq('provider_voice_id', providerVoiceId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Admin: Create a new voice
  async createVoice(voice: Omit<Voice, 'id' | 'created_at' | 'updated_at'>): Promise<Voice> {
    const { data, error } = await supabase
      .from('voice_library')
      .insert(voice)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin: Update a voice
  async updateVoice(id: string, updates: Partial<Voice>): Promise<Voice> {
    const { data, error } = await supabase
      .from('voice_library')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin: Delete a voice
  async deleteVoice(id: string): Promise<void> {
    const { error } = await supabase
      .from('voice_library')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Admin: Toggle voice active status
  async toggleVoiceActive(id: string, isActive: boolean): Promise<Voice> {
    return this.updateVoice(id, { is_active: isActive });
  },
};
