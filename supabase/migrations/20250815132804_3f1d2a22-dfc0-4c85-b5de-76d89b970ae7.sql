-- Add admin role for the authenticated user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('b4a9263b-8558-457c-8419-e850954d493f', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;