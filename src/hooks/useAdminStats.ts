import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { subDays, format, startOfDay, eachDayOfInterval } from 'date-fns';

export const adminStatsKeys = {
  all: ['admin', 'stats'] as const,
  platform: () => [...adminStatsKeys.all, 'platform'] as const,
  revenue: (range: string) => [...adminStatsKeys.all, 'revenue', range] as const,
  userGrowth: (range: string) => [...adminStatsKeys.all, 'userGrowth', range] as const,
  activity: (limit: number) => [...adminStatsKeys.all, 'activity', limit] as const,
  organizations: () => [...adminStatsKeys.all, 'organizations'] as const,
};

export function usePlatformStats() {
  return useQuery({
    queryKey: adminStatsKeys.platform(),
    queryFn: async () => {
      // Get organization count
      const { count: orgCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      // Get user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get call stats
      const { data: calls } = await supabase
        .from('call_logs')
        .select('duration_seconds, appointment_set');

      const totalCalls = calls?.length || 0;
      const totalMinutes = (calls || []).reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / 60;
      const totalAppointments = (calls || []).filter(c => c.appointment_set).length;

      // Get active campaigns
      const { count: activeCampaigns } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get subscription distribution
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('plan_name, status')
        .eq('status', 'active');

      const planDistribution = [
        { name: 'Starter', value: subscriptions?.filter(s => s.plan_name === 'starter').length || 0 },
        { name: 'Professional', value: subscriptions?.filter(s => s.plan_name === 'professional').length || 0 },
        { name: 'Enterprise', value: subscriptions?.filter(s => s.plan_name === 'enterprise').length || 0 },
      ].filter(p => p.value > 0);

      // Calculate revenue (simplified - based on plan counts)
      const monthlyRevenue = 
        (planDistribution.find(p => p.name === 'Starter')?.value || 0) * 99 +
        (planDistribution.find(p => p.name === 'Professional')?.value || 0) * 299 +
        (planDistribution.find(p => p.name === 'Enterprise')?.value || 0) * 799;

      return {
        totalOrganizations: orgCount || 0,
        activeUsers: userCount || 0,
        totalCalls,
        totalMinutes: Math.round(totalMinutes),
        totalAppointments,
        activeCampaigns: activeCampaigns || 0,
        monthlyRevenue,
        avgConversionRate: totalCalls > 0 ? (totalAppointments / totalCalls) * 100 : 0,
        planDistribution,
        // Growth percentages (would need historical data in production)
        orgGrowth: 12,
        userGrowth: 8,
        callGrowth: 15,
        revenueGrowth: 10,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRevenueData(range: '7d' | '30d' | '90d') {
  return useQuery({
    queryKey: adminStatsKeys.revenue(range),
    queryFn: async () => {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      const startDate = startOfDay(subDays(new Date(), days));
      
      // Get daily usage costs
      const { data: usage } = await supabase
        .from('billing_usage')
        .select('usage_date, cost_amount')
        .gte('usage_date', format(startDate, 'yyyy-MM-dd'))
        .order('usage_date');

      // Create date range
      const dateRange = eachDayOfInterval({
        start: startDate,
        end: new Date(),
      });

      // Map data to date range
      return dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayUsage = usage?.filter(u => u.usage_date === dateStr) || [];
        const revenue = dayUsage.reduce((sum, u) => sum + (u.cost_amount || 0), 0);
        
        return {
          date: dateStr,
          revenue: revenue * 2, // Simplified markup calculation
        };
      });
    },
  });
}

export function useUserGrowth(range: '7d' | '30d' | '90d') {
  return useQuery({
    queryKey: adminStatsKeys.userGrowth(range),
    queryFn: async () => {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      const startDate = startOfDay(subDays(new Date(), days));
      
      const { data: orgs } = await supabase
        .from('organizations')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      // Create date range
      const dateRange = eachDayOfInterval({
        start: startDate,
        end: new Date(),
      });

      return dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const signups = orgs?.filter(o => 
          format(new Date(o.created_at), 'yyyy-MM-dd') === dateStr
        ).length || 0;
        
        return {
          date: dateStr,
          signups,
        };
      });
    },
  });
}

export function useRecentActivity(limit: number) {
  return useQuery({
    queryKey: adminStatsKeys.activity(limit),
    queryFn: async () => {
      // Get recent organizations
      const { data: recentOrgs } = await supabase
        .from('organizations')
        .select('name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent calls
      const { data: recentCalls } = await supabase
        .from('call_logs')
        .select('phone_number, created_at, call_status')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent subscriptions
      const { data: recentSubs } = await supabase
        .from('subscriptions')
        .select('plan_name, created_at, organization_id')
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort
      const activities = [
        ...(recentOrgs || []).map(org => ({
          type: 'signup' as const,
          description: `New organization: ${org.name}`,
          timestamp: org.created_at,
        })),
        ...(recentCalls || []).map(call => ({
          type: 'call' as const,
          description: `Call ${call.call_status} to ${call.phone_number}`,
          timestamp: call.created_at,
        })),
        ...(recentSubs || []).map(sub => ({
          type: 'subscription' as const,
          description: `Subscription: ${sub.plan_name} plan`,
          timestamp: sub.created_at,
        })),
      ].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, limit);

      return activities;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAllOrganizations() {
  return useQuery({
    queryKey: adminStatsKeys.organizations(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          subscriptions (plan_name, status),
          campaigns (id),
          leads (id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
