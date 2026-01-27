-- Fix organization RLS policies to be PERMISSIVE as well
DROP POLICY IF EXISTS "Users can create their own organizations " ON organizations;
DROP POLICY IF EXISTS "Users can update their own organizations " ON organizations;
DROP POLICY IF EXISTS "Users can view their own organizations " ON organizations;

-- Recreate as PERMISSIVE
CREATE POLICY "Users can create own organizations"
ON organizations
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can view own organizations"
ON organizations
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Users can update own organizations"
ON organizations
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());