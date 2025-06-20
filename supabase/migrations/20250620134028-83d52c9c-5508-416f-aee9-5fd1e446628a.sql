
-- Create services table for digital services offered
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  features TEXT[],
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio table for showcasing work
CREATE TABLE public.portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  project_url TEXT,
  technologies TEXT[],
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table for customer orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  service_id UUID REFERENCES public.services(id),
  custom_requirements TEXT,
  budget_range TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2),
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deadline_date DATE,
  notes TEXT
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  invoice_number TEXT UNIQUE NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  payment_terms TEXT DEFAULT '30 days',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'manager')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for services (public read, admin write)
CREATE POLICY "Services are viewable by everyone" 
  ON public.services FOR SELECT USING (true);

CREATE POLICY "Only admins can manage services" 
  ON public.services FOR ALL 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Create policies for portfolio (public read, admin write)
CREATE POLICY "Portfolio is viewable by everyone" 
  ON public.portfolio FOR SELECT USING (true);

CREATE POLICY "Only admins can manage portfolio" 
  ON public.portfolio FOR ALL 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Create policies for orders (admin only)
CREATE POLICY "Only admins can view orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Anyone can create orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Only admins can update orders" 
  ON public.orders FOR UPDATE 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Create policies for invoices (admin only)
CREATE POLICY "Only admins can manage invoices" 
  ON public.invoices FOR ALL 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Create policies for profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Insert sample services
INSERT INTO public.services (name, description, price, features, category) VALUES
('Website Development', 'Custom website development with modern design', 2500000, ARRAY['Responsive Design', 'SEO Optimized', 'Mobile Friendly', 'Admin Panel'], 'web'),
('Mobile App Development', 'Native and cross-platform mobile applications', 5000000, ARRAY['iOS & Android', 'Push Notifications', 'Offline Support', 'API Integration'], 'mobile'),
('Digital Marketing', 'Complete digital marketing strategy and execution', 1500000, ARRAY['Social Media Management', 'Google Ads', 'Content Creation', 'Analytics'], 'marketing'),
('UI/UX Design', 'User interface and experience design for digital products', 1000000, ARRAY['Wireframing', 'Prototyping', 'User Research', 'Design System'], 'design');

-- Insert sample portfolio items
INSERT INTO public.portfolio (title, description, technologies, category, is_featured) VALUES
('E-commerce Platform', 'Modern e-commerce solution with advanced features', ARRAY['React', 'Node.js', 'MongoDB', 'Stripe'], 'web', true),
('Mobile Banking App', 'Secure banking application for iOS and Android', ARRAY['React Native', 'TypeScript', 'Firebase'], 'mobile', true),
('Restaurant Brand Identity', 'Complete branding package for restaurant chain', ARRAY['Adobe Illustrator', 'Photoshop', 'Figma'], 'design', false),
('SaaS Dashboard', 'Analytics dashboard for SaaS businesses', ARRAY['Vue.js', 'Python', 'PostgreSQL'], 'web', true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_num TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.invoices
    WHERE invoice_number LIKE 'INV-%';
    
    invoice_num := 'INV-' || LPAD(next_number::TEXT, 4, '0');
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;
