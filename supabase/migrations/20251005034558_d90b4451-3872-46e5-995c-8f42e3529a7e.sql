-- Add UPDATE policy to prevent unauthorized modifications to intake forms
-- This ensures that intake form data cannot be tampered with after submission

CREATE POLICY "Only admins can update intake forms"
ON public.intake_forms
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));