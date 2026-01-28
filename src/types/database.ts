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
  
  // Business Details
  business_name: string | null;
  business_address: string | null;
  business_city: string | null;
  business_state: string | null;
  business_zip: string | null;
  business_phone: string | null;
  business_website: string | null;
  hours_of_operation: string | null;
  business_coverage: string | null;
  business_type: string | null;
  services_offered: string | null;
  
  // Brand Voice & Personality
  communication_style: string | null;
  words_to_use: string | null;
  words_to_avoid: string | null;
  ideal_customer_tone: string | null;
  
  // Customer Journey & Pain Points
  customer_problems: string | null;
  frequent_questions: string | null;
  common_objections: string | null;
  caller_decision_stage: string | null;
  
  // Call Handling Priorities
  essential_info_to_collect: string | null;
  hot_lead_criteria: string | null;
  nurturing_signals: string | null;
  qualifying_questions: string | null;
  escalation_situations: string | null;
  
  // Scheduling and Process Details
  booking_process: string | null;
  scheduling_window: string | null;
  appointment_durations: string | null;
  blackout_dates: string | null;
  
  // Calendar Integration Requirements
  calendar_integration: string | null;
  calendar_name: string | null;
  calendar_api: string | null;
  
  // Pricing and Offers
  pricing_discussion_approach: string | null;
  special_offers_frequency: string | null;
  first_time_discount: string | null;
  first_time_discount_description: string | null;
  financing_available: string | null;
  financing_options: string | null;
  current_promotions: string | null;
  consultation_triggers: string | null;
  
  // Competition & Differentiation
  main_competitors: string | null;
  differentiators: string | null;
  unique_selling_propositions: string | null;
  awards_certifications: string | null;
  
  // Objection Handling
  reasons_people_dont_book: string | null;
  price_objection_handling: string | null;
  has_warranty: string | null;
  warranty_guarantee_messaging: string | null;
  trust_building_elements: string | null;
  
  // Conversation Outcomes
  primary_goal: string | null;
  followup_process: string | null;
  lead_notification_recipients: string | null;
  
  // Compliance & Limitations
  regulatory_requirements: string | null;
  agent_limitations: string | null;
  required_disclosures: string | null;
  
  // Integration Requirements
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
