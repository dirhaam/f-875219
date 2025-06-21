
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Order {
  id: string;
  customer_name: string;
  status: string;
  services?: {
    name: string;
    price: number;
  };
  total_amount?: number;
}

interface InvoiceFormProps {
  orders: Order[] | undefined;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const InvoiceForm = ({ orders, onSubmit, isLoading }: InvoiceFormProps) => {
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [isDownpayment, setIsDownpayment] = useState(false);
  const [downpaymentPercentage, setDownpaymentPercentage] = useState(30);

  const calculateDownpaymentAmount = () => {
    const selectedOrderData = orders?.find(order => order.id === selectedOrder);
    if (!selectedOrderData) return 0;
    
    const baseAmount = selectedOrderData.total_amount || selectedOrderData.services?.price || 0;
    return (baseAmount * downpaymentPercentage) / 100;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const selectedOrderData = orders?.find(order => order.id === selectedOrder);
    if (!selectedOrderData) return;

    const subtotal = parseFloat(formData.get('subtotal') as string);
    const taxAmount = parseFloat(formData.get('tax_amount') as string) || 0;
    
    const invoiceData = {
      order_id: selectedOrder,
      due_date: formData.get('due_date'),
      subtotal: subtotal,
      tax_amount: taxAmount,
      total_amount: subtotal + taxAmount,
      payment_terms: formData.get('payment_terms'),
      notes: formData.get('notes'),
      is_downpayment: isDownpayment,
      invoice_type: isDownpayment ? 'downpayment' : 'full',
      downpayment_percentage: isDownpayment ? downpaymentPercentage : 0
    };

    onSubmit(invoiceData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Pilih Pesanan</label>
        <Select value={selectedOrder} onValueChange={setSelectedOrder} required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih pesanan" />
          </SelectTrigger>
          <SelectContent>
            {orders?.map((order) => (
              <SelectItem key={order.id} value={order.id}>
                {order.customer_name} - {order.services?.name} ({order.status})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="downpayment" 
          checked={isDownpayment}
          onCheckedChange={(checked) => setIsDownpayment(checked === true)}
        />
        <label htmlFor="downpayment" className="text-sm font-medium">
          Invoice Downpayment (DP)
        </label>
      </div>

      {isDownpayment && (
        <div>
          <label className="text-sm font-medium">Persentase DP (%)</label>
          <Input 
            type="number" 
            min="1" 
            max="100"
            value={downpaymentPercentage}
            onChange={(e) => setDownpaymentPercentage(parseInt(e.target.value) || 0)}
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Subtotal (Rp)</label>
        <Input 
          name="subtotal" 
          type="number" 
          value={isDownpayment ? calculateDownpaymentAmount() : orders?.find(o => o.id === selectedOrder)?.services?.price || 0}
          required 
          readOnly={isDownpayment}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Pajak (Rp)</label>
        <Input name="tax_amount" type="number" defaultValue={0} />
      </div>
      <div>
        <label className="text-sm font-medium">Jatuh Tempo</label>
        <Input name="due_date" type="date" required />
      </div>
      <div>
        <label className="text-sm font-medium">Syarat Pembayaran</label>
        <Input name="payment_terms" defaultValue="30 days" />
      </div>
      <div>
        <label className="text-sm font-medium">Catatan</label>
        <Textarea name="notes" placeholder="Catatan tambahan untuk invoice..." />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        Buat Invoice
      </Button>
    </form>
  );
};

export default InvoiceForm;
