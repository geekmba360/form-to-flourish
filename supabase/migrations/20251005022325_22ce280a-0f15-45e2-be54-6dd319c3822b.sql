-- Add submission token to orders table for secure intake form validation
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS submission_token uuid DEFAULT gen_random_uuid();

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_orders_submission_token ON public.orders(submission_token);

-- Add submission token to intake_forms table
ALTER TABLE public.intake_forms 
ADD COLUMN IF NOT EXISTS submission_token uuid;

-- Drop the insecure "Anyone can insert intake forms" policy
DROP POLICY IF EXISTS "Anyone can insert intake forms" ON public.intake_forms;

-- Create secure INSERT policy that validates submission token
-- This ensures only users with a valid order can submit an intake form
CREATE POLICY "Allow insert with valid submission token"
ON public.intake_forms
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = intake_forms.order_id
    AND orders.submission_token = intake_forms.submission_token
    AND orders.status = 'completed'
  )
);

-- Allow users to view their own intake forms by email
CREATE POLICY "Users can view own intake forms by email"
ON public.intake_forms
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (
  email = current_setting('request.headers', true)::json->>'x-user-email'
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add UPDATE policy so users can correct their submissions within reasonable time
CREATE POLICY "Users can update own recent intake forms"
ON public.intake_forms
AS PERMISSIVE
FOR UPDATE
TO anon, authenticated
USING (
  created_at > (now() - interval '24 hours')
  AND (
    email = current_setting('request.headers', true)::json->>'x-user-email'
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);