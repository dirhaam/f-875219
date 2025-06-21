
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, FileText, Eye, Send, DollarSign, Download } from 'lucide-react';
import { toast } from 'sonner';
import { generateInvoicePDF } from '@/utils/invoicePdfGenerator';

const InvoicesManager = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDownpayment, setIsDownpayment] = useState(false);
  const [downpaymentPercentage, setDownpaymentPercentage] = useState(30);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          orders (
            customer_name,
            customer_email,
            services (name),
            downpayment_percentage,
            remaining_amount
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: orders } = useQuery({
    queryKey: ['orders-for-invoice'],
    queryFn: async () => {
      // Get all orders that are in_progress or completed
      const { data: availableOrders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_email,
          status,
          services (name, price),
          downpayment_percentage,
          downpayment_amount,
          remaining_amount,
          total_amount
        `)
        .in('status', ['in_progress', 'completed']);
      
      if (ordersError) throw ordersError;
      return availableOrders || [];
    }
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      // Generate invoice number
      const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');
      
      const { error } = await supabase
        .from('invoices')
        .insert([{
          ...invoiceData,
          invoice_number: invoiceNumber
        }]);
      
      if (error) throw error;

      // Update order remaining amount if this is a downpayment
      if (invoiceData.is_downpayment) {
        const selectedOrderData = orders?.find(order => order.id === selectedOrder);
        if (selectedOrderData) {
          const remaining = (selectedOrderData.total_amount || selectedOrderData.services?.price || 0) - invoiceData.subtotal;
          await supabase
            .from('orders')
            .update({ 
              downpayment_amount: invoiceData.subtotal,
              remaining_amount: remaining 
            })
            .eq('id', selectedOrder);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['orders-for-invoice'] });
      toast.success('Invoice berhasil dibuat');
      setIsDialogOpen(false);
      setSelectedOrder('');
      setIsDownpayment(false);
    },
    onError: () => {
      toast.error('Gagal membuat invoice');
    }
  });

  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async ({ invoiceId, status }: { invoiceId: string; status: string }) => {
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Status invoice berhasil diupdate');
    },
    onError: () => {
      toast.error('Gagal mengupdate status invoice');
    }
  });

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

    createInvoiceMutation.mutate(invoiceData);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const },
      sent: { label: 'Terkirim', variant: 'default' as const },
      paid: { label: 'Lunas', variant: 'secondary' as const },
      overdue: { label: 'Terlambat', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateDownpaymentAmount = () => {
    const selectedOrderData = orders?.find(order => order.id === selectedOrder);
    if (!selectedOrderData) return 0;
    
    const baseAmount = selectedOrderData.total_amount || selectedOrderData.services?.price || 0;
    return (baseAmount * downpaymentPercentage) / 100;
  };

  const handleDownloadPDF = async (invoice: any) => {
    try {
      const invoiceData = {
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        customer: {
          name: invoice.orders?.customer_name || '',
          email: invoice.orders?.customer_email || '',
        },
        company: {
          name: 'Digital Service Company',
          address: 'Jl. Digital No. 123, Jakarta',
          phone: '+62 21 1234567',
          email: 'info@digitalservice.com',
          website: 'www.digitalservice.com',
          tax_number: '12.345.678.9-012.345'
        },
        items: [{
          description: `${invoice.orders?.services?.name || 'Digital Service'}${invoice.is_downpayment ? ' (DP)' : ''}`,
          quantity: 1,
          price: invoice.subtotal,
          total: invoice.subtotal
        }],
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount || 0,
        total_amount: invoice.total_amount,
        notes: invoice.notes,
        payment_terms: invoice.payment_terms || '30 days'
      };

      await generateInvoicePDF(invoiceData);
      toast.success('PDF invoice berhasil diunduh');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Gagal mengunduh PDF invoice');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Manajemen Invoice</h2>
          <p className="text-muted-foreground">Kelola invoice dan pembayaran</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Buat Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Buat Invoice Baru</DialogTitle>
            </DialogHeader>
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
                  onCheckedChange={setIsDownpayment}
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
              <Button type="submit" className="w-full">
                Buat Invoice
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {invoices?.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {invoice.invoice_number}
                  {invoice.is_downpayment && (
                    <Badge variant="outline">DP {invoice.downpayment_percentage}%</Badge>
                  )}
                </CardTitle>
                {getStatusBadge(invoice.status)}
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Pelanggan: {invoice.orders?.customer_name}</div>
                <div>Layanan: {invoice.orders?.services?.name}</div>
                <div>Tanggal: {new Date(invoice.issue_date).toLocaleDateString('id-ID')}</div>
                <div>Jatuh Tempo: {new Date(invoice.due_date).toLocaleDateString('id-ID')}</div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>Rp {invoice.subtotal?.toLocaleString('id-ID')}</span>
                </div>
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>Pajak:</span>
                    <span>Rp {invoice.tax_amount?.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>Rp {invoice.total_amount?.toLocaleString('id-ID')}</span>
                </div>
                {invoice.is_downpayment && invoice.orders?.remaining_amount && (
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>Sisa:</span>
                    <span>Rp {invoice.orders.remaining_amount?.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              {invoice.notes && (
                <div>
                  <h4 className="font-medium mb-2">Catatan:</h4>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t">
                <Select
                  value={invoice.status}
                  onValueChange={(value) => 
                    updateInvoiceStatusMutation.mutate({ invoiceId: invoice.id, status: value })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Terkirim</SelectItem>
                    <SelectItem value="paid">Lunas</SelectItem>
                    <SelectItem value="overdue">Terlambat</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleDownloadPDF(invoice)}
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>

                <Button variant="outline" size="sm" className="gap-2">
                  <Send className="h-4 w-4" />
                  Kirim
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!invoices?.length && (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Belum ada invoice</h3>
                <p className="text-muted-foreground">Invoice akan muncul di sini setelah Anda membuatnya</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InvoicesManager;
