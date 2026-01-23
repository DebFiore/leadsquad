import { supabase } from '@/lib/supabase';
import { ProviderSettings, ProviderType, PROVIDER_CONFIGS } from '@/types/providers';

export const providerService = {
  async getProviderSettings(organizationId: string): Promise<ProviderSettings[]> {
    const { data, error } = await supabase
      .from('provider_settings')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data || [];
  },

  async getProviderSetting(organizationId: string, provider: ProviderType): Promise<ProviderSettings | null> {
    const { data, error } = await supabase
      .from('provider_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('provider', provider)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async saveProviderApiKey(
    organizationId: string,
    provider: ProviderType,
    apiKey: string,
    isConnected: boolean
  ): Promise<ProviderSettings> {
    // Check if setting already exists
    const existing = await this.getProviderSetting(organizationId, provider);

    if (existing) {
      const { data, error } = await supabase
        .from('provider_settings')
        .update({
          api_key: apiKey,
          is_connected: isConnected,
          last_tested_at: isConnected ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Create new setting
    const { data, error } = await supabase
      .from('provider_settings')
      .insert({
        organization_id: organizationId,
        provider,
        api_key: apiKey,
        is_connected: isConnected,
        last_tested_at: isConnected ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async testConnection(provider: ProviderType, apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const config = PROVIDER_CONFIGS[provider];
      
      // Test the API key by making a simple request
      const response = await fetch(config.testEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { success: true };
      }

      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || `API returned status ${response.status}` 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  },

  async disconnectProvider(organizationId: string, provider: ProviderType): Promise<void> {
    const { error } = await supabase
      .from('provider_settings')
      .update({
        api_key: '',
        is_connected: false,
        last_tested_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', organizationId)
      .eq('provider', provider);

    if (error) throw error;
  },
};
