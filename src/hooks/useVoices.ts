import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Voice {
  id: string;
  provider_voice_id: string;
  name: string;
  provider: string;
  accent: string | null;
  gender: string | null;
  age: string | null;
  preview_url: string | null;
  is_active: boolean;
}

export function useVoices() {
  return useQuery({
    queryKey: ['voices'],
    queryFn: async (): Promise<Voice[]> => {
      const { data, error } = await supabase
        .from('voice_library')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching voices:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}

export function useVoiceById(voiceId: string | null) {
  const { data: voices } = useVoices();

  if (!voiceId || !voices) return null;

  return voices.find(v => v.provider_voice_id === voiceId) || null;
}
