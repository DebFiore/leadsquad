import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const dashboardKeys = {
  stats: (orgId: string) => ['dashboard', 'stats', orgId] as const,
  activity: (orgId: string) => ['dashboard', 'activity', orgId] as const,
};

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  newLeadsThisWeek: number;
  totalCalls: number;
  callsThisWeek: number;
  totalMinutes: number;
  appointmentsSet: number;
  conversionRate: number;
}

// Fetch aggregated dashboard statistics
export function useDashboardStats() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: dashboardKeys.stats(organization?.id ?? ''),
    queryFn: async (): Promise<DashboardStats> => {
      if (!organization?.id) throw new Error('No organization');
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneWeekAgoISO = oneWeekAgo.toISOString();
      
      // Fetch all stats in parallel
      const [
        campaignsResult,
        leadsResult,
        callsResult,
        appointmentsResult,
      ] = await Promise.all([
        // Campaigns count
        supabase
          .from('campaigns')
          .select('id, status', { count: 'exact' })
          .eq('organization_id', organization.id),
        
        // Leads count
        supabase
          .from('leads')
          .select('id, created_at', { count: 'exact' })
          .eq('organization_id', organization.id),
        
        // Calls count and minutes
        supabase
          .from('call_logs')
          .select('id, duration_seconds, created_at, call_status')
          .eq('organization_id', organization.id),
        
        // Appointments
        supabase
          .from('call_logs')
          .select('id', { count: 'exact' })
          .eq('organization_id', organization.id)
          .eq('appointment_set', true),
      ]);
      
      const campaigns = campaignsResult.data || [];
      const leads = leadsResult.data || [];
      const calls = callsResult.data || [];
      
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
      const newLeadsThisWeek = leads.filter(l => l.created_at >= oneWeekAgoISO).length;
      const callsThisWeek = calls.filter(c => c.created_at >= oneWeekAgoISO).length;
      const totalMinutes = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / 60;
      const completedCalls = calls.filter(c => c.call_status === 'completed').length;
      
      return {
        totalCampaigns: campaigns.length,
        activeCampaigns,
        totalLeads: leads.length,
        newLeadsThisWeek,
        totalCalls: calls.length,
        callsThisWeek,
        totalMinutes: Math.round(totalMinutes * 10) / 10,
        appointmentsSet: appointmentsResult.count || 0,
        conversionRate: completedCalls > 0 
          ? Math.round(((appointmentsResult.count || 0) / completedCalls) * 100) 
          : 0,
      };
    },
    enabled: !!organization?.id,
    refetchInterval: 1000 * 60 * 2, // Refresh every 2 minutes
  });
}

export interface ActivityItem {
  type: 'call' | 'lead';
  id: string;
  description: string;
  detail: string;
  created_at: string;
}

// Fetch recent activity for dashboard feed
export function useRecentActivity(limit = 10) {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: [...dashboardKeys.activity(organization?.id ?? ''), limit],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!organization?.id) throw new Error('No organization');
      
      // Get recent calls and leads mixed
      const [callsResult, leadsResult] = await Promise.all([
        supabase
          .from('call_logs')
          .select('id, call_type, call_status, phone_number, duration_seconds, created_at')
          .eq('organization_id', organization.id)
          .order('created_at', { ascending: false })
          .limit(limit),
        
        supabase
          .from('leads')
          .select('id, first_name, last_name, lead_status, created_at')
          .eq('organization_id', organization.id)
          .order('created_at', { ascending: false })
          .limit(limit),
      ]);
      
      // Combine and sort by created_at
      const activities: ActivityItem[] = [
        ...(callsResult.data || []).map(call => ({
          type: 'call' as const,
          id: call.id,
          description: `${call.call_type} call - ${call.call_status}`,
          detail: call.phone_number,
          created_at: call.created_at,
        })),
        ...(leadsResult.data || []).map(lead => ({
          type: 'lead' as const,
          id: lead.id,
          description: `New lead: ${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'New lead',
          detail: lead.lead_status,
          created_at: lead.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, limit);
      
      return activities;
    },
    enabled: !!organization?.id,
    refetchInterval: 1000 * 30, // Refresh every 30 seconds
  });
}
