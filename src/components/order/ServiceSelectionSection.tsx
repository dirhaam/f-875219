
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Service {
  id: string;
  name: string;
  price: number;
}

interface ServiceSelectionSectionProps {
  services: Service[] | undefined;
  formData: {
    service_id: string;
    total_amount: number;
    budget_range: string;
    deadline_date: string;
  };
  onInputChange: (field: string, value: string | number) => void;
}

const ServiceSelectionSection = ({ services, formData, onInputChange }: ServiceSelectionSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Pilih Layanan *
        </label>
        <Select 
          value={formData.service_id} 
          onValueChange={(value) => onInputChange('service_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih layanan yang diinginkan" />
          </SelectTrigger>
          <SelectContent>
            {services?.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name} - Rp {service.price?.toLocaleString('id-ID')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Total Harga Proyek (Rp)
        </label>
        <Input
          type="number"
          placeholder="Kosongkan jika menggunakan harga paket"
          value={formData.total_amount || ''}
          onChange={(e) => onInputChange('total_amount', parseFloat(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">
          Isi jika harga berbeda dari paket standar, atau kosongkan untuk menggunakan harga paket
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Budget Range
        </label>
        <Select 
          value={formData.budget_range} 
          onValueChange={(value) => onInputChange('budget_range', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih budget range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="< 5 juta">&lt; 5 juta</SelectItem>
            <SelectItem value="5 - 10 juta">5 - 10 juta</SelectItem>
            <SelectItem value="10 - 25 juta">10 - 25 juta</SelectItem>
            <SelectItem value="25 - 50 juta">25 - 50 juta</SelectItem>
            <SelectItem value="> 50 juta">&gt; 50 juta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Target Deadline
        </label>
        <Input
          type="date"
          value={formData.deadline_date}
          onChange={(e) => onInputChange('deadline_date', e.target.value)}
        />
      </div>
    </div>
  );
};

export default ServiceSelectionSection;
