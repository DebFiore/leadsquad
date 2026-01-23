export type ProvisioningStep = 
  | 'creating_subaccount'
  | 'generating_api_key'
  | 'deploying_agents'
  | 'configuring_phones'
  | 'testing_connections'
  | 'finalizing';

export type ProvisioningStatus = 'pending' | 'running' | 'success' | 'failed';

export interface ProvisioningEvent {
  id: string;
  organization_id: string;
  step: ProvisioningStep;
  status: ProvisioningStatus;
  message: string;
  details: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
}

export interface ProvisioningLog {
  organization_id: string;
  organization_name: string;
  started_at: string;
  completed_at: string | null;
  overall_status: ProvisioningStatus;
  events: ProvisioningEvent[];
  provider: 'vapi' | 'retell';
  agents_created: number;
  phone_numbers_assigned: string[];
}

export const PROVISIONING_STEP_LABELS: Record<ProvisioningStep, string> = {
  creating_subaccount: 'Creating Retell Sub-Account',
  generating_api_key: 'Generating API Key',
  deploying_agents: 'Deploying AI Agents',
  configuring_phones: 'Configuring Phone Numbers',
  testing_connections: 'Testing Connections',
  finalizing: 'Finalizing Setup',
};
