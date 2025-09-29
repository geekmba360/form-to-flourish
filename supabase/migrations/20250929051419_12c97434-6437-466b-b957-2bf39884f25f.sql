-- Add DELETE policy for admins on intake_forms table
CREATE POLICY "Only admins can delete intake forms" 
ON public.intake_forms 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));