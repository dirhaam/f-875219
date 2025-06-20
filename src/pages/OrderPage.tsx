
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import OrderForm from '@/components/OrderForm';

const OrderPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="absolute inset-0 cosmic-grid opacity-20"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pesan Layanan Digital
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Wujudkan proyek digital impian Anda bersama tim profesional kami. 
            Isi form di bawah dan kami akan menghubungi Anda dalam 24 jam.
          </p>
        </div>
        
        <OrderForm onClose={() => navigate('/')} />
      </div>
    </div>
  );
};

export default OrderPage;
