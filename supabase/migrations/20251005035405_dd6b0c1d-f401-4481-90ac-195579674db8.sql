-- Fix the INSERT policy to be PERMISSIVE instead of RESTRICTIVE
-- RESTRICTIVE policies are AND'd together and can block legitimate access

DROP POLICY IF EXISTS "Allow insert with valid submission token and timestamp" ON public.intake_forms;

CREATE POLICY "Allow insert with valid submission token and timestamp"
ON public.intake_forms
AS PERMISSIVE
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.id = intake_forms.order_id
      -- Token must match (handles NULL properly)
      AND orders.submission_token IS NOT DISTINCT FROM intake_forms.submission_token
      -- Order must be in valid status
      AND orders.status IN ('pending', 'completed')
      -- Intake form must not have been submitted yet
      AND orders.intake_submitted = FALSE
      -- Token must be used within 30 days of order creation
      AND orders.created_at > (now() - INTERVAL '30 days')
  )
);

COMMENT ON POLICY "Allow insert with valid submission token and timestamp" ON public.intake_forms IS 
'PERMISSIVE policy that allows submissions with valid tokens.
Security protections:
1. Token reuse (intake_submitted flag)
2. Expired tokens (30-day limit)
3. Duplicate submissions (unique constraint on order_id)
4. Invalid order statuses
5. Uses IS NOT DISTINCT FROM for NULL token handling';