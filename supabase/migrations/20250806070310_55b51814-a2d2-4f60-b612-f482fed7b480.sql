-- Create intake_forms table
CREATE TABLE public.intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin TEXT,
  resume_url TEXT,
  job_url TEXT,
  job_description TEXT NOT NULL,
  additional_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert intake forms" 
ON public.intake_forms 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view intake forms" 
ON public.intake_forms 
FOR SELECT 
USING (true);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Create storage policies for resumes
CREATE POLICY "Anyone can upload resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Anyone can view resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes');

-- Create trigger for updated_at
CREATE TRIGGER update_intake_forms_updated_at
BEFORE UPDATE ON public.intake_forms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();