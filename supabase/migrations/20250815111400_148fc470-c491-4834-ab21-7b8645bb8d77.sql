-- Fix security vulnerability in orders table RLS policy
-- Remove email-based access which allows unauthorized access to other users' orders

-- Drop the existing insecure policy
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create a new secure policy that only allows:
-- 1. Admins to view all orders
-- 2. Authenticated users to view only their own orders (user_id based)
-- 3. Edge functions with service role to access orders (for payment processing)
CREATE POLICY "Secure order access" 
ON public.orders 
FOR SELECT 
USING (
  -- Allow admins to view all orders
  has_role(auth.uid(), 'admin'::app_role) 
  OR 
  -- Allow users to view only their own orders where user_id matches
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- Update the insert policy to be more secure as well
DROP POLICY IF EXISTS "Secure order creation" ON public.orders;

CREATE POLICY "Secure order creation" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Allow admins to create orders
  has_role(auth.uid(), 'admin'::app_role) 
  OR 
  -- Allow users to create orders for themselves
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Allow service role (for guest purchases via edge functions)
  auth.role() = 'service_role'
);

-- Update the update policy to be more secure
DROP POLICY IF EXISTS "Secure order updates" ON public.orders;

CREATE POLICY "Secure order updates" 
ON public.orders 
FOR UPDATE 
USING (
  -- Allow admins to update all orders
  has_role(auth.uid(), 'admin'::app_role) 
  OR 
  -- Allow users to update only their own orders
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Allow service role (for payment processing)
  auth.role() = 'service_role'
);