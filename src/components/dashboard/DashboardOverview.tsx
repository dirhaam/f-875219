
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Briefcase, FolderOpen, FileText, TrendingUp } from 'lucide-react';

const DashboardOverview = () => {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [ordersRes, servicesRes, portfolioRes, invoicesRes] = await Promise.all([
        supabase.from('orders').select('id, status, total_amount'),
        supabase.from('services').select('id, is_active'),
        supabase.from('portfolio').select('id, is_featured'),
        supabase.from('invoices').select('id, status, total_amount')
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const pendingOrders = ordersRes.data?.filter(order => order.status === 'pending').length || 0;
      const activeServices = servicesRes.data?.filter(service => service.is_active).length || 0;
      const featuredPortfolio = portfolioRes.data?.filter(item => item.is_featured).length || 0;

      return {
        totalOrders: ordersRes.data?.length || 0,
        pendingOrders,
        activeServices,
        totalPortfolio: portfolioRes.data?.length || 0,
        featuredPortfolio,
        totalInvoices: invoicesRes.data?.length || 0,
        totalRevenue
      };
    }
  });

  const statCards = [
    {
      title: 'Total Pesanan',
      value: stats?.totalOrders || 0,
      subtitle: `${stats?.pendingOrders || 0} menunggu`,
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Layanan Aktif',
      value: stats?.activeServices || 0,
      subtitle: 'Siap dipasarkan',
      icon: Briefcase,
      color: 'text-green-600'
    },
    {
      title: 'Portfolio',
      value: stats?.totalPortfolio || 0,
      subtitle: `${stats?.featuredPortfolio || 0} unggulan`,
      icon: FolderOpen,
      color: 'text-purple-600'
    },
    {
      title: 'Total Invoice',
      value: stats?.totalInvoices || 0,
      subtitle: 'Dokumen keuangan',
      icon: FileText,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Ringkasan aktivitas layanan digital Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              Rp {(stats?.totalRevenue || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Dari semua pesanan yang masuk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Sistem berjalan normal</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm text-muted-foreground">Database tersinkronisasi</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-sm text-muted-foreground">Email service aktif</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
