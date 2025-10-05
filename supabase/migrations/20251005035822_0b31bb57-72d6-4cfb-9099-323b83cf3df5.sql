-- Create a security definer function to validate intake form submission
-- This bypasses RLS when checking orders table for anonymous users
CREATE OR REPLACE FUNCTION public.validate_intake_submission(
  _order_id uuid,
  _submission_token uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.id = _order_id
      AND orders.submission_token IS NOT DISTINCT FROM _submission_token
      AND orders.status IN ('pending', 'completed')
      AND orders.intake_submitted = FALSE
      AND orders.created_at > (now() - INTERVAL '30 days')
  )
$$;

-- Update the INSERT policy to use the security definer function
-- This allows anonymous users to submit intake forms
DROP POLICY IF EXISTS "Allow insert with valid submission token and timestamp" ON public.intake_forms;

CREATE POLICY "Allow insert with valid submission token and timestamp"
ON public.intake_forms
FOR INSERT
TO anon, authenticated
WITH CHECK (
  public.validate_intake_submission(order_id, submission_token)
);

COMMENT ON FUNCTION public.validate_intake_submission IS 
'Security definer function to validate intake form submissions.
Bypasses RLS to check orders table for anonymous users.
Security protections:
1. Token reuse (intake_submitted flag)
2. Expired tokens (30-day limit)  
3. Invalid order statuses
4. Uses IS NOT DISTINCT FROM for NULL token handling';

COMMENT ON POLICY "Allow insert with valid submission token and timestamp" ON public.intake_forms IS 
'Allows anonymous and authenticated users to submit intake forms with valid tokens.
Uses security definer function to validate against orders table.';