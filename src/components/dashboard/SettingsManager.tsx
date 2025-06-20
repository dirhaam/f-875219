
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Settings, Mail, FileText, Globe, Users } from 'lucide-react';
import { toast } from 'sonner';

const SettingsManager = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || {};
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      const { error } = await supabase
        .from('settings')
        .upsert([settingsData]);
      
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

  const handleEmailSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const emailSettings = {
      id: settings?.id || '1',
      smtp_host: formData.get('smtp_host'),
      smtp_port: parseInt(formData.get('smtp_port') as string),
      smtp_username: formData.get('smtp_username'),
      smtp_password: formData.get('smtp_password'),
      from_email: formData.get('from_email'),
      from_name: formData.get('from_name'),
      email_enabled: formData.get('email_enabled') === 'on'
    };

    updateSettingsMutation.mutate(emailSettings);
  };

  const handleCompanySettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const companySettings = {
      id: settings?.id || '1',
      company_name: formData.get('company_name'),
      company_address: formData.get('company_address'),
      company_phone: formData.get('company_phone'),
      company_email: formData.get('company_email'),
      company_website: formData.get('company_website'),
      tax_number: formData.get('tax_number')
    };

    updateSettingsMutation.mutate(companySettings);
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
          <p className="text-muted-foreground">Kelola pengaturan aplikasi dan konfigurasi</p>
        </div>
      </div>

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <FileText className="h-4 w-4" />
            Perusahaan
          </TabsTrigger>
          <TabsTrigger value="invoice" className="gap-2">
            <Globe className="h-4 w-4" />
            Invoice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Email SMTP</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSettingsSubmit} className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Switch 
                    name="email_enabled" 
                    defaultChecked={settings?.email_enabled ?? false} 
                  />
                  <Label>Aktifkan Email SMTP</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SMTP Host</Label>
                    <Input 
                      name="smtp_host" 
                      defaultValue={settings?.smtp_host}
                      placeholder="smtp.gmail.com" 
                    />
                  </div>
                  <div>
                    <Label>SMTP Port</Label>
                    <Input 
                      name="smtp_port" 
                      type="number" 
                      defaultValue={settings?.smtp_port || 587}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Username/Email</Label>
                  <Input 
                    name="smtp_username" 
                    defaultValue={settings?.smtp_username}
                    type="email" 
                  />
                </div>
                
                <div>
                  <Label>Password</Label>
                  <Input 
                    name="smtp_password" 
                    type="password" 
                    defaultValue={settings?.smtp_password}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From Email</Label>
                    <Input 
                      name="from_email" 
                      type="email" 
                      defaultValue={settings?.from_email}
                    />
                  </div>
                  <div>
                    <Label>From Name</Label>
                    <Input 
                      name="from_name" 
                      defaultValue={settings?.from_name}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Simpan Pengaturan Email
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
              <form onSubmit={handleCompanySettingsSubmit} className="space-y-4">
                <div>
                  <Label>Nama Perusahaan</Label>
                  <Input 
                    name="company_name" 
                    defaultValue={settings?.company_name}
                    required 
                  />
                </div>
                
                <div>
                  <Label>Alamat</Label>
                  <Textarea 
                    name="company_address" 
                    defaultValue={settings?.company_address}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Telepon</Label>
                    <Input 
                      name="company_phone" 
                      defaultValue={settings?.company_phone}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      name="company_email" 
                      type="email" 
                      defaultValue={settings?.company_email}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Website</Label>
                  <Input 
                    name="company_website" 
                    defaultValue={settings?.company_website}
                  />
                </div>
                
                <div>
                  <Label>NPWP/Tax Number</Label>
                  <Input 
                    name="tax_number" 
                    defaultValue={settings?.tax_number}
                  />
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
              <CardTitle>Pengaturan Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Template Invoice</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Konfigurasi tampilan dan format invoice PDF
                  </p>
                  <Button variant="outline" className="w-full">
                    Kelola Template Invoice
                  </Button>
                </div>
                
                <div>
                  <Label>Prefix Invoice</Label>
                  <Input defaultValue="INV-" placeholder="INV-" />
                </div>
                
                <div>
                  <Label>Nomor Urut Berikutnya</Label>
                  <Input type="number" defaultValue="1001" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManager;
