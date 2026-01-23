export type ProviderType = 'vapi' | 'retell';

export interface ProviderSettings {
  id: string;
  organization_id: string;
  provider: ProviderType;
  api_key: string;
  is_connected: boolean;
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProviderConfig {
  id: ProviderType;
  name: string;
  description: string;
  logo: string;
  docsUrl: string;
  testEndpoint: string;
}

export const PROVIDER_CONFIGS: Record<ProviderType, ProviderConfig> = {
  vapi: {
    id: 'vapi',
    name: 'Vapi.ai',
    description: 'AI-powered voice agents for inbound and outbound calls with real-time transcription.',
    logo: 'https://vapi.ai/favicon.ico',
    docsUrl: 'https://docs.vapi.ai',
    testEndpoint: 'https://api.vapi.ai/assistant',
  },
  retell: {
    id: 'retell',
    name: 'Retell.ai',
    description: 'Conversational AI platform for building voice agents with human-like interactions.',
    logo: 'https://www.retellai.com/favicon.ico',
    docsUrl: 'https://docs.retellai.com',
    testEndpoint: 'https://api.retellai.com/list-agents',
  },
};
