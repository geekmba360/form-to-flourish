-- Add foreign key constraint between intake_forms and orders
ALTER TABLE public.intake_forms 
ADD CONSTRAINT fk_intake_forms_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;