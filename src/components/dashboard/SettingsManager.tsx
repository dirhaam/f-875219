import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Settings, Mail, Building, FileText } from 'lucide-react';
import { toast } from 'sonner';
import EmailTestDialog from './EmailTestDialog';

const SettingsManager = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings' as any)
        .select('*');
      
      if (error) throw error;
      
      // Convert array to object for easier access
      const settingsObj: any = {};
      data?.forEach((setting: any) => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      
      return settingsObj;
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('settings' as any)
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq('setting_key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Pengaturan berhasil disimpan');
    },
    onError: () => {
      toast.error('Gagal menyimpan pengaturan');
    }
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const emailConfig = {
      smtp_host: formData.get('smtp_host'),
      smtp_port: formData.get('smtp_port'),
      smtp_user: formData.get('smtp_user'),
      smtp_password: formData.get('smtp_password'),
      from_email: formData.get('from_email'),
      from_name: formData.get('from_name')
    };

    updateSettingMutation.mutate({ key: 'email_config', value: emailConfig });
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const companyInfo = {
      name: formData.get('company_name'),
      address: formData.get('company_address'),
      phone: formData.get('company_phone'),
      email: formData.get('company_email'),
      website: formData.get('company_website'),
      tax_number: formData.get('tax_number')
    };

    updateSettingMutation.mutate({ key: 'company_info', value: companyInfo });
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const invoiceConfig = {
      prefix: formData.get('invoice_prefix'),
      tax_rate: parseFloat(formData.get('tax_rate') as string) || 0,
      payment_terms: formData.get('payment_terms'),
      notes: formData.get('invoice_notes')
    };

    updateSettingMutation.mutate({ key: 'invoice_config', value: invoiceConfig });
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
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pengaturan Sistem</h2>
          <p className="text-muted-foreground">Kelola konfigurasi email, perusahaan, dan invoice</p>
        </div>
      </div>

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building className="h-4 w-4" />
            Perusahaan
          </TabsTrigger>
          <TabsTrigger value="invoice" className="gap-2">
            <FileText className="h-4 w-4" />
            Invoice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Konfigurasi Email SMTP</CardTitle>
                <EmailTestDialog emailConfig={settings?.email_config || {}} />
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SMTP Host</Label>
                    <Input 
                      name="smtp_host" 
                      defaultValue={settings?.email_config?.smtp_host || ''} 
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label>SMTP Port</Label>
                    <Input 
                      name="smtp_port" 
                      type="number"
                      defaultValue={settings?.email_config?.smtp_port || ''} 
                      placeholder="587"
                    />
                  </div>
                </div>
                <div>
                  <Label>SMTP Username</Label>
                  <Input 
                    name="smtp_user" 
                    defaultValue={settings?.email_config?.smtp_user || ''} 
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <Label>SMTP Password</Label>
                  <Input 
                    name="smtp_password" 
                    type="password"
                    defaultValue={settings?.email_config?.smtp_password || ''} 
                    placeholder="your-app-password"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From Email</Label>
                    <Input 
                      name="from_email" 
                      type="email"
                      defaultValue={settings?.email_config?.from_email || ''} 
                      placeholder="noreply@company.com"
                    />
                  </div>
                  <div>
                    <Label>From Name</Label>
                    <Input 
                      name="from_name" 
                      defaultValue={settings?.email_config?.from_name || ''} 
                      placeholder="Company Name"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Simpan Konfigurasi Email
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Perusahaan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div>
                  <Label>Nama Perusahaan</Label>
                  <Input 
                    name="company_name" 
                    defaultValue={settings?.company_info?.name || ''} 
                    placeholder="PT. Digital Service Indonesia"
                    required
                  />
                </div>
                <div>
                  <Label>Alamat</Label>
                  <Textarea 
                    name="company_address" 
                    defaultValue={settings?.company_info?.address || ''} 
                    placeholder="Jl. Sudirman No. 123, Jakarta"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Telepon</Label>
                    <Input 
                      name="company_phone" 
                      defaultValue={settings?.company_info?.phone || ''} 
                      placeholder="+62 21 1234 5678"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      name="company_email" 
                      type="email"
                      defaultValue={settings?.company_info?.email || ''} 
                      placeholder="info@company.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Website</Label>
                    <Input 
                      name="company_website" 
                      defaultValue={settings?.company_info?.website || ''} 
                      placeholder="https://company.com"
                    />
                  </div>
                  <div>
                    <Label>NPWP</Label>
                    <Input 
                      name="tax_number" 
                      defaultValue={settings?.company_info?.tax_number || ''} 
                      placeholder="12.345.678.9-012.000"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Simpan Informasi Perusahaan
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvoiceSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prefix Invoice</Label>
                    <Input 
                      name="invoice_prefix" 
                      defaultValue={settings?.invoice_config?.prefix || 'INV'} 
                      placeholder="INV"
                    />
                  </div>
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input 
                      name="tax_rate" 
                      type="number"
                      step="0.01"
                      defaultValue={settings?.invoice_config?.tax_rate || 0} 
                      placeholder="11"
                    />
                  </div>
                </div>
                <div>
                  <Label>Payment Terms</Label>
                  <Input 
                    name="payment_terms" 
                    defaultValue={settings?.invoice_config?.payment_terms || '30 days'} 
                    placeholder="30 days"
                  />
                </div>
                <div>
                  <Label>Default Notes</Label>
                  <Textarea 
                    name="invoice_notes" 
                    defaultValue={settings?.invoice_config?.notes || ''} 
                    placeholder="Terima kasih atas kepercayaan Anda"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Simpan Konfigurasi Invoice
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManager;