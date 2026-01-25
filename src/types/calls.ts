// src/types/calls.ts
// TypeScript types for call logs

export type CallType = 'inbound' | 'outbound';
export type CallStatus = 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'missed' | 'failed' | 'voicemail' | 'busy' | 'no_answer';
export type CallSentiment = 'positive' | 'neutral' | 'negative';
export type CallProvider = 'retell' | 'vapi';

export interface TranscriptSegment {
  speaker: 'agent' | 'caller';
  text: string;
  start_time: number;
  end_time: number;
}

export interface CallLog {
  id: string;
  organization_id: string;
  campaign_id: string | null;
  lead_id: string | null;
  agent_setting_id: string | null;
  
  // Call details
  call_type: CallType;
  call_status: CallStatus;
  phone_number: string;
  from_number: string | null;
  
  // Provider
  provider: CallProvider;
  provider_call_id: string | null;
  
  // Metrics
  duration_seconds: number;
  wait_time_seconds: number;
  
  // Recording
  recording_url: string | null;
  transcript: string | null;
  transcript_segments: TranscriptSegment[];
  
  // AI analysis
  call_summary: string | null;
  call_sentiment: CallSentiment | null;
  appointment_set: boolean;
  appointment_datetime: string | null;
  key_topics: string[];
  
  // Outcome
  outcome: string | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  
  // Cost
  cost_amount: number;
  
  // Timestamps
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export type CallLogInsert = Omit<CallLog, 'id' | 'created_at'>;
