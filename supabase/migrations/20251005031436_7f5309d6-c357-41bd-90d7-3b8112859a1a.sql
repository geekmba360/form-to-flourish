-- Add RESTRICTIVE policy to explicitly deny anonymous access to intake_forms
-- This provides defense-in-depth protection for sensitive applicant data

CREATE POLICY "Deny anonymous access to intake forms"
ON public.intake_forms
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);