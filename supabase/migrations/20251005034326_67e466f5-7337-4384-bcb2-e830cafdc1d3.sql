-- Security fix for intake_forms: Prevent token reuse and add timestamp validation

-- Step 1: Add unique constraint to prevent duplicate submissions per order
ALTER TABLE public.intake_forms 
ADD CONSTRAINT intake_forms_order_id_unique UNIQUE (order_id);

-- Step 2: Add intake_submitted flag to orders table to track submission status
ALTER TABLE public.orders
ADD COLUMN intake_submitted BOOLEAN DEFAULT FALSE;

-- Step 3: Update existing orders that have intake forms submitted
UPDATE public.orders o
SET intake_submitted = TRUE
WHERE EXISTS (
  SELECT 1 FROM public.intake_forms i
  WHERE i.order_id = o.id
);

-- Step 4: Drop the existing INSERT policy
DROP POLICY IF EXISTS "Allow insert with valid submission token" ON public.intake_forms;

-- Step 5: Create new secure INSERT policy with multiple security checks
CREATE POLICY "Allow insert with valid submission token and timestamp"
ON public.intake_forms
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.id = intake_forms.order_id
      -- Token must match
      AND orders.submission_token = intake_forms.submission_token
      -- Order must be in valid status
      AND orders.status IN ('pending', 'completed')
      -- Intake form must not have been submitted yet
      AND orders.intake_submitted = FALSE
      -- Token must be used within 30 days of order creation
      AND orders.created_at > (now() - INTERVAL '30 days')
  )
);

-- Step 6: Create trigger to update orders.intake_submitted when intake form is submitted
CREATE OR REPLACE FUNCTION public.mark_intake_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark the order as having intake form submitted
  UPDATE orders
  SET intake_submitted = TRUE
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$;

-- Step 7: Create trigger on intake_forms insert
DROP TRIGGER IF EXISTS mark_intake_submitted_trigger ON public.intake_forms;
CREATE TRIGGER mark_intake_submitted_trigger
AFTER INSERT ON public.intake_forms
FOR EACH ROW
EXECUTE FUNCTION public.mark_intake_submitted();

-- Step 8: Add comment explaining the security measures
COMMENT ON POLICY "Allow insert with valid submission token and timestamp" ON public.intake_forms IS 
'Security policy that prevents: 
1. Token reuse (intake_submitted flag)
2. Expired tokens (30-day limit from order creation)
3. Duplicate submissions (unique constraint on order_id)
4. Invalid order statuses';
