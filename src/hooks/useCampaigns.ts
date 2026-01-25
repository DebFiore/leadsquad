import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { campaignService } from '@/services/campaignService';
import { Campaign, CampaignInsert, CampaignUpdate } from '@/types/campaigns';
import { toast } from 'sonner';

// Query keys factory for type-safe keys
export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (orgId: string) => [...campaignKeys.lists(), orgId] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  stats: (orgId: string) => [...campaignKeys.all, 'stats', orgId] as const,
};

// Fetch all campaigns for the organization
export function useCampaigns() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: campaignKeys.list(organization?.id ?? ''),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      return campaignService.getCampaigns(organization.id);
    },
    enabled: !!organization?.id,
  });
}

// Fetch a single campaign by ID
export function useCampaign(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignKeys.detail(campaignId ?? ''),
    queryFn: async () => {
      if (!campaignId) throw new Error('No campaign ID');
      return campaignService.getCampaign(campaignId);
    },
    enabled: !!campaignId,
  });
}

// Fetch campaign statistics
export function useCampaignStats() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: campaignKeys.stats(organization?.id ?? ''),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      return campaignService.getCampaignStats(organization.id);
    },
    enabled: !!organization?.id,
  });
}

// Create a new campaign
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Omit<CampaignInsert, 'organization_id'>) => {
      if (!organization?.id) throw new Error('No organization');
      return campaignService.createCampaign({
        ...data,
        organization_id: organization.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.stats(organization?.id ?? '') });
      toast.success('Campaign created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create campaign: ${error.message}`);
    },
  });
}

// Update an existing campaign
export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CampaignUpdate }) => {
      return campaignService.updateCampaign(id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: campaignKeys.detail(id) });
      const previousCampaign = queryClient.getQueryData<Campaign>(campaignKeys.detail(id));
      
      if (previousCampaign) {
        queryClient.setQueryData<Campaign>(campaignKeys.detail(id), {
          ...previousCampaign,
          ...data,
          updated_at: new Date().toISOString(),
        });
      }
      
      return { previousCampaign };
    },
    onError: (error, variables, context) => {
      if (context?.previousCampaign) {
        queryClient.setQueryData(campaignKeys.detail(variables.id), context.previousCampaign);
      }
      toast.error(`Failed to update campaign: ${error.message}`);
    },
    onSuccess: (updatedCampaign) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.setQueryData(campaignKeys.detail(updatedCampaign.id), updatedCampaign);
      toast.success('Campaign updated successfully');
    },
  });
}

// Delete a campaign
export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  
  return useMutation({
    mutationFn: async (campaignId: string) => {
      return campaignService.deleteCampaign(campaignId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.list(organization?.id ?? '') });
      queryClient.invalidateQueries({ queryKey: campaignKeys.stats(organization?.id ?? '') });
      toast.success('Campaign deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete campaign: ${error.message}`);
    },
  });
}

// Toggle campaign status (activate/pause)
export function useToggleCampaignStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Campaign['status'] }) => {
      return campaignService.updateCampaignStatus(id, status);
    },
    onSuccess: (updatedCampaign) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.setQueryData(campaignKeys.detail(updatedCampaign.id), updatedCampaign);
      toast.success(`Campaign ${updatedCampaign.status === 'active' ? 'activated' : 'paused'}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update campaign status: ${error.message}`);
    },
  });
}
