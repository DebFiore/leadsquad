import { supabase } from '@/lib/supabase';
import { ClientIntakeResponse } from '@/types/database';

// Known valid columns in client_intake_responses table
// This list is used to filter updates and avoid schema cache issues
const VALID_INTAKE_COLUMNS = new Set([
  'business_name',
  'business_address',
  'business_city',
  'business_state',
  'business_zip',
  'business_phone',
  'business_website',
  'hours_of_operation',
  'business_coverage',
  'business_type',
  'services_offered',
  'communication_style',
  'words_to_use',
  'words_to_avoid',
  'ideal_customer_tone',
  'customer_problems',
  'frequent_questions',
  'common_objections',
  'caller_decision_stage',
  'essential_info_to_collect',
  'hot_lead_criteria',
  'nurturing_signals',
  'qualifying_questions',
  'escalation_situations',
  'booking_process',
  'scheduling_window',
  'appointment_durations',
  'blackout_dates',
  'calendar_integration',
  'calendar_name',
  'calendar_api',
  'pricing_discussion_approach',
  'special_offers_frequency',
  'first_time_discount',
  'first_time_discount_description',
  'financing_available',
  'financing_options',
  'current_promotions',
  'consultation_triggers',
  'main_competitors',
  'differentiators',
  'unique_selling_propositions',
  'awards_certifications',
  'reasons_people_dont_book',
  'price_objection_handling',
  'has_warranty',
  'warranty_guarantee_messaging',
  'trust_building_elements',
  'primary_goal',
  'followup_process',
  'lead_notification_recipients',
  'regulatory_requirements',
  'agent_limitations',
  'required_disclosures',
  'crm_system',
  'lead_tagging',
  'booking_system_fields',
  'other_integrations',
  'current_step',
  'is_complete',
]);

// Filter updates to only include valid columns
function filterValidColumns(updates: Record<string, any>): Record<string, any> {
  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (VALID_INTAKE_COLUMNS.has(key)) {
      filtered[key] = value;
    } else {
      console.warn(`Skipping unknown intake column: ${key}`);
    }
  }
  return filtered;
}

export const intakeService = {
  async getIntakeByOrganization(organizationId: string): Promise<ClientIntakeResponse | null> {
    const { data, error } = await supabase
      .from('client_intake_responses')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching intake:', error);
      throw error;
    }
    
    return data;
  },

  async createIntake(organizationId: string): Promise<ClientIntakeResponse> {
    console.log('Creating intake for organization:', organizationId);
    
    // Direct insert - RLS policies now allow this for org owners/members
    const { data, error } = await supabase
      .from('client_intake_responses')
      .insert({ organization_id: organizationId })
      .select()
      .single();

    if (error) {
      console.error('Error creating intake:', error);
      throw error;
    }
    
    console.log('Intake created successfully:', data);
    return data;
  },

  async updateIntake(
    id: string, 
    updates: Partial<Omit<ClientIntakeResponse, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>
  ): Promise<ClientIntakeResponse> {
    // Filter to only valid columns to avoid schema cache issues
    const filteredUpdates = filterValidColumns(updates as Record<string, any>);
    console.log('Updating intake:', { id, originalKeys: Object.keys(updates), filteredKeys: Object.keys(filteredUpdates) });
    
    if (Object.keys(filteredUpdates).length === 0) {
      console.warn('No valid columns to update');
      // Return current data if nothing to update
      const { data } = await supabase
        .from('client_intake_responses')
        .select('*')
        .eq('id', id)
        .single();
      return data as ClientIntakeResponse;
    }
    
    // Use raw fetch to bypass PostgREST schema cache entirely
    // This avoids the PGRST204 "column not found in schema cache" error
    const supabaseUrl = 'https://ywfxxzlzxqvjdjkyxyda.supabase.co';
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    
    if (!accessToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(
      `${supabaseUrl}/rest/v1/client_intake_responses?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Znh4emx6eHF2amRqa3l4eWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0Njc2MDgsImV4cCI6MjA4NTA0MzYwOH0.sgBblnsF8j2pvar31u12R60r3cZy4gkJsZh1DMu5vK4',
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(filteredUpdates),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error updating intake via raw fetch:', errorText);
      throw new Error(`Failed to update intake: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Intake updated successfully:', data);
    return (Array.isArray(data) ? data[0] : data) as ClientIntakeResponse;
  },

  async saveStepProgress(
    id: string,
    stepData: Partial<ClientIntakeResponse>,
    currentStep: number
  ): Promise<ClientIntakeResponse> {
    return this.updateIntake(id, {
      ...stepData,
      current_step: currentStep,
    });
  },

  async completeIntake(id: string): Promise<ClientIntakeResponse> {
    return this.updateIntake(id, {
      is_complete: true,
      current_step: 4,
    });
  },

  async markOnboardingComplete(organizationId: string): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .update({ onboarding_completed: true })
      .eq('id', organizationId);

    if (error) {
      console.error('Error marking onboarding complete:', error);
      throw error;
    }
  },
};
