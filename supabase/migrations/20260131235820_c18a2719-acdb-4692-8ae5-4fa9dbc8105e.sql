-- Create an RPC function to update client intake responses
-- This bypasses PostgREST schema cache validation issues
CREATE OR REPLACE FUNCTION public.update_client_intake(
  p_intake_id uuid,
  p_updates jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
  v_org_id uuid;
  v_user_id uuid;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get the organization_id for this intake
  SELECT organization_id INTO v_org_id
  FROM client_intake_responses
  WHERE id = p_intake_id;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Intake not found';
  END IF;
  
  -- Verify user has access to this organization
  IF NOT EXISTS (
    SELECT 1 FROM organizations WHERE id = v_org_id AND owner_id = v_user_id
    UNION
    SELECT 1 FROM organization_members WHERE organization_id = v_org_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Not authorized to update this intake';
  END IF;

  -- Update the record dynamically using the JSONB updates
  UPDATE client_intake_responses
  SET 
    business_name = COALESCE(p_updates->>'business_name', business_name),
    business_address = COALESCE(p_updates->>'business_address', business_address),
    business_city = COALESCE(p_updates->>'business_city', business_city),
    business_state = COALESCE(p_updates->>'business_state', business_state),
    business_zip = COALESCE(p_updates->>'business_zip', business_zip),
    business_phone = COALESCE(p_updates->>'business_phone', business_phone),
    business_website = COALESCE(p_updates->>'business_website', business_website),
    hours_of_operation = COALESCE(p_updates->>'hours_of_operation', hours_of_operation),
    business_coverage = COALESCE(p_updates->>'business_coverage', business_coverage),
    business_type = COALESCE(p_updates->>'business_type', business_type),
    services_offered = COALESCE(p_updates->>'services_offered', services_offered),
    communication_style = COALESCE(p_updates->>'communication_style', communication_style),
    words_to_use = COALESCE(p_updates->>'words_to_use', words_to_use),
    words_to_avoid = COALESCE(p_updates->>'words_to_avoid', words_to_avoid),
    ideal_customer_tone = COALESCE(p_updates->>'ideal_customer_tone', ideal_customer_tone),
    customer_problems = COALESCE(p_updates->>'customer_problems', customer_problems),
    frequent_questions = COALESCE(p_updates->>'frequent_questions', frequent_questions),
    common_objections = COALESCE(p_updates->>'common_objections', common_objections),
    caller_decision_stage = COALESCE(p_updates->>'caller_decision_stage', caller_decision_stage),
    essential_info_to_collect = COALESCE(p_updates->>'essential_info_to_collect', essential_info_to_collect),
    hot_lead_criteria = COALESCE(p_updates->>'hot_lead_criteria', hot_lead_criteria),
    nurturing_signals = COALESCE(p_updates->>'nurturing_signals', nurturing_signals),
    qualifying_questions = COALESCE(p_updates->>'qualifying_questions', qualifying_questions),
    escalation_situations = COALESCE(p_updates->>'escalation_situations', escalation_situations),
    booking_process = COALESCE(p_updates->>'booking_process', booking_process),
    scheduling_window = COALESCE(p_updates->>'scheduling_window', scheduling_window),
    appointment_durations = COALESCE(p_updates->>'appointment_durations', appointment_durations),
    blackout_dates = COALESCE(p_updates->>'blackout_dates', blackout_dates),
    calendar_integration = COALESCE(p_updates->>'calendar_integration', calendar_integration),
    calendar_name = COALESCE(p_updates->>'calendar_name', calendar_name),
    calendar_api = COALESCE(p_updates->>'calendar_api', calendar_api),
    pricing_discussion_approach = COALESCE(p_updates->>'pricing_discussion_approach', pricing_discussion_approach),
    special_offers_frequency = COALESCE(p_updates->>'special_offers_frequency', special_offers_frequency),
    first_time_discount = COALESCE(p_updates->>'first_time_discount', first_time_discount),
    first_time_discount_description = COALESCE(p_updates->>'first_time_discount_description', first_time_discount_description),
    financing_available = COALESCE(p_updates->>'financing_available', financing_available),
    financing_options = COALESCE(p_updates->>'financing_options', financing_options),
    current_promotions = COALESCE(p_updates->>'current_promotions', current_promotions),
    consultation_triggers = COALESCE(p_updates->>'consultation_triggers', consultation_triggers),
    main_competitors = COALESCE(p_updates->>'main_competitors', main_competitors),
    differentiators = COALESCE(p_updates->>'differentiators', differentiators),
    unique_selling_propositions = COALESCE(p_updates->>'unique_selling_propositions', unique_selling_propositions),
    awards_certifications = COALESCE(p_updates->>'awards_certifications', awards_certifications),
    reasons_people_dont_book = COALESCE(p_updates->>'reasons_people_dont_book', reasons_people_dont_book),
    price_objection_handling = COALESCE(p_updates->>'price_objection_handling', price_objection_handling),
    has_warranty = COALESCE(p_updates->>'has_warranty', has_warranty),
    warranty_guarantee_messaging = COALESCE(p_updates->>'warranty_guarantee_messaging', warranty_guarantee_messaging),
    trust_building_elements = COALESCE(p_updates->>'trust_building_elements', trust_building_elements),
    primary_goal = COALESCE(p_updates->>'primary_goal', primary_goal),
    followup_process = COALESCE(p_updates->>'followup_process', followup_process),
    lead_notification_recipients = COALESCE(p_updates->>'lead_notification_recipients', lead_notification_recipients),
    regulatory_requirements = COALESCE(p_updates->>'regulatory_requirements', regulatory_requirements),
    agent_limitations = COALESCE(p_updates->>'agent_limitations', agent_limitations),
    required_disclosures = COALESCE(p_updates->>'required_disclosures', required_disclosures),
    crm_system = COALESCE(p_updates->>'crm_system', crm_system),
    lead_tagging = COALESCE(p_updates->>'lead_tagging', lead_tagging),
    booking_system_fields = COALESCE(p_updates->>'booking_system_fields', booking_system_fields),
    other_integrations = COALESCE(p_updates->>'other_integrations', other_integrations),
    current_step = COALESCE((p_updates->>'current_step')::integer, current_step),
    is_complete = COALESCE((p_updates->>'is_complete')::boolean, is_complete),
    updated_at = now()
  WHERE id = p_intake_id;
  
  -- Return the updated record as JSONB
  SELECT to_jsonb(cir.*) INTO v_result
  FROM client_intake_responses cir
  WHERE id = p_intake_id;
  
  RETURN v_result;
END;
$function$;

-- Also add a comment to force schema cache refresh
COMMENT ON TABLE public.client_intake_responses IS 'Stores client intake questionnaire responses - schema refreshed';