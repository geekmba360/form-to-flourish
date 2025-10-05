-- Allow anonymous users to submit intake forms with valid tokens
DROP POLICY IF EXISTS "Allow insert with valid submission token" ON public.intake_forms;

CREATE POLICY "Allow insert with valid submission token"
ON public.intake_forms
FOR INSERT
TO anon, authenticated
WITH CHECK (public.validate_intake_submission(order_id, submission_token));