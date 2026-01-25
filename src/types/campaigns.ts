// src/types/campaigns.ts
// TypeScript types for campaigns

export type CampaignType = 'inbound' | 'outbound' | 'hybrid';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export interface Campaign {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  campaign_type: CampaignType;
  status: CampaignStatus;
  selected_voice_id: string | null;
  voice_provider: 'retell' | 'vapi' | 'elevenlabs' | null;
  ai_script: string | null;
  ai_prompt: string | null;
  phone_number: string | null;
  agent_id: string | null;
  
  // Statistics
  total_leads: number;
  total_calls_attempted: number;
  total_calls_connected: number;
  total_minutes_talked: number;
  total_appointments_set: number;
  
  // Scheduling
  start_date: string | null;
  end_date: string | null;
  calling_hours_start: string;
  calling_hours_end: string;
  calling_days: string[];
  timezone: string;
  
  created_at: string;
  updated_at: string;
}

export type CampaignInsert = Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'total_leads' | 'total_calls_attempted' | 'total_calls_connected' | 'total_minutes_talked' | 'total_appointments_set'>;
export type CampaignUpdate = Partial<CampaignInsert>;
