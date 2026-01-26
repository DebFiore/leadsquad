import { supabase } from '@/lib/supabase';
import { Organization, ClientIntakeResponse } from '@/types/database';
import { LeadEvent } from '@/types/agents';

export const adminService = {
  // Check if user is a superadmin
  async isSuperAdmin(userId: string): Promise<boolean> {
    console.log('[AdminService] Checking superadmin for userId:', userId);
    
    const { data, error } = await supabase
      .from('superadmins')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    console.log('[AdminService] Superadmin check result:', { data, error });
    
    if (error) {
      console.error('[AdminService] Error checking superadmin status:', error);
      return false;
    }
    
    const isAdmin = !!data;
    console.log('[AdminService] Is superadmin:', isAdmin);
    return isAdmin;
  },

  // Fetch all organizations for admin review
  async getOrganizations(): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
    
    return data || [];
  },

  // Fetch intake responses for an organization
  async getIntakeByOrganization(organizationId: string): Promise<ClientIntakeResponse | null> {
    const { data, error } = await supabase
      .from('client_intake_responses')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching intake:', error);
      throw error;
    }
    
    return data;
  },

  // Update organization status
  async updateOrganizationStatus(
    organizationId: string, 
    status: Organization['status']
  ): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', organizationId);
    
    if (error) {
      console.error('Error updating organization status:', error);
      throw error;
    }
  },

  // Toggle organization active state
  async toggleOrganizationActive(
    organizationId: string, 
    isActive: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', organizationId);
    
    if (error) {
      console.error('Error toggling organization active:', error);
      throw error;
    }
  },

  // Get organization by ID for impersonation
  async getOrganizationById(organizationId: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }
    
    return data;
  },

  // Get lead events for an organization
  async getLeadEventsByOrganization(organizationId: string, limit = 20): Promise<LeadEvent[]> {
    const { data, error } = await supabase
      .from('lead_events')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching lead events:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get event statistics for an organization
  async getEventStats(organizationId: string): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('lead_events')
      .select('event_type, status')
      .eq('organization_id', organizationId);
    
    if (error) {
      console.error('Error fetching event stats:', error);
      return { total: 0, sms_sent: 0, call_attempted: 0, appointment_set: 0 };
    }
    
    const stats: Record<string, number> = {
      total: data?.length || 0,
      sms_sent: 0,
      call_attempted: 0,
      call_completed: 0,
      appointment_set: 0,
    };

    data?.forEach(event => {
      if (stats[event.event_type] !== undefined) {
        stats[event.event_type]++;
      }
    });

    return stats;
  },
};
