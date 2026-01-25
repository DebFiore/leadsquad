import { supabase } from '@/lib/supabase';
import { Lead, LeadInsert, LeadUpdate, LeadImport } from '@/types/leads';

export const leadService = {
  // Get all leads for an organization
  async getLeads(organizationId: string, filters?: {
    campaignId?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ leads: Lead[]; count: number }> {
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters?.campaignId) {
      query = query.eq('campaign_id', filters.campaignId);
    }

    if (filters?.status) {
      query = query.eq('lead_status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { leads: data || [], count: count || 0 };
  },

  // Get a single lead by ID
  async getLead(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Create a new lead
  async createLead(lead: LeadInsert): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create multiple leads (bulk import)
  async createLeads(leads: LeadInsert[]): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .insert(leads)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Update a lead
  async updateLead(id: string, updates: LeadUpdate): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a lead
  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Delete multiple leads
  async deleteLeads(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', ids);

    if (error) throw error;
  },

  // Update lead status
  async updateLeadStatus(id: string, status: Lead['lead_status']): Promise<Lead> {
    return this.updateLead(id, { lead_status: status });
  },

  // Assign lead to campaign
  async assignToCampaign(leadId: string, campaignId: string | null): Promise<Lead> {
    return this.updateLead(leadId, { campaign_id: campaignId });
  },

  // Get lead statistics
  async getLeadStats(organizationId: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('lead_status')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      new: data?.filter(l => l.lead_status === 'new').length || 0,
      contacted: data?.filter(l => l.lead_status === 'contacted').length || 0,
      qualified: data?.filter(l => l.lead_status === 'qualified').length || 0,
      appointmentSet: data?.filter(l => l.lead_status === 'appointment_set').length || 0,
      converted: data?.filter(l => l.lead_status === 'converted').length || 0,
      notInterested: data?.filter(l => l.lead_status === 'not_interested').length || 0,
      doNotCall: data?.filter(l => l.lead_status === 'do_not_call').length || 0,
    };

    return stats;
  },

  // Get import history
  async getImports(organizationId: string): Promise<LeadImport[]> {
    const { data, error } = await supabase
      .from('lead_imports')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create import record
  async createImport(importData: Partial<LeadImport>): Promise<LeadImport> {
    const { data, error } = await supabase
      .from('lead_imports')
      .insert(importData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update import record
  async updateImport(id: string, updates: Partial<LeadImport>): Promise<LeadImport> {
    const { data, error } = await supabase
      .from('lead_imports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
