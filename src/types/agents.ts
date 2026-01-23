export type AgentRole = 'inbound_receptionist' | 'outbound_lead' | 'appointment_setter';

export interface VoiceSettings {
  voice_id: string | null;
  stability: number;
  clarity: number;
  style: number;
}

export interface AgentSettings {
  id: string;
  organization_id: string;
  agent_role: AgentRole;
  is_enabled: boolean;
  voice_settings: VoiceSettings;
  primary_goal: string;
  lead_reworking_enabled: boolean;
  retry_attempts: number;
  retry_hours: number;
  created_at: string;
  updated_at: string;
}

export interface LeadEvent {
  id: string;
  organization_id: string;
  lead_id: string | null;
  event_type: 'web_form_inbound' | 'sms_sent' | 'call_attempted' | 'call_completed' | 'appointment_set' | 'appointment_confirmed' | 'rework_scheduled';
  event_data: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at: string | null;
  created_at: string;
}

export const AGENT_CONFIGS: Record<AgentRole, {
  title: string;
  shortTitle: string;
  emoji: string;
  description: string;
  primaryGoal: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  inbound_receptionist: {
    title: 'Inbound Receptionist',
    shortTitle: 'Inbound',
    emoji: '📞',
    description: 'Handles incoming calls, qualifies leads, and routes to the right team member.',
    primaryGoal: 'Book appointments or route calls',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
  },
  outbound_lead: {
    title: 'Outbound Lead Outreach',
    shortTitle: 'Outbound',
    emoji: '🚀',
    description: 'Proactively reaches out to new leads via calls and SMS to qualify interest.',
    primaryGoal: 'Qualify interest and schedule callbacks',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  appointment_setter: {
    title: 'Appointment Setter',
    shortTitle: 'Setter',
    emoji: '📅',
    description: 'Confirms, reschedules, and manages appointment bookings with leads.',
    primaryGoal: 'Confirm or reschedule bookings',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
};

export const ELEVENLABS_VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Warm, friendly female voice' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Professional male voice' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Confident male voice' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', description: 'Clear, articulate female voice' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Energetic female voice' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Calm, authoritative male voice' },
];
