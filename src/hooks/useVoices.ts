import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voiceService } from '@/services/voiceService';
import { Voice } from '@/types/voice';
import { toast } from 'sonner';


export const voiceKeys = {
  all: ['voices'] as const,
  list: () => [...voiceKeys.all, 'list'] as const,
  detail: (id: string) => [...voiceKeys.all, 'detail', id] as const,
  byProvider: (provider: string) => [...voiceKeys.all, 'provider', provider] as const,
};

// Fetch all active voices (for campaign voice selection)
export function useVoices() {
  return useQuery({
    queryKey: voiceKeys.list(),
    queryFn: async () => {
      return voiceService.getVoices();
    },
    staleTime: 1000 * 60 * 10, // Voices don't change often, cache for 10 min
  });
}

// Fetch voices by provider
export function useVoicesByProvider(provider: Voice['voice_provider']) {
  return useQuery({
    queryKey: voiceKeys.byProvider(provider),
    queryFn: async () => {
      return voiceService.getVoicesByProvider(provider);
    },
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch a single voice
export function useVoice(voiceId: string | undefined) {
  return useQuery({
    queryKey: voiceKeys.detail(voiceId ?? ''),
    queryFn: async () => {
      if (!voiceId) throw new Error('No voice ID');
      return voiceService.getVoice(voiceId);
    },
    enabled: !!voiceId,
  });
}

// Admin: Create a new voice
export function useCreateVoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Voice, 'id' | 'created_at' | 'updated_at'>) => {
      return voiceService.createVoice(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceKeys.all });
      toast.success('Voice added to library');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add voice: ${error.message}`);
    },
  });
}

// Admin: Update a voice
export function useUpdateVoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Voice> }) => {
      return voiceService.updateVoice(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceKeys.all });
      toast.success('Voice updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update voice: ${error.message}`);
    },
  });
}

// Admin: Delete a voice
export function useDeleteVoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (voiceId: string) => {
      return voiceService.deleteVoice(voiceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceKeys.all });
      toast.success('Voice removed from library');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete voice: ${error.message}`);
    },
  });
}

// Admin: Toggle voice active status
export function useToggleVoiceActive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return voiceService.toggleVoiceActive(id, isActive);
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: voiceKeys.all });
      toast.success(`Voice ${isActive ? 'activated' : 'deactivated'}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle voice: ${error.message}`);
    },
  });
}

// Admin: Sync voices from Retell API
export function useSyncRetellVoices() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (adminSecret: string) => {
      // Determine API base URL based on current hostname
      const hostname = window.location.hostname;
      const isProduction = hostname.includes('leadsquad.ai') || hostname.includes('app.leadsquad.ai');
      const apiBase = isProduction ? '' : 'https://app.leadsquad.ai';
      
      const response = await fetch(`${apiBase}/api/voices/sync-retell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSecret}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }
      
      const data = await response.json();
      if (data?.error) throw new Error(data.error);
      
      return data as { success: boolean; total: number; new: number; updated: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: voiceKeys.all });
      toast.success(`Synced ${data.total} Retell voices (${data.new} new, ${data.updated} updated)`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync Retell voices: ${error.message}`);
    },
  });
}
