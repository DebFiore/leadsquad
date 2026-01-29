export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      client_intake_responses: {
        Row: {
          agent_limitations: string | null
          appointment_durations: string | null
          awards_certifications: string | null
          blackout_dates: string | null
          booking_process: string | null
          booking_system_fields: string | null
          business_address: string | null
          business_city: string | null
          business_coverage: string | null
          business_name: string | null
          business_phone: string | null
          business_state: string | null
          business_type: string | null
          business_website: string | null
          business_zip: string | null
          calendar_api: string | null
          calendar_integration: string | null
          calendar_name: string | null
          caller_decision_stage: string | null
          common_objections: string | null
          communication_style: string | null
          consultation_triggers: string | null
          created_at: string
          crm_system: string | null
          current_promotions: string | null
          current_step: number
          customer_problems: string | null
          differentiators: string | null
          escalation_situations: string | null
          essential_info_to_collect: string | null
          financing_available: string | null
          financing_options: string | null
          first_time_discount: string | null
          first_time_discount_description: string | null
          followup_process: string | null
          frequent_questions: string | null
          has_warranty: string | null
          hot_lead_criteria: string | null
          hours_of_operation: string | null
          id: string
          ideal_customer_tone: string | null
          is_complete: boolean
          lead_notification_recipients: string | null
          lead_tagging: string | null
          main_competitors: string | null
          nurturing_signals: string | null
          organization_id: string
          other_integrations: string | null
          price_objection_handling: string | null
          pricing_discussion_approach: string | null
          primary_goal: string | null
          qualifying_questions: string | null
          reasons_people_dont_book: string | null
          regulatory_requirements: string | null
          required_disclosures: string | null
          scheduling_window: string | null
          services_offered: string | null
          special_offers_frequency: string | null
          trust_building_elements: string | null
          unique_selling_propositions: string | null
          updated_at: string
          warranty_guarantee_messaging: string | null
          words_to_avoid: string | null
          words_to_use: string | null
        }
        Insert: {
          agent_limitations?: string | null
          appointment_durations?: string | null
          awards_certifications?: string | null
          blackout_dates?: string | null
          booking_process?: string | null
          booking_system_fields?: string | null
          business_address?: string | null
          business_city?: string | null
          business_coverage?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_state?: string | null
          business_type?: string | null
          business_website?: string | null
          business_zip?: string | null
          calendar_api?: string | null
          calendar_integration?: string | null
          calendar_name?: string | null
          caller_decision_stage?: string | null
          common_objections?: string | null
          communication_style?: string | null
          consultation_triggers?: string | null
          created_at?: string
          crm_system?: string | null
          current_promotions?: string | null
          current_step?: number
          customer_problems?: string | null
          differentiators?: string | null
          escalation_situations?: string | null
          essential_info_to_collect?: string | null
          financing_available?: string | null
          financing_options?: string | null
          first_time_discount?: string | null
          first_time_discount_description?: string | null
          followup_process?: string | null
          frequent_questions?: string | null
          has_warranty?: string | null
          hot_lead_criteria?: string | null
          hours_of_operation?: string | null
          id?: string
          ideal_customer_tone?: string | null
          is_complete?: boolean
          lead_notification_recipients?: string | null
          lead_tagging?: string | null
          main_competitors?: string | null
          nurturing_signals?: string | null
          organization_id: string
          other_integrations?: string | null
          price_objection_handling?: string | null
          pricing_discussion_approach?: string | null
          primary_goal?: string | null
          qualifying_questions?: string | null
          reasons_people_dont_book?: string | null
          regulatory_requirements?: string | null
          required_disclosures?: string | null
          scheduling_window?: string | null
          services_offered?: string | null
          special_offers_frequency?: string | null
          trust_building_elements?: string | null
          unique_selling_propositions?: string | null
          updated_at?: string
          warranty_guarantee_messaging?: string | null
          words_to_avoid?: string | null
          words_to_use?: string | null
        }
        Update: {
          agent_limitations?: string | null
          appointment_durations?: string | null
          awards_certifications?: string | null
          blackout_dates?: string | null
          booking_process?: string | null
          booking_system_fields?: string | null
          business_address?: string | null
          business_city?: string | null
          business_coverage?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_state?: string | null
          business_type?: string | null
          business_website?: string | null
          business_zip?: string | null
          calendar_api?: string | null
          calendar_integration?: string | null
          calendar_name?: string | null
          caller_decision_stage?: string | null
          common_objections?: string | null
          communication_style?: string | null
          consultation_triggers?: string | null
          created_at?: string
          crm_system?: string | null
          current_promotions?: string | null
          current_step?: number
          customer_problems?: string | null
          differentiators?: string | null
          escalation_situations?: string | null
          essential_info_to_collect?: string | null
          financing_available?: string | null
          financing_options?: string | null
          first_time_discount?: string | null
          first_time_discount_description?: string | null
          followup_process?: string | null
          frequent_questions?: string | null
          has_warranty?: string | null
          hot_lead_criteria?: string | null
          hours_of_operation?: string | null
          id?: string
          ideal_customer_tone?: string | null
          is_complete?: boolean
          lead_notification_recipients?: string | null
          lead_tagging?: string | null
          main_competitors?: string | null
          nurturing_signals?: string | null
          organization_id?: string
          other_integrations?: string | null
          price_objection_handling?: string | null
          pricing_discussion_approach?: string | null
          primary_goal?: string | null
          qualifying_questions?: string | null
          reasons_people_dont_book?: string | null
          regulatory_requirements?: string | null
          required_disclosures?: string | null
          scheduling_window?: string | null
          services_offered?: string | null
          special_offers_frequency?: string | null
          trust_building_elements?: string | null
          unique_selling_propositions?: string | null
          updated_at?: string
          warranty_guarantee_messaging?: string | null
          words_to_avoid?: string | null
          words_to_use?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_intake_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding_questionnaire: {
        Row: {
          answer_options: string | null
          answer_options_1: string | null
          answer_options_2: string | null
          created_at: string
          field_type: string | null
          id: number
          is_active: boolean | null
          question: string | null
          section: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          answer_options?: string | null
          answer_options_1?: string | null
          answer_options_2?: string | null
          created_at?: string
          field_type?: string | null
          id?: number
          is_active?: boolean | null
          question?: string | null
          section?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          answer_options?: string | null
          answer_options_1?: string | null
          answer_options_2?: string | null
          created_at?: string
          field_type?: string | null
          id?: number
          is_active?: boolean | null
          question?: string | null
          section?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          industry: string | null
          is_active: boolean
          name: string
          onboarding_completed: boolean
          owner_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string | null
          is_active?: boolean
          name: string
          onboarding_completed?: boolean
          owner_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string | null
          is_active?: boolean
          name?: string
          onboarding_completed?: boolean
          owner_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_client_intake: {
        Args: { p_organization_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
