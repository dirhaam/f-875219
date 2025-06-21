
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, CheckCircle } from 'lucide-react';
import CustomerInfoSection from './order/CustomerInfoSection';
import ServiceSelectionSection from './order/ServiceSelectionSection';
import DownpaymentSection from './order/DownpaymentSection';

interface OrderFormProps {
  onClose?: () => void;
  preselectedServiceId?: string;
}

const OrderForm = ({ onClose, preselectedServiceId }: OrderFormProps) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_id: preselectedServiceId || '',
    custom_requirements: '',
    budget_range: '',
    deadline_date: '',
    downpayment_percentage: 0,
    total_amount: 0
  });

  const [useDownpayment, setUseDownpayment] = useState(false);

  const { data: services } = useQuery({
    queryKey: ['services-for-order'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: typeof formData) => {
      const selectedService = services?.find(s => s.id === orderData.service_id);
      const totalAmount = orderData.total_amount || selectedService?.price || 0;
      
      const finalOrderData = {
        ...orderData,
        total_amount: totalAmount,
        downpayment_percentage: useDownpayment ? orderData.downpayment_percentage : 0,
        downpayment_amount: useDownpayment ? (totalAmount * orderData.downpayment_percentage) / 100 : 0,
        remaining_amount: useDownpayment ? totalAmount - (totalAmount * orderData.downpayment_percentage) / 100 : 0
      };

      const { error } = await supabase
        .from('orders')
        .insert([finalOrderData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Pesanan berhasil dikirim! Kami akan menghubungi Anda segera.');
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        service_id: preselectedServiceId || '',
        custom_requirements: '',
        budget_range: '',
        deadline_date: '',
        downpayment_percentage: 0,
        total_amount: 0
      });
      setUseDownpayment(false);
      if (onClose) onClose();
    },
    onError: () => {
      toast.error('Gagal mengirim pesanan. Silakan coba lagi.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_email || !formData.service_id) {
      toast.error('Harap lengkapi data yang wajib diisi');
      return;
    }

    createOrderMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedService = services?.find(service => service.id === formData.service_id);
  const basePrice = formData.total_amount || selectedService?.price || 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Form Pemesanan Layanan
        </CardTitle>
        <p className="text-muted-foreground">
          Isi form di bawah untuk memesan layanan digital kami
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <CustomerInfoSection 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <ServiceSelectionSection 
            services={services}
            formData={formData}
            onInputChange={handleInputChange}
          />

          <DownpaymentSection 
            useDownpayment={useDownpayment}
            setUseDownpayment={setUseDownpayment}
            downpaymentPercentage={formData.downpayment_percentage}
            onPercentageChange={(value) => handleInputChange('downpayment_percentage', value)}
            basePrice={basePrice}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Kebutuhan Khusus & Detail Proyek
            </label>
            <Textarea
              placeholder="Jelaskan detail kebutuhan, fitur khusus, atau spesifikasi yang diinginkan..."
              className="min-h-24"
              value={formData.custom_requirements}
              onChange={(e) => handleInputChange('custom_requirements', e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                'Mengirim...'
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Kirim Pesanan
                </>
              )}
            </Button>
            
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
