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

export interface ClientIntakeResponse {
  id: string;
  organization_id: string;
  
  // Step 1: Business Profile
  business_name: string | null;
  services: string[] | null;
  geographic_area: string | null;
  years_in_business: number | null;
  is_licensed_insured: boolean;
  trust_factors: string[] | null;
  
  // Step 2: Persona & Tone
  communication_style: string | null;
  intro_sentence: string | null;
  phrases_to_use: string[] | null;
  phrases_to_avoid: string[] | null;
  
  // Step 3: Knowledge Base & Logic
  top_customer_questions: string[] | null;
  common_objections: string[] | null;
  objection_responses: Record<string, string> | null;
  pricing_strategy: string | null;
  pricing_details: string | null;
  
  // Step 4: Call Flow & Goals
  info_to_collect: string[] | null;
  inbound_goals: string[] | null;
  outbound_goals: string[] | null;
  transfer_protocols: string | null;
  
  // Step 5: Technical & CRM
  booking_process: string | null;
  calendar_systems: string[] | null;
  crm_system: string | null;
  crm_integration_notes: string | null;
  
  // Metadata
  current_step: number;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}
