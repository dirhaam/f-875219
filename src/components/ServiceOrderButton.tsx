
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart } from 'lucide-react';
import OrderForm from './OrderForm';

interface ServiceOrderButtonProps {
  serviceId: string;
  serviceName: string;
}

const ServiceOrderButton = ({ serviceId, serviceName }: ServiceOrderButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2" size="sm">
          <ShoppingCart className="h-4 w-4" />
          Pesan Sekarang
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pesan Layanan: {serviceName}</DialogTitle>
        </DialogHeader>
        <OrderForm 
          onClose={() => setIsOpen(false)} 
          preselectedServiceId={serviceId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceOrderButton;
