import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService } from '@/services/subscriptionService';

export const subscriptionKeys = {
  all: ['subscription'] as const,
  detail: (orgId: string) => [...subscriptionKeys.all, 'detail', orgId] as const,
  usage: (orgId: string) => [...subscriptionKeys.all, 'usage', orgId] as const,
  usageHistory: (orgId: string, days: number) => 
    [...subscriptionKeys.usage(orgId), 'history', days] as const,
};

// Fetch organization subscription
export function useSubscription() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: subscriptionKeys.detail(organization?.id ?? ''),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      return subscriptionService.getSubscription(organization.id);
    },
    enabled: !!organization?.id,
  });
}

// Check if organization has active subscription
export function useHasActiveSubscription() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: [...subscriptionKeys.detail(organization?.id ?? ''), 'active'],
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      return subscriptionService.hasActiveSubscription(organization.id);
    },
    enabled: !!organization?.id,
  });
}

// Fetch current billing period usage
export function useCurrentUsage() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: [...subscriptionKeys.usage(organization?.id ?? ''), 'current'],
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      return subscriptionService.getCurrentUsage(organization.id);
    },
    enabled: !!organization?.id,
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });
}

// Fetch usage history
export function useUsageHistory(days: number = 30) {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: subscriptionKeys.usageHistory(organization?.id ?? '', days),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      return subscriptionService.getUsageHistory(organization.id, days);
    },
    enabled: !!organization?.id,
  });
}

// Calculate and return usage percentage with limits
export function useUsagePercentage() {
  const { data: usage, isLoading } = useCurrentUsage();
  
  if (isLoading || !usage) {
    return { 
      isLoading,
      minutesPercent: 0, 
      minutesUsed: 0,
      minutesLimit: 0,
      callsUsed: 0,
      isOverLimit: false,
    };
  }
  
  return {
    isLoading: false,
    minutesPercent: usage.percentUsed,
    minutesUsed: usage.minutesUsed,
    minutesLimit: usage.minutesLimit,
    callsUsed: usage.callsUsed,
    isOverLimit: usage.percentUsed >= 100,
  };
}
