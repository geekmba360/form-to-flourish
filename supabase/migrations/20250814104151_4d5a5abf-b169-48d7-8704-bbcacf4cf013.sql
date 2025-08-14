-- Drop the insecure update policy that allows anyone to modify orders
DROP POLICY IF EXISTS "update_order" ON public.orders;

-- Create a secure update policy that only allows:
-- 1. Admin users to update any order
-- 2. Users to update only their own orders (though this is rarely needed)
-- 3. Edge functions bypass this via service role key
CREATE POLICY "Secure order updates" 
ON public.orders 
FOR UPDATE 
USING (
  -- Allow admins to update any order
  public.has_role(auth.uid(), 'admin') 
  OR 
  -- Allow users to update only their own orders
  (user_id = auth.uid() OR customer_email = auth.email())
);

-- Also secure the INSERT policy to be more restrictive
-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "insert_order" ON public.orders;

-- Create a more secure insert policy
-- In practice, orders are usually created by edge functions or the system
CREATE POLICY "Secure order creation" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Allow admins to create orders
  public.has_role(auth.uid(), 'admin')
  OR 
  -- Allow users to create orders for themselves only
  (user_id = auth.uid() OR customer_email = auth.email())
);