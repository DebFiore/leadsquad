-- Fix the RLS policies on client_intake_responses to be PERMISSIVE
-- Restrictive policies require ALL to pass, which causes issues during creation

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create their organization's intake " ON client_intake_responses;
DROP POLICY IF EXISTS "Users can update their organization's intake " ON client_intake_responses;
DROP POLICY IF EXISTS "Users can view their organization's intake " ON client_intake_responses;

-- Recreate as PERMISSIVE (only ONE needs to match)
CREATE POLICY "Users can view their organization intake"
ON client_intake_responses
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their organization intake"
ON client_intake_responses
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- INSERT uses SECURITY DEFINER function, but add permissive policy as fallback
CREATE POLICY "Users can create their organization intake"
ON client_intake_responses
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  )
);