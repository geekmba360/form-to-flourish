-- Drop existing policies that may be misconfigured
DROP POLICY IF EXISTS "Secure order access" ON public.orders;
DROP POLICY IF EXISTS "Secure order creation" ON public.orders;
DROP POLICY IF EXISTS "Secure order updates" ON public.orders;

-- Create PERMISSIVE SELECT policy that explicitly denies public access
-- Only authenticated users can view their own orders, or admins can view all
CREATE POLICY "Users can view own orders, admins view all"
ON public.orders
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (user_id = auth.uid())
);

-- Create PERMISSIVE INSERT policy
-- Service role can insert (for Stripe webhook), authenticated users can create their own orders
CREATE POLICY "Authenticated users can create own orders"
ON public.orders
AS PERMISSIVE
FOR INSERT
TO authenticated, service_role
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (user_id = auth.uid())
  OR (auth.role() = 'service_role'::text)
);

-- Create PERMISSIVE UPDATE policy
-- Users can update their own orders, admins can update all, service role can update (for webhooks)
CREATE POLICY "Users can update own orders"
ON public.orders
AS PERMISSIVE
FOR UPDATE
TO authenticated, service_role
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (user_id = auth.uid())
  OR (auth.role() = 'service_role'::text)
);

-- Add DELETE policy for admins only
CREATE POLICY "Only admins can delete orders"
ON public.orders
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));