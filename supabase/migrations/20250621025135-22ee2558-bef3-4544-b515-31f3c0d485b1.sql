
-- Update orders table to support downpayment
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS downpayment_percentage NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS downpayment_amount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT 0;

-- Update invoices table to support different invoice types
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_type TEXT DEFAULT 'full' CHECK (invoice_type IN ('full', 'downpayment', 'remaining'));
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS downpayment_percentage NUMERIC DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_downpayment BOOLEAN DEFAULT false;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS related_invoice_id UUID REFERENCES public.invoices(id);

-- Add GDPR consent table
CREATE TABLE IF NOT EXISTS public.gdpr_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session TEXT NOT NULL,
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS for GDPR consents
ALTER TABLE public.gdpr_consents ENABLE ROW LEVEL SECURITY;

-- Create policy for GDPR consents (public read/write since it's for anonymous users)
CREATE POLICY "Anyone can manage GDPR consents" ON public.gdpr_consents FOR ALL USING (true);

-- Update footer_content structure to support individual link management
ALTER TABLE public.footer_content DROP COLUMN IF EXISTS links;
ALTER TABLE public.footer_content ADD COLUMN IF NOT EXISTS link_text TEXT;
ALTER TABLE public.footer_content ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE public.footer_content ADD COLUMN IF NOT EXISTS parent_column TEXT;
ALTER TABLE public.footer_content ALTER COLUMN column_title DROP NOT NULL;

-- Clear existing data and insert new structure
TRUNCATE TABLE public.footer_content;

-- Insert footer links with proper structure
INSERT INTO public.footer_content (column_title, parent_column, link_text, link_url, column_order, is_enabled) VALUES
('Layanan', 'Layanan', 'Website Development', '#', 1, true),
('Layanan', 'Layanan', 'Mobile App', '#', 2, true),
('Layanan', 'Layanan', 'UI/UX Design', '#', 3, true),
('Layanan', 'Layanan', 'Digital Marketing', '#', 4, true),
('Perusahaan', 'Perusahaan', 'Tentang Kami', '#', 1, true),
('Perusahaan', 'Perusahaan', 'Tim', '#', 2, true),
('Perusahaan', 'Perusahaan', 'Karir', '#', 3, true),
('Perusahaan', 'Perusahaan', 'Kontak', '#', 4, true),
('Dukungan', 'Dukungan', 'FAQ', '#', 1, true),
('Dukungan', 'Dukungan', 'Dokumentasi', '#', 2, true),
('Dukungan', 'Dukungan', 'Support', '#', 3, true),
('Dukungan', 'Dukungan', 'Blog', '#', 4, true);
