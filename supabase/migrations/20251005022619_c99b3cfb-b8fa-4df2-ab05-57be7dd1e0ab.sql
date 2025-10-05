-- Drop insecure policies that use HTTP headers
DROP POLICY IF EXISTS "Users can view own intake forms by email" ON public.intake_forms;
DROP POLICY IF EXISTS "Users can update own recent intake forms" ON public.intake_forms;