import { supabase } from '@/lib/supabase';
import { OrganizationBranding, DEFAULT_BRANDING } from '@/types/branding';

export const brandingService = {
  // Get branding for an organization
  async getBranding(organizationId: string): Promise<OrganizationBranding | null> {
    const { data, error } = await supabase
      .from('organization_branding')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Create or update branding
  async upsertBranding(
    organizationId: string,
    branding: Partial<Omit<OrganizationBranding, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>
  ): Promise<OrganizationBranding> {
    // Check if branding exists
    const existing = await this.getBranding(organizationId);

    if (existing) {
      const { data, error } = await supabase
        .from('organization_branding')
        .update({
          ...branding,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Create new branding
    const { data, error } = await supabase
      .from('organization_branding')
      .insert({
        organization_id: organizationId,
        primary_color: DEFAULT_BRANDING.primary_color,
        ...branding,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload logo to storage
  async uploadLogo(organizationId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${organizationId}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('branding-assets')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('branding-assets')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // Upload favicon to storage
  async uploadFavicon(organizationId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${organizationId}/favicon.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('branding-assets')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('branding-assets')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // Get all organization brandings (admin view)
  async getAllBrandings(): Promise<Array<OrganizationBranding & { organization_name: string }>> {
    const { data, error } = await supabase
      .from('organization_branding')
      .select(`
        *,
        organizations:organization_id (name)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      organization_name: item.organizations?.name || 'Unknown',
    }));
  },
};
