import { supabase } from '@/lib/supabase';
import { ClientIntakeResponse } from '@/types/database';

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
    
    // Use the security definer function to bypass RLS timing issues
    const { data: intakeId, error: rpcError } = await supabase
      .rpc('create_client_intake', { p_organization_id: organizationId });

    if (rpcError) {
      console.error('Error creating intake via RPC:', rpcError);
      throw rpcError;
    }
    
    console.log('Intake created with ID:', intakeId);
    
    // Fetch the full intake record
    const { data, error } = await supabase
      .from('client_intake_responses')
      .select('*')
      .eq('id', intakeId)
      .single();

    if (error) {
      console.error('Error fetching created intake:', error);
      throw error;
    }
    
    console.log('Intake fetched successfully:', data);
    return data;
  },

  async updateIntake(
    id: string, 
    updates: Partial<Omit<ClientIntakeResponse, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>
  ): Promise<ClientIntakeResponse> {
    console.log('Updating intake:', { id, updates });
    
    const { data, error } = await supabase
      .from('client_intake_responses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating intake:', error);
      throw error;
    }
    
    console.log('Intake updated successfully:', data);
    return data;
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
