import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { generateInvoicePDF } from '@/utils/invoicePdfGenerator';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import InvoiceCard from '@/components/invoice/InvoiceCard';

const InvoicesManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

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
      const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');
      
      const { error } = await supabase
        .from('invoices')
        .insert([{
          ...invoiceData,
          invoice_number: invoiceNumber
        }]);
      
      if (error) throw error;

      if (invoiceData.is_downpayment) {
        const selectedOrderData = orders?.find(order => order.id === invoiceData.order_id);
        if (selectedOrderData) {
          const remaining = (selectedOrderData.total_amount || selectedOrderData.services?.price || 0) - invoiceData.subtotal;
          await supabase
            .from('orders')
            .update({ 
              downpayment_amount: invoiceData.subtotal,
              remaining_amount: remaining 
            })
            .eq('id', invoiceData.order_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['orders-for-invoice'] });
      toast.success('Invoice berhasil dibuat');
      setIsDialogOpen(false);
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

  const handleInvoiceAdjustment = async (adjustment: any) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          subtotal: adjustment.newSubtotal,
          total_amount: adjustment.newTotal,
          notes: `${adjustment.description}${adjustment.reason ? ` - ${adjustment.reason}` : ''}`
        })
        .eq('id', adjustment.invoiceId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice adjustment applied successfully');
    } catch (error) {
      console.error('Adjustment error:', error);
      toast.error('Failed to apply adjustment');
    }
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

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.orders?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'downpayment' && invoice.is_downpayment) ||
                       (typeFilter === 'full' && !invoice.is_downpayment);
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
            <InvoiceForm 
              orders={orders}
              onSubmit={createInvoiceMutation.mutate}
              isLoading={createInvoiceMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full">Full Payment</SelectItem>
            <SelectItem value="downpayment">Downpayment</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          {filteredInvoices?.length || 0} of {invoices?.length || 0} invoices
        </div>
      </div>

      <div className="grid gap-4">
        {filteredInvoices?.map((invoice) => (
          <InvoiceCard 
            key={invoice.id}
            invoice={invoice}
            onStatusUpdate={(invoiceId, status) => 
              updateInvoiceStatusMutation.mutate({ invoiceId, status })
            }
            onDownloadPDF={handleDownloadPDF}
            onAdjustment={handleInvoiceAdjustment}
          />
        ))}

        {!filteredInvoices?.length && (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'No matching invoices found' 
                    : 'Belum ada invoice'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Invoice akan muncul di sini setelah Anda membuatnya'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InvoicesManager;