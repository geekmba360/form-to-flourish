-- Fix RLS policy to properly handle null submission tokens

DROP POLICY IF EXISTS "Allow insert with valid submission token and timestamp" ON public.intake_forms;

CREATE POLICY "Allow insert with valid submission token and timestamp"
ON public.intake_forms
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
'Security policy that prevents: 
1. Token reuse (intake_submitted flag)
2. Expired tokens (30-day limit from order creation)
3. Duplicate submissions (unique constraint on order_id)
4. Invalid order statuses
Uses IS NOT DISTINCT FROM to properly handle NULL tokens';
