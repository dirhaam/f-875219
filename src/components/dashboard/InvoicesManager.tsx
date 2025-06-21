
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { generateInvoicePDF } from '@/utils/invoicePdfGenerator';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import InvoiceCard from '@/components/invoice/InvoiceCard';

const InvoicesManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            <InvoiceForm 
              orders={orders}
              onSubmit={createInvoiceMutation.mutate}
              isLoading={createInvoiceMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {invoices?.map((invoice) => (
          <InvoiceCard 
            key={invoice.id}
            invoice={invoice}
            onStatusUpdate={(invoiceId, status) => 
              updateInvoiceStatusMutation.mutate({ invoiceId, status })
            }
            onDownloadPDF={handleDownloadPDF}
          />
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
