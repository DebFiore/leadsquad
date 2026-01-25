import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { leadService } from '@/services/leadService';
import { Lead, LeadInsert, LeadUpdate } from '@/types/leads';
import { toast } from 'sonner';

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (orgId: string, filters?: LeadFilters) => 
    [...leadKeys.lists(), orgId, filters] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  byCampaign: (campaignId: string) => [...leadKeys.all, 'campaign', campaignId] as const,
  imports: (orgId: string) => [...leadKeys.all, 'imports', orgId] as const,
  stats: (orgId: string) => [...leadKeys.all, 'stats', orgId] as const,
};

export interface LeadFilters {
  status?: Lead['lead_status'];
  campaignId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// Fetch all leads with optional filters
export function useLeads(filters?: LeadFilters) {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: leadKeys.list(organization?.id ?? '', filters),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      return leadService.getLeads(organization.id, {
        campaignId: filters?.campaignId,
        status: filters?.status,
        search: filters?.search,
        limit: filters?.limit,
        offset: filters?.offset,
      });
    },
    enabled: !!organization?.id,
  });
}

// Fetch a single lead
export function useLead(leadId: string | undefined) {
  return useQuery({
    queryKey: leadKeys.detail(leadId ?? ''),
    queryFn: async () => {
      if (!leadId) throw new Error('No lead ID');
      return leadService.getLead(leadId);
    },
    enabled: !!leadId,
  });
}

// Fetch leads by campaign
export function useLeadsByCampaign(campaignId: string | undefined) {
  return useQuery({
    queryKey: leadKeys.byCampaign(campaignId ?? ''),
    queryFn: async () => {
      if (!campaignId) throw new Error('No campaign ID');
      return leadService.getLeadsByCampaign(campaignId);
    },
    enabled: !!campaignId,
  });
}

// Fetch lead statistics
export function useLeadStats() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: leadKeys.stats(organization?.id ?? ''),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      return leadService.getLeadStats(organization.id);
    },
    enabled: !!organization?.id,
  });
}

// Create a single lead
export function useCreateLead() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Omit<LeadInsert, 'organization_id'>) => {
      if (!organization?.id) throw new Error('No organization');
      return leadService.createLead({
        ...data,
        organization_id: organization.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats(organization?.id ?? '') });
      toast.success('Lead created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create lead: ${error.message}`);
    },
  });
}

// Bulk create leads (for CSV import)
export function useBulkCreateLeads() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  
  return useMutation({
    mutationFn: async (leads: Array<Omit<LeadInsert, 'organization_id'>>) => {
      if (!organization?.id) throw new Error('No organization');
      return leadService.createLeads(
        leads.map(lead => ({ ...lead, organization_id: organization.id! }))
      );
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats(organization?.id ?? '') });
      toast.success(`${result.length} leads imported successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to import leads: ${error.message}`);
    },
  });
}

// Update a lead
export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LeadUpdate }) => {
      return leadService.updateLead(id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: leadKeys.detail(id) });
      const previousLead = queryClient.getQueryData<Lead>(leadKeys.detail(id));
      
      if (previousLead) {
        queryClient.setQueryData<Lead>(leadKeys.detail(id), {
          ...previousLead,
          ...data,
          updated_at: new Date().toISOString(),
        });
      }
      
      return { previousLead };
    },
    onError: (error, variables, context) => {
      if (context?.previousLead) {
        queryClient.setQueryData(leadKeys.detail(variables.id), context.previousLead);
      }
      toast.error(`Failed to update lead: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      toast.success('Lead updated successfully');
    },
  });
}

// Update lead status
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Lead['lead_status'] }) => {
      return leadService.updateLeadStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats(organization?.id ?? '') });
      toast.success('Lead status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}

// Delete a lead
export function useDeleteLead() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  
  return useMutation({
    mutationFn: async (leadId: string) => {
      return leadService.deleteLead(leadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats(organization?.id ?? '') });
      toast.success('Lead deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete lead: ${error.message}`);
    },
  });
}

// Bulk delete leads
export function useBulkDeleteLeads() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  
  return useMutation({
    mutationFn: async (leadIds: string[]) => {
      return leadService.deleteLeads(leadIds);
    },
    onSuccess: (_, deletedIds) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats(organization?.id ?? '') });
      toast.success(`${deletedIds.length} leads deleted`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete leads: ${error.message}`);
    },
  });
}

// Assign lead to campaign
export function useAssignLeadToCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, campaignId }: { leadId: string; campaignId: string | null }) => {
      return leadService.assignToCampaign(leadId, campaignId);
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      if (campaignId) {
        queryClient.invalidateQueries({ queryKey: leadKeys.byCampaign(campaignId) });
      }
      toast.success('Lead assigned to campaign');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign lead: ${error.message}`);
    },
  });
}

// Get import history
export function useLeadImports() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: leadKeys.imports(organization?.id ?? ''),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      return leadService.getImports(organization.id);
    },
    enabled: !!organization?.id,
  });
}
