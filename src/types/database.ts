export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string | null;
  owner_id: string;
  onboarding_completed: boolean;
  status: 'pending' | 'active' | 'flagged' | 'needs_clarification';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface SuperAdmin {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
}

export interface ClientIntakeResponse {
  id: string;
  organization_id: string;
  
  // Step 1: Business Basics (Section 1 & 7)
  business_name: string | null;
  business_address: string | null;
  business_website: string | null;
  business_hours: string | null;
  services: string[] | null;
  geographic_area: string | null;
  years_in_business: number | null;
  is_licensed_insured: boolean;
  trust_factors: string[] | null;
  unique_selling_points: string[] | null;
  
  // Step 2: Brand Identity (Section 2 & 3)
  communication_style: string | null;
  intro_sentence: string | null;
  phrases_to_use: string[] | null;
  phrases_to_avoid: string[] | null;
  top_customer_questions: string[] | null;
  common_objections: string[] | null;
  objection_responses: Record<string, string> | null;
  
  // Step 3: Call Logic (Section 4 & 9)
  info_to_collect: string[] | null;
  inbound_goals: string[] | null;
  outbound_goals: string[] | null;
  transfer_protocols: string | null;
  pricing_strategy: string | null;
  pricing_details: string | null;
  
  // Step 4: Integration (Section 11)
  booking_process: string | null;
  calendar_systems: string[] | null;
  crm_system: string | null;
  crm_integration_notes: string | null;
  
  // Extended Intake Fields (Sections 5-13)
  // Section 5: Ideal Customer Profile
  ideal_customer_description: string | null;
  customer_pain_points: string[] | null;
  
  // Section 6: Competitor Information
  main_competitors: string[] | null;
  competitive_advantages: string[] | null;
  
  // Section 8: Lead Qualification
  qualification_criteria: string[] | null;
  disqualification_criteria: string[] | null;
  lead_scoring_notes: string | null;
  
  // Section 10: Appointment Setting
  appointment_types: string[] | null;
  appointment_duration: string | null;
  appointment_buffer: string | null;
  
  // Section 12: Follow-up Protocols
  followup_timing: string | null;
  followup_channels: string[] | null;
  followup_sequence: string | null;
  
  // Section 13: Reporting & KPIs
  key_metrics: string[] | null;
  reporting_frequency: string | null;
  success_criteria: string | null;
  
  // Metadata
  current_step: number;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}
