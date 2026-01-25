import { supabase } from '@/lib/supabase';
import { Subscription, BillingUsage } from '@/types/subscriptions';

export const subscriptionService = {
  // Get subscription for an organization
  async getSubscription(organizationId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Check if organization has active subscription
  async hasActiveSubscription(organizationId: string): Promise<boolean> {
    const subscription = await this.getSubscription(organizationId);
    return subscription?.status === 'active' || subscription?.status === 'trialing';
  },

  // Get usage for current billing period
  async getCurrentUsage(organizationId: string): Promise<{
    minutesUsed: number;
    minutesLimit: number;
    callsUsed: number;
    percentUsed: number;
  }> {
    const subscription = await this.getSubscription(organizationId);
    
    if (!subscription) {
      return {
        minutesUsed: 0,
        minutesLimit: 0,
        callsUsed: 0,
        percentUsed: 0,
      };
    }

    const minutesUsed = subscription.minutes_used_current_cycle || 0;
    const minutesLimit = subscription.monthly_minutes_limit || 100;
    const percentUsed = minutesLimit > 0 ? Math.round((minutesUsed / minutesLimit) * 100) : 0;

    return {
      minutesUsed,
      minutesLimit,
      callsUsed: subscription.calls_used_current_cycle || 0,
      percentUsed: Math.min(percentUsed, 100),
    };
  },

  // Get billing usage history
  async getUsageHistory(organizationId: string, days: number = 30): Promise<BillingUsage[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('billing_usage')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('usage_date', startDate.toISOString().split('T')[0])
      .order('usage_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get usage by provider
  async getUsageByProvider(organizationId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('billing_usage')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('usage_date', startDate)
      .lte('usage_date', endDate);

    if (error) throw error;

    const byProvider: Record<string, { minutes: number; calls: number; cost: number }> = {};

    data?.forEach(usage => {
      if (!byProvider[usage.provider]) {
        byProvider[usage.provider] = { minutes: 0, calls: 0, cost: 0 };
      }
      byProvider[usage.provider].minutes += usage.minutes_used || 0;
      byProvider[usage.provider].calls += usage.calls_made || 0;
      byProvider[usage.provider].cost += usage.cost_amount || 0;
    });

    return byProvider;
  },

  // Record usage (typically called by backend/webhooks)
  async recordUsage(usage: Omit<BillingUsage, 'id' | 'created_at'>): Promise<BillingUsage> {
    const { data, error } = await supabase
      .from('billing_usage')
      .upsert(usage, { onConflict: 'organization_id,usage_date,provider' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update subscription usage counters
  async incrementUsage(organizationId: string, minutes: number, calls: number = 1): Promise<void> {
    const { error } = await supabase.rpc('increment_subscription_usage', {
      org_id: organizationId,
      minutes_to_add: minutes,
      calls_to_add: calls,
    });

    // If RPC doesn't exist, fall back to manual update
    if (error) {
      const subscription = await this.getSubscription(organizationId);
      if (subscription) {
        await supabase
          .from('subscriptions')
          .update({
            minutes_used_current_cycle: (subscription.minutes_used_current_cycle || 0) + minutes,
            calls_used_current_cycle: (subscription.calls_used_current_cycle || 0) + calls,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);
      }
    }
  },
};
