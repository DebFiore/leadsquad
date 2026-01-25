// Call log hooks for React Query
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { callLogService } from '@/services/callLogService';
import { CallStatus } from '@/types/calls';

export const callLogKeys = {
  all: ['callLogs'] as const,
  lists: () => [...callLogKeys.all, 'list'] as const,
  list: (orgId: string, filters?: CallLogFilters) => 
    [...callLogKeys.lists(), orgId, filters] as const,
  detail: (id: string) => [...callLogKeys.all, 'detail', id] as const,
  byCampaign: (campaignId: string) => [...callLogKeys.all, 'campaign', campaignId] as const,
  byLead: (leadId: string) => [...callLogKeys.all, 'lead', leadId] as const,
  stats: (orgId: string, dateRange?: { start: string; end: string }) => 
    [...callLogKeys.all, 'stats', orgId, dateRange] as const,
  recent: (orgId: string, limit: number) => [...callLogKeys.all, 'recent', orgId, limit] as const,
};

export interface CallLogFilters {
  campaignId?: string;
  leadId?: string;
  status?: CallStatus;
  callType?: 'inbound' | 'outbound';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Fetch call logs with filters
export function useCallLogs(filters?: CallLogFilters) {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: callLogKeys.list(organization?.id ?? '', filters),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      return callLogService.getCallLogs(organization.id, filters);
    },
    enabled: !!organization?.id,
  });
}

// Fetch a single call log with full details
export function useCallLog(callId: string | undefined) {
  return useQuery({
    queryKey: callLogKeys.detail(callId ?? ''),
    queryFn: async () => {
      if (!callId) throw new Error('No call ID');
      return callLogService.getCallLog(callId);
    },
    enabled: !!callId,
  });
}

// Fetch call logs for a specific campaign
export function useCallLogsByCampaign(campaignId: string | undefined) {
  return useQuery({
    queryKey: callLogKeys.byCampaign(campaignId ?? ''),
    queryFn: async () => {
      if (!campaignId) throw new Error('No campaign ID');
      return callLogService.getCampaignCalls(campaignId);
    },
    enabled: !!campaignId,
  });
}

// Fetch call logs for a specific lead
export function useCallLogsByLead(leadId: string | undefined) {
  return useQuery({
    queryKey: callLogKeys.byLead(leadId ?? ''),
    queryFn: async () => {
      if (!leadId) throw new Error('No lead ID');
      return callLogService.getLeadCalls(leadId);
    },
    enabled: !!leadId,
  });
}

// Fetch recent calls (for dashboard)
export function useRecentCalls(limit = 10) {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: callLogKeys.recent(organization?.id ?? '', limit),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      return callLogService.getRecentCalls(organization.id, limit);
    },
    enabled: !!organization?.id,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  });
}

// Fetch call statistics
export function useCallStats(dateRange?: { start: string; end: string }) {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: callLogKeys.stats(organization?.id ?? '', dateRange),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      return callLogService.getCallStats(organization.id, dateRange);
    },
    enabled: !!organization?.id,
  });
}

// Hook to invalidate call logs (useful after webhook updates)
export function useInvalidateCallLogs() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: callLogKeys.lists() });
    if (organization?.id) {
      queryClient.invalidateQueries({ queryKey: callLogKeys.stats(organization.id) });
    }
  };
}
