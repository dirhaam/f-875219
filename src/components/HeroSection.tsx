
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  const { data: services } = useQuery({
    queryKey: ['featured-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full py-12 md:py-20 px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Cosmic particle effect (background dots) */}
      <div className="absolute inset-0 cosmic-grid opacity-30"></div>
      
      {/* Gradient glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full">
        <div className="w-full h-full opacity-10 bg-primary blur-[120px]"></div>
      </div>
      
      <div className={`relative z-10 max-w-4xl text-center space-y-6 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-muted text-primary">
            <Star className="h-3 w-3 text-primary fill-current" />
            Layanan Digital Terpercaya
            <CheckCircle className="h-3 w-3 text-primary" />
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tighter text-balance text-foreground">
          Solusi Digital untuk <span className="text-primary">Bisnis Modern</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Wujudkan visi digital Anda dengan layanan profesional kami. Dari website hingga aplikasi mobile, kami siap membantu mengembangkan bisnis Anda ke level selanjutnya.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 items-center">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground text-base h-12 px-8 transition-all duration-200 min-h-[48px]">
            Mulai Proyek <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground text-base h-12 px-8 transition-all duration-200 min-h-[48px]">
            Lihat Portfolio
          </Button>
        </div>
        
        <div className="pt-6 text-sm text-muted-foreground">
          Konsultasi gratis • Garansi kepuasan • Tim berpengalaman
        </div>
      </div>
      
      {/* Services Preview */}
      <div className={`w-full max-w-7xl mt-16 z-10 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">Layanan Kami</h2>
          <p className="text-muted-foreground">Solusi digital komprehensif untuk kebutuhan bisnis Anda</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <div key={service.id} className="cosmic-glow relative rounded-xl overflow-hidden border border-border backdrop-blur-sm bg-card shadow-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
                  <span className="text-sm text-primary font-medium">
                    {service.category?.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-muted-foreground text-sm">{service.description}</p>
                
                <div className="space-y-2">
                  {service.features?.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <span className="text-lg font-semibold text-foreground">
                    Rp {service.price?.toLocaleString('id-ID')}
                  </span>
                  <Button size="sm" variant="outline">
                    Detail
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
