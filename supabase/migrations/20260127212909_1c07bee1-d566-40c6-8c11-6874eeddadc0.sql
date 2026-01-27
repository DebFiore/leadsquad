-- Create a security definer function to create intake records
-- This bypasses RLS timing issues during onboarding when org is just created

CREATE OR REPLACE FUNCTION public.create_client_intake(p_organization_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_intake_id uuid;
BEGIN
  -- Verify the user owns this organization (security check)
  IF NOT EXISTS (
    SELECT 1 FROM organizations 
    WHERE id = p_organization_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized to create intake for this organization';
  END IF;

  -- Check if intake already exists
  SELECT id INTO v_intake_id 
  FROM client_intake_responses 
  WHERE organization_id = p_organization_id;
  
  IF v_intake_id IS NOT NULL THEN
    RETURN v_intake_id;
  END IF;

  -- Create the intake record
  INSERT INTO client_intake_responses (organization_id)
  VALUES (p_organization_id)
  RETURNING id INTO v_intake_id;
  
  RETURN v_intake_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_client_intake(uuid) TO authenticated;