
import React from 'react';
import { Input } from '@/components/ui/input';

interface CustomerInfoSectionProps {
  formData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const CustomerInfoSection = ({ formData, onInputChange }: CustomerInfoSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Nama Lengkap *
        </label>
        <Input
          type="text"
          placeholder="Masukkan nama lengkap"
          value={formData.customer_name}
          onChange={(e) => onInputChange('customer_name', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Email *
        </label>
        <Input
          type="email"
          placeholder="nama@email.com"
          value={formData.customer_email}
          onChange={(e) => onInputChange('customer_email', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium text-foreground">
          Nomor Telepon
        </label>
        <Input
          type="tel"
          placeholder="08123456789"
          value={formData.customer_phone}
          onChange={(e) => onInputChange('customer_phone', e.target.value)}
        />
      </div>
    </div>
  );
};

export default CustomerInfoSection;
