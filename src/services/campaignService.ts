import { supabase } from '@/lib/supabase';
import { Campaign, CampaignInsert, CampaignUpdate } from '@/types/campaigns';

export const campaignService = {
  // Get all campaigns for the current user's organization
  async getCampaigns(organizationId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a single campaign by ID
  async getCampaign(id: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Create a new campaign
  async createCampaign(campaign: CampaignInsert): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a campaign
  async updateCampaign(id: string, updates: CampaignUpdate): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a campaign
  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Update campaign status
  async updateCampaignStatus(id: string, status: Campaign['status']): Promise<Campaign> {
    return this.updateCampaign(id, { status });
  },

  // Get campaign statistics
  async getCampaignStats(organizationId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('status, total_leads, total_calls_attempted, total_calls_connected, total_appointments_set')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      active: data?.filter(c => c.status === 'active').length || 0,
      draft: data?.filter(c => c.status === 'draft').length || 0,
      paused: data?.filter(c => c.status === 'paused').length || 0,
      completed: data?.filter(c => c.status === 'completed').length || 0,
      totalLeads: data?.reduce((sum, c) => sum + (c.total_leads || 0), 0) || 0,
      totalCalls: data?.reduce((sum, c) => sum + (c.total_calls_attempted || 0), 0) || 0,
      totalConnected: data?.reduce((sum, c) => sum + (c.total_calls_connected || 0), 0) || 0,
      totalAppointments: data?.reduce((sum, c) => sum + (c.total_appointments_set || 0), 0) || 0,
    };

    return stats;
  },
};
