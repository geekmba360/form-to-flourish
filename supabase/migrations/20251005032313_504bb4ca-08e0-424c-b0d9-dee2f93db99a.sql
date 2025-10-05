-- Update the INSERT policy to allow submissions for both pending and completed orders
-- This fixes the issue where users can't submit intake forms for pending orders

DROP POLICY IF EXISTS "Allow insert with valid submission token" ON public.intake_forms;

CREATE POLICY "Allow insert with valid submission token"
ON public.intake_forms
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.id = intake_forms.order_id
      AND orders.submission_token = intake_forms.submission_token
      AND orders.status IN ('pending', 'completed')
  )
);