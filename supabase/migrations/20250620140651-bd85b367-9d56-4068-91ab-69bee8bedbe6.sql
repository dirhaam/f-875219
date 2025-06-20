
-- Create table for landing page content
CREATE TABLE public.landing_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  is_enabled BOOLEAN DEFAULT true,
  section_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for testimonials
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_position TEXT,
  company TEXT,
  testimonial TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for footer content
CREATE TABLE public.footer_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  column_title TEXT NOT NULL,
  links TEXT[] DEFAULT '{}',
  column_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for system settings
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.settings (setting_key, setting_value) VALUES
('email_config', '{"smtp_host": "", "smtp_port": "", "smtp_user": "", "smtp_password": "", "from_email": "", "from_name": ""}'),
('company_info', '{"name": "Digital Service Company", "address": "", "phone": "", "email": "", "website": "", "tax_number": ""}'),
('invoice_config', '{"prefix": "INV", "tax_rate": 0, "payment_terms": "30 days", "notes": ""}');

-- Add some sample landing content
INSERT INTO public.landing_content (section_name, title, subtitle, content, section_order) VALUES
('hero', 'Solusi Digital untuk Bisnis Modern', 'Wujudkan visi digital Anda', 'Dari website hingga aplikasi mobile, kami siap membantu mengembangkan bisnis Anda ke level selanjutnya.', 1),
('services', 'Layanan Kami', 'Solusi digital komprehensif', 'Berbagai layanan digital untuk memenuhi kebutuhan bisnis Anda.', 2),
('portfolio', 'Portfolio Kami', 'Karya terbaik kami', 'Lihat berbagai proyek yang telah kami kerjakan dengan hasil yang memuaskan.', 3);

-- Add sample testimonials
INSERT INTO public.testimonials (customer_name, customer_position, company, testimonial, rating, is_featured) VALUES
('Sarah Johnson', 'CEO', 'TechCorp', 'Pelayanan yang sangat memuaskan dan hasil yang berkualitas tinggi.', 5, true),
('Michael Chen', 'Head of Marketing', 'StartupXYZ', 'Tim yang profesional dan responsif terhadap kebutuhan kami.', 5, true),
('Leila Rodriguez', 'Operations Director', 'GlobalBiz', 'Solusi digital yang tepat untuk mengembangkan bisnis kami.', 5, false);

-- Add sample footer content
INSERT INTO public.footer_content (column_title, links, column_order) VALUES
('Layanan', '{"Website Development", "Mobile App", "UI/UX Design", "Digital Marketing"}', 1),
('Perusahaan', '{"Tentang Kami", "Tim", "Karir", "Kontak"}', 2),
('Dukungan', '{"FAQ", "Dokumentasi", "Support", "Blog"}', 3);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow admin access
CREATE POLICY "Admin can manage landing content" ON public.landing_content FOR ALL USING (true);
CREATE POLICY "Admin can manage testimonials" ON public.testimonials FOR ALL USING (true);
CREATE POLICY "Admin can manage footer content" ON public.footer_content FOR ALL USING (true);
CREATE POLICY "Admin can manage settings" ON public.settings FOR ALL USING (true);

-- Allow public read access to enabled content
CREATE POLICY "Public can view enabled landing content" ON public.landing_content FOR SELECT USING (is_enabled = true);
CREATE POLICY "Public can view featured testimonials" ON public.testimonials FOR SELECT USING (is_featured = true);
CREATE POLICY "Public can view enabled footer content" ON public.footer_content FOR SELECT USING (is_enabled = true);
