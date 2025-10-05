-- Add explicit policies to deny anonymous access to sensitive data

-- Deny anonymous access to orders table (contains payment data)
CREATE POLICY "Deny anonymous access to orders"
ON public.orders
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to intake_forms table (contains PII)
CREATE POLICY "Deny anonymous access to intake_forms"
ON public.intake_forms
FOR SELECT
TO anon
USING (false);