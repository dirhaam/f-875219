
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Mail, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const OrdersManager = () => {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          services (name, price)
        `)
        .order('order_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status pesanan berhasil diupdate');
    },
    onError: () => {
      toast.error('Gagal mengupdate status pesanan');
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const, icon: Clock },
      in_progress: { label: 'Dikerjakan', variant: 'default' as const, icon: CheckCircle },
      completed: { label: 'Selesai', variant: 'secondary' as const, icon: CheckCircle },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
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
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Manajemen Pesanan</h2>
        <p className="text-muted-foreground">Kelola semua pesanan dari pelanggan</p>
      </div>

      <div className="grid gap-4">
        {orders?.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{order.customer_name}</CardTitle>
                {getStatusBadge(order.status)}
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Email: {order.customer_email}</div>
                {order.customer_phone && <div>Telepon: {order.customer_phone}</div>}
                <div>Tanggal: {new Date(order.order_date).toLocaleDateString('id-ID')}</div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Layanan yang Dipesan:</h4>
                <div className="bg-muted p-3 rounded-md">
                  <div className="font-medium">{order.services?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Harga: Rp {order.services?.price?.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {order.custom_requirements && (
                <div>
                  <h4 className="font-medium mb-2">Kebutuhan Khusus:</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {order.custom_requirements}
                  </p>
                </div>
              )}

              {order.budget_range && (
                <div>
                  <span className="font-medium">Budget Range: </span>
                  <span className="text-muted-foreground">{order.budget_range}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t">
                <Select
                  value={order.status}
                  onValueChange={(value) => 
                    updateStatusMutation.mutate({ orderId: order.id, status: value })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="in_progress">Dikerjakan</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Button>

                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!orders?.length && (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Belum ada pesanan</h3>
                <p className="text-muted-foreground">Pesanan akan muncul di sini setelah pelanggan melakukan pemesanan</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrdersManager;
