import { supabase } from '@/lib/supabase';
import { RetellWorkspace, RetellPhoneNumber, RetellUsageData, UsageProgress } from '@/types/retell';

export const retellWorkspaceService = {
  // Get workspace for an organization
  async getWorkspace(organizationId: string): Promise<RetellWorkspace | null> {
    const { data, error } = await supabase
      .from('retell_workspaces')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Save/update workspace credentials (Admin only)
  async saveWorkspaceCredentials(
    organizationId: string,
    workspaceId: string,
    apiKey: string
  ): Promise<RetellWorkspace> {
    // Check if workspace exists
    const existing = await this.getWorkspace(organizationId);

    if (existing) {
      const { data, error } = await supabase
        .from('retell_workspaces')
        .update({
          workspace_id: workspaceId,
          api_key: apiKey,
          is_connected: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Create new workspace
    const { data, error } = await supabase
      .from('retell_workspaces')
      .insert({
        organization_id: organizationId,
        workspace_id: workspaceId,
        api_key: apiKey,
        is_connected: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Trigger agent deployment after workspace is linked
  async triggerAgentDeployment(organizationId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('deploy-retell-agents', {
      body: { organization_id: organizationId },
    });

    if (error) throw error;
  },

  // Get phone numbers for a workspace
  async getPhoneNumbers(organizationId: string): Promise<RetellPhoneNumber[]> {
    const { data, error } = await supabase
      .from('retell_phone_numbers')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Sync phone numbers from Retell API
  async syncPhoneNumbers(organizationId: string): Promise<RetellPhoneNumber[]> {
    const { data, error } = await supabase.functions.invoke('sync-retell-resources', {
      body: { 
        organization_id: organizationId,
        resource_type: 'phone_numbers',
      },
    });

    if (error) throw error;
    return data?.phone_numbers || [];
  },

  // Get usage data for an organization
  async getUsageData(
    organizationId: string,
    periodStart?: string,
    periodEnd?: string
  ): Promise<RetellUsageData | null> {
    const { data, error } = await supabase.functions.invoke('get-retell-usage', {
      body: {
        organization_id: organizationId,
        period_start: periodStart,
        period_end: periodEnd,
      },
    });

    if (error) throw error;
    return data;
  },

  // Calculate usage progress for dashboard
  async getUsageProgress(organizationId: string): Promise<UsageProgress> {
    // Get client plan
    const { data: plan } = await supabase
      .from('client_pricing_plans')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .maybeSingle();

    const includedMinutes = plan?.included_minutes || 500; // Default 500 mins
    const overageRate = plan?.overage_per_minute || 0.25;

    // Get current month's usage
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usage = await this.getUsageData(
      organizationId,
      monthStart.toISOString(),
      monthEnd.toISOString()
    );

    const usedMinutes = usage?.total_minutes || 0;
    const percentage = Math.min((usedMinutes / includedMinutes) * 100, 100);
    const overageMinutes = Math.max(0, usedMinutes - includedMinutes);
    const daysRemaining = monthEnd.getDate() - now.getDate();

    return {
      used_minutes: usedMinutes,
      included_minutes: includedMinutes,
      percentage,
      overage_minutes: overageMinutes,
      estimated_overage_cost: overageMinutes * overageRate,
      days_remaining: daysRemaining,
    };
  },

  // Test workspace connection
  async testConnection(organizationId: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.functions.invoke('test-retell-connection', {
      body: { organization_id: organizationId },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: data?.success || false, error: data?.error };
  },
};
