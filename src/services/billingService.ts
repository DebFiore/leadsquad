import { supabase } from '@/lib/supabase';
import { BillingRecord, AgencyBillingSummary, ClientPricingPlan } from '@/types/billing';

// Default provider cost rates (what we pay providers)
const PROVIDER_COSTS = {
  retell: {
    voice_per_minute: 0.10,
    sms_per_message: 0.01,
    phone_number_monthly: 2.00,
  },
  vapi: {
    voice_per_minute: 0.12,
    sms_per_message: 0.015,
    phone_number_monthly: 2.50,
  },
};

export const billingService = {
  // Get billing records for all organizations (agency view)
  async getAgencyBillingRecords(periodStart?: string, periodEnd?: string): Promise<BillingRecord[]> {
    let query = supabase
      .from('billing_records')
      .select('*')
      .order('period_end', { ascending: false });

    if (periodStart) {
      query = query.gte('period_start', periodStart);
    }
    if (periodEnd) {
      query = query.lte('period_end', periodEnd);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get billing summary for agency dashboard
  async getAgencyBillingSummary(periodStart: string, periodEnd: string): Promise<AgencyBillingSummary> {
    const { data: records, error } = await supabase
      .from('billing_records')
      .select(`
        *,
        organizations:organization_id (name)
      `)
      .gte('period_start', periodStart)
      .lte('period_end', periodEnd);

    if (error) throw error;

    const totalWholesale = records?.reduce((sum, r) => sum + (r.total_wholesale_cost || 0), 0) || 0;
    const totalRetail = records?.reduce((sum, r) => sum + (r.total_retail_revenue || 0), 0) || 0;
    const totalProfit = totalRetail - totalWholesale;
    const avgMargin = totalRetail > 0 ? (totalProfit / totalRetail) * 100 : 0;

    // Get top clients by revenue
    const clientStats = records?.map(r => ({
      organization_id: r.organization_id,
      organization_name: r.organizations?.name || 'Unknown',
      revenue: r.total_retail_revenue || 0,
      profit: (r.total_retail_revenue || 0) - (r.total_wholesale_cost || 0),
    })) || [];

    clientStats.sort((a, b) => b.revenue - a.revenue);

    return {
      period: `${periodStart} to ${periodEnd}`,
      total_organizations: new Set(records?.map(r => r.organization_id)).size,
      total_wholesale_cost: totalWholesale,
      total_retail_revenue: totalRetail,
      total_gross_profit: totalProfit,
      average_margin_percent: avgMargin,
      top_clients: clientStats.slice(0, 10),
    };
  },

  // Get client pricing plans
  async getClientPricingPlans(): Promise<ClientPricingPlan[]> {
    const { data, error } = await supabase
      .from('client_pricing_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create or update client pricing plan
  async upsertPricingPlan(plan: Partial<ClientPricingPlan>): Promise<ClientPricingPlan> {
    const { data, error } = await supabase
      .from('client_pricing_plans')
      .upsert(plan)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Calculate estimated billing for an organization
  async calculateEstimatedBilling(
    organizationId: string,
    voiceMinutes: number,
    smsCount: number,
    provider: 'vapi' | 'retell' = 'retell'
  ): Promise<{
    wholesale: { voice: number; sms: number; total: number };
    retail: { voice: number; sms: number; base: number; total: number };
    profit: number;
    margin: number;
  }> {
    // Get client's pricing plan
    const { data: plan } = await supabase
      .from('client_pricing_plans')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .maybeSingle();

    const costs = PROVIDER_COSTS[provider];
    
    const wholesale = {
      voice: voiceMinutes * costs.voice_per_minute,
      sms: smsCount * costs.sms_per_message,
      total: 0,
    };
    wholesale.total = wholesale.voice + wholesale.sms;

    // Default retail pricing if no plan
    const retailRates = plan || {
      base_monthly_fee: 299,
      included_minutes: 500,
      overage_per_minute: 0.25,
      sms_per_message: 0.05,
    };

    const overageMinutes = Math.max(0, voiceMinutes - (retailRates.included_minutes || 0));
    
    const retail = {
      voice: overageMinutes * (retailRates.overage_per_minute || 0.25),
      sms: smsCount * (retailRates.sms_per_message || 0.05),
      base: retailRates.base_monthly_fee || 299,
      total: 0,
    };
    retail.total = retail.base + retail.voice + retail.sms;

    const profit = retail.total - wholesale.total;
    const margin = retail.total > 0 ? (profit / retail.total) * 100 : 0;

    return { wholesale, retail, profit, margin };
  },

  // Get usage statistics for an organization
  async getOrganizationUsageStats(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('api_usage_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Aggregate stats
    const stats = {
      total_api_calls: data?.length || 0,
      by_provider: {} as Record<string, number>,
      by_endpoint: {} as Record<string, number>,
    };

    data?.forEach(log => {
      stats.by_provider[log.provider] = (stats.by_provider[log.provider] || 0) + 1;
      stats.by_endpoint[log.endpoint] = (stats.by_endpoint[log.endpoint] || 0) + 1;
    });

    return stats;
  },
};
