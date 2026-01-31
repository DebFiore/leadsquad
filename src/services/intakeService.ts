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
    console.log('Updating intake via RPC:', { id, originalKeys: Object.keys(updates), filteredKeys: Object.keys(filteredUpdates) });
    
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
    
    // Use RPC function to bypass PostgREST schema cache entirely
    // The update_client_intake function handles the update in PL/pgSQL
    const { data, error } = await supabase.rpc('update_client_intake', {
      p_intake_id: id,
      p_updates: filteredUpdates,
    });

    if (error) {
      console.error('Error updating intake via RPC:', error);
      throw error;
    }
    
    console.log('Intake updated successfully via RPC:', data);
    return data as ClientIntakeResponse;
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
