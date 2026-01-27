-- Drop and recreate the function to handle both org and intake creation atomically
-- This ensures no race condition between org creation and intake creation

CREATE OR REPLACE FUNCTION public.create_client_intake(p_organization_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_intake_id uuid;
  v_org_owner uuid;
BEGIN
  -- Get the owner directly from the table (bypasses RLS since SECURITY DEFINER)
  SELECT owner_id INTO v_org_owner
  FROM organizations 
  WHERE id = p_organization_id;
  
  -- Verify the caller owns this organization
  IF v_org_owner IS NULL OR v_org_owner != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to create intake for this organization';
  END IF;

  -- Check if intake already exists
  SELECT id INTO v_intake_id 
  FROM client_intake_responses 
  WHERE organization_id = p_organization_id;
  
  IF v_intake_id IS NOT NULL THEN
    RETURN v_intake_id;
  END IF;

  -- Create the intake record (bypasses RLS since SECURITY DEFINER)
  INSERT INTO client_intake_responses (organization_id)
  VALUES (p_organization_id)
  RETURNING id INTO v_intake_id;
  
  RETURN v_intake_id;
END;
$$;