-- Fix intake_forms RLS policies to properly protect PII
-- Remove conflicting policies and recreate as PERMISSIVE

-- Drop all existing policies on intake_forms
DROP POLICY IF EXISTS "Only admins can view intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Deny anonymous access to intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Only admins can update intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Only admins can delete intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Allow insert with valid submission token and timestamp" ON public.intake_forms;

-- Create PERMISSIVE policies for proper access control

-- SELECT: Only admins can view PII
CREATE POLICY "Only admins can view intake forms"
ON public.intake_forms
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- INSERT: Allow submissions with valid token (for customer intake form submissions)
CREATE POLICY "Allow insert with valid submission token"
ON public.intake_forms
FOR INSERT
TO authenticated
WITH CHECK (public.validate_intake_submission(order_id, submission_token));

-- UPDATE: Only admins can modify intake forms
CREATE POLICY "Only admins can update intake forms"
ON public.intake_forms
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- DELETE: Only admins can delete intake forms
CREATE POLICY "Only admins can delete intake forms"
ON public.intake_forms
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add comment explaining the security model
COMMENT ON TABLE public.intake_forms IS 'Contains sensitive customer PII. Access restricted to admins only via RLS. Customers can insert via validated submission tokens.';