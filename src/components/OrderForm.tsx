
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Send, CheckCircle } from 'lucide-react';

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
  const downpaymentAmount = useDownpayment ? (basePrice * formData.downpayment_percentage) / 100 : 0;

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nama Lengkap *
              </label>
              <Input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
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
                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nomor Telepon
            </label>
            <Input
              type="tel"
              placeholder="08123456789"
              value={formData.customer_phone}
              onChange={(e) => handleInputChange('customer_phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Pilih Layanan *
            </label>
            <Select 
              value={formData.service_id} 
              onValueChange={(value) => handleInputChange('service_id', value)}
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
              onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Isi jika harga berbeda dari paket standar, atau kosongkan untuk menggunakan harga paket
            </p>
          </div>

          <div className="space-y-4 border p-4 rounded-md">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="use-downpayment" 
                checked={useDownpayment}
                onCheckedChange={setUseDownpayment}
              />
              <label htmlFor="use-downpayment" className="text-sm font-medium">
                Saya ingin sistem pembayaran bertahap (DP)
              </label>
            </div>

            {useDownpayment && (
              <div className="space-y-3 pl-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Persentase DP (%)
                  </label>
                  <Select 
                    value={formData.downpayment_percentage.toString()} 
                    onValueChange={(value) => handleInputChange('downpayment_percentage', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih persentase DP" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="30">30%</SelectItem>
                      <SelectItem value="40">40%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.downpayment_percentage > 0 && basePrice > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Total Proyek:</span>
                      <span className="font-medium">Rp {basePrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>DP ({formData.downpayment_percentage}%):</span>
                      <span className="font-medium text-blue-600">Rp {downpaymentAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Sisa Pembayaran:</span>
                      <span className="font-medium">Rp {(basePrice - downpaymentAmount).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Budget Range
            </label>
            <Select 
              value={formData.budget_range} 
              onValueChange={(value) => handleInputChange('budget_range', value)}
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
              onChange={(e) => handleInputChange('deadline_date', e.target.value)}
            />
          </div>

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
