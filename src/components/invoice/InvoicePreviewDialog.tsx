import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface InvoicePreviewDialogProps {
  invoice: any;
}

const InvoicePreviewDialog = ({ invoice }: InvoicePreviewDialogProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview Invoice - {invoice.invoice_number}</DialogTitle>
        </DialogHeader>
        
        <div className="invoice-preview bg-white text-black p-8 rounded-lg border">
          {/* Header */}
          <div className="bg-slate-800 text-white p-6 rounded-t-lg -m-8 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
                <p className="text-lg">{invoice.invoice_number}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold">Digital Service Company</h2>
              </div>
            </div>
          </div>

          {/* Company and Customer Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-gray-600 font-semibold mb-3">DARI:</h3>
              <div className="space-y-1 text-sm">
                <p>Jl. Digital No. 123, Jakarta</p>
                <p>+62 21 1234567</p>
                <p>info@digitalservice.com</p>
                <p>www.digitalservice.com</p>
              </div>
            </div>
            <div>
              <h3 className="text-gray-600 font-semibold mb-3">UNTUK:</h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{invoice.orders?.customer_name}</p>
                <p>{invoice.orders?.customer_email}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-sm">Tanggal Terbit:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                <span className="text-sm">{formatDate(invoice.issue_date)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-sm">Jatuh Tempo:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                <span className="text-sm">{formatDate(invoice.due_date)}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Deskripsi</th>
                  <th className="border border-gray-300 p-3 text-center text-sm font-semibold w-16">Qty</th>
                  <th className="border border-gray-300 p-3 text-right text-sm font-semibold w-24">Harga</th>
                  <th className="border border-gray-300 p-3 text-right text-sm font-semibold w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3 text-sm">
                    {invoice.orders?.services?.name || 'Digital Service'}
                    {invoice.is_downpayment && ' (DP)'}
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-sm">1</td>
                  <td className="border border-gray-300 p-3 text-right text-sm">
                    {formatCurrency(invoice.subtotal)}
                  </td>
                  <td className="border border-gray-300 p-3 text-right text-sm">
                    {formatCurrency(invoice.subtotal)}
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div className="mt-4">
              <button className="text-blue-600 text-sm hover:underline">+ Tambah Item</button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-3">Catatan:</h4>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded min-h-[100px]">
                <p className="text-sm text-gray-600">
                  {invoice.notes || 'Terima kasih atas kepercayaan Anda.'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pajak ( 11 %):</span>
                <span>{formatCurrency(invoice.tax_amount || 0)}</span>
              </div>
              <hr className="border-gray-400" />
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Syarat Pembayaran: {invoice.payment_terms || '30 days'}</span>
              <span>NPWP: 12.345.678.9-012.345</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewDialog;