import { supabase } from '@/lib/supabase';
import { Organization, ClientIntakeResponse } from '@/types/database';

export const adminService = {
  // Check if user is a superadmin
  async isSuperAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('superadmins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking superadmin status:', error);
      return false;
    }
    
    return !!data;
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
};
