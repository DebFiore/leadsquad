-- Drop existing RESTRICTIVE policies and recreate as PERMISSIVE

-- Client Intake Responses
DROP POLICY IF EXISTS "Users can create their organization's intake" ON public.client_intake_responses;
DROP POLICY IF EXISTS "Users can update their organization's intake" ON public.client_intake_responses;
DROP POLICY IF EXISTS "Users can view their organization's intake" ON public.client_intake_responses;

CREATE POLICY "Users can view their organization's intake"
ON public.client_intake_responses
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their organization's intake"
ON public.client_intake_responses
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their organization's intake"
ON public.client_intake_responses
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- Organizations
DROP POLICY IF EXISTS "Users can create their own organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can update their own organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their own organizations" ON public.organizations;

CREATE POLICY "Users can view their own organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own organizations"
ON public.organizations
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

-- Organization Members
DROP POLICY IF EXISTS "Org owners can manage members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can insert their own membership" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view their organization memberships" ON public.organization_members;

CREATE POLICY "Users can view their organization memberships"
ON public.organization_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own membership"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Org owners can manage members"
ON public.organization_members
FOR ALL
TO authenticated
USING (
  organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);