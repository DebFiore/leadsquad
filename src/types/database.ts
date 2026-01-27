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
  
  // Step 1: Business Basics
  business_name: string | null;
  business_address: string | null;
  business_city: string | null;
  business_state: string | null;
  business_zip: string | null;
  hours_of_operation: string | null;
  business_coverage: string | null;
  business_type: string | null;
  services_offered: string | null;
  
  // Step 2: Brand Voice & Communication
  communication_style: string | null;
  words_to_use: string | null;
  words_to_avoid: string | null;
  ideal_customer_tone: string | null;
  
  // Step 3: Customer Understanding
  customer_problems: string | null;
  frequent_questions: string | null;
  common_objections: string | null;
  caller_decision_stage: string | null;
  
  // Step 4: Lead Qualification
  essential_info_to_collect: string | null;
  hot_lead_criteria: string | null;
  qualifying_questions: string | null;
  escalation_situations: string | null;
  
  // Step 5: Booking & Scheduling
  booking_process: string | null;
  scheduling_window: string | null;
  appointment_durations: string | null;
  blackout_dates: string | null;
  calendar_integration: string | null;
  
  // Step 6: Pricing & Offers
  pricing_discussion_approach: string | null;
  current_promotions: string | null;
  financing_options: string | null;
  consultation_triggers: string | null;
  
  // Step 7: Competition & Differentiation
  main_competitors: string | null;
  differentiators: string | null;
  unique_selling_propositions: string | null;
  awards_certifications: string | null;
  
  // Step 8: Objection Handling
  reasons_people_dont_book: string | null;
  price_objection_handling: string | null;
  warranty_guarantee_messaging: string | null;
  trust_building_elements: string | null;
  
  // Step 9: Goals & Follow-up
  primary_goal: string | null;
  followup_process: string | null;
  lead_notification_recipients: string | null;
  
  // Step 10: Compliance & Limitations
  regulatory_requirements: string | null;
  agent_limitations: string | null;
  required_disclosures: string | null;
  
  // Step 11: Integration
  crm_system: string | null;
  lead_tagging: string | null;
  booking_system_fields: string | null;
  other_integrations: string | null;
  
  // Metadata
  current_step: number;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}
