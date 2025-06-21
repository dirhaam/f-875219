
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Send, Download } from 'lucide-react';

interface InvoiceData {
  id: string;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  is_downpayment: boolean;
  downpayment_percentage?: number;
  orders?: {
    customer_name: string;
    customer_email: string;
    services?: {
      name: string;
    };
    remaining_amount?: number;
  };
}

interface InvoiceCardProps {
  invoice: InvoiceData;
  onStatusUpdate: (invoiceId: string, status: string) => void;
  onDownloadPDF: (invoice: InvoiceData) => void;
}

const InvoiceCard = ({ invoice, onStatusUpdate, onDownloadPDF }: InvoiceCardProps) => {
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

  return (
    <Card>
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
            onValueChange={(value) => onStatusUpdate(invoice.id, value)}
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
            onClick={() => onDownloadPDF(invoice)}
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
  );
};

export default InvoiceCard;
