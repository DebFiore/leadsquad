import { supabase } from '@/lib/supabase';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type ProviderType = 'vapi' | 'retell';

interface ProxyResponse<T = unknown> {
  success: boolean;
  status: number;
  data: T;
}

/**
 * Server-side proxy for provider API calls.
 * Routes requests through the org's specific API key stored in provider_settings.
 */
export const providerProxyService = {
  async callProvider<T = unknown>(
    organizationId: string,
    provider: ProviderType,
    endpoint: string,
    method: HttpMethod = 'GET',
    body?: Record<string, unknown>
  ): Promise<ProxyResponse<T>> {
    const { data, error } = await supabase.functions.invoke('provider-proxy', {
      body: {
        organization_id: organizationId,
        provider,
        endpoint,
        method,
        body,
      },
    });

    if (error) {
      throw new Error(`Provider proxy failed: ${error.message}`);
    }

    return data as ProxyResponse<T>;
  },

  // Retell-specific helpers
  retell: {
    async listAgents(organizationId: string) {
      return providerProxyService.callProvider(organizationId, 'retell', '/list-agents');
    },

    async getAgent(organizationId: string, agentId: string) {
      return providerProxyService.callProvider(organizationId, 'retell', `/get-agent/${agentId}`);
    },

    async createPhoneCall(organizationId: string, payload: {
      from_number: string;
      to_number: string;
      agent_id: string;
      metadata?: Record<string, unknown>;
    }) {
      return providerProxyService.callProvider(organizationId, 'retell', '/create-phone-call', 'POST', payload);
    },

    async listPhoneCalls(organizationId: string, filters?: { limit?: number }) {
      return providerProxyService.callProvider(organizationId, 'retell', '/list-calls', 'POST', filters);
    },
  },

  // Vapi-specific helpers
  vapi: {
    async listAssistants(organizationId: string) {
      return providerProxyService.callProvider(organizationId, 'vapi', '/assistant');
    },

    async getAssistant(organizationId: string, assistantId: string) {
      return providerProxyService.callProvider(organizationId, 'vapi', `/assistant/${assistantId}`);
    },

    async createCall(organizationId: string, payload: {
      phoneNumberId: string;
      assistantId: string;
      customer: { number: string };
    }) {
      return providerProxyService.callProvider(organizationId, 'vapi', '/call', 'POST', payload);
    },

    async listCalls(organizationId: string) {
      return providerProxyService.callProvider(organizationId, 'vapi', '/call');
    },
  },
};
