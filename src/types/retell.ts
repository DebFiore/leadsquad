export interface RetellWorkspace {
  id: string;
  organization_id: string;
  workspace_id: string;
  api_key: string;
  is_connected: boolean;
  last_synced_at: string | null;
  phone_numbers: RetellPhoneNumber[];
  created_at: string;
  updated_at: string;
}

export interface RetellPhoneNumber {
  id: string;
  phone_number: string;
  nickname: string | null;
  agent_id: string | null;
  agent_role: 'inbound_receptionist' | 'outbound_lead' | 'appointment_setter' | null;
  is_active: boolean;
  created_at: string;
}

export interface RetellUsageData {
  organization_id: string;
  period_start: string;
  period_end: string;
  total_minutes: number;
  total_calls: number;
  inbound_minutes: number;
  outbound_minutes: number;
  cost_usd: number;
  breakdown_by_agent: {
    agent_id: string;
    agent_name: string;
    minutes: number;
    calls: number;
  }[];
}

export interface ClientPlan {
  id: string;
  organization_id: string;
  plan_name: string;
  included_minutes: number;
  overage_rate_per_minute: number;
  monthly_fee: number;
  billing_cycle_start: number; // Day of month
}

export interface UsageProgress {
  used_minutes: number;
  included_minutes: number;
  percentage: number;
  overage_minutes: number;
  estimated_overage_cost: number;
  days_remaining: number;
}
