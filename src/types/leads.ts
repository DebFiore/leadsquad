// src/types/leads.ts
// TypeScript types for leads and imports

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'appointment_set' | 'converted' | 'not_interested' | 'do_not_call' | 'invalid';

export interface Lead {
  id: string;
  organization_id: string;
  campaign_id: string | null;
  
  // Contact info
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string;
  company: string | null;
  job_title: string | null;
  
  // Status
  lead_status: LeadStatus;
  lead_source: string | null;
  
  // Call tracking
  last_call_date: string | null;
  next_call_date: string | null;
  total_calls: number;
  total_sms: number;
  
  // Custom data
  custom_fields: Record<string, unknown>;
  tags: string[];
  notes: string | null;
  
  // Import tracking
  import_batch_id: string | null;
  imported_at: string | null;
  
  created_at: string;
  updated_at: string;
}

export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'total_calls' | 'total_sms'>;
export type LeadUpdate = Partial<LeadInsert>;

export type ImportStatus = 'processing' | 'completed' | 'failed' | 'cancelled';

export interface LeadImport {
  id: string;
  organization_id: string;
  campaign_id: string | null;
  file_name: string;
  file_size: number | null;
  total_rows: number;
  successful_imports: number;
  failed_imports: number;
  duplicate_skipped: number;
  status: ImportStatus;
  error_message: string | null;
  errors_detail: Array<{ row: number; error: string }>;
  column_mapping: Record<string, string>;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}
