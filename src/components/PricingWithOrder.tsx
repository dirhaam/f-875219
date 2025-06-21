
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import ServiceOrderButton from './ServiceOrderButton';

const PricingWithOrder = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="py-20 px-6 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-96 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Paket Layanan Kami
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pilih paket yang sesuai dengan kebutuhan bisnis Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {services?.map((service, index) => (
            <Card 
              key={service.id} 
              className={`relative hover:shadow-lg transition-shadow ${
                index === 1 ? 'border-primary shadow-md scale-105' : ''
              }`}
            >
              {index === 1 && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Terpopuler
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg text-foreground">{service.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-foreground">
                    Rp {service.price?.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {service.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {service.features?.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4">
                  <ServiceOrderButton 
                    serviceId={service.id} 
                    serviceName={service.name}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Butuh solusi khusus? <br />
            <span className="text-primary font-medium">Hubungi kami untuk konsultasi gratis</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingWithOrder;
