
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const ServicesManager = () => {
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const { error } = await supabase
        .from('services')
        .insert([serviceData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Layanan berhasil ditambahkan');
      setIsDialogOpen(false);
      setEditingService(null);
    },
    onError: () => {
      toast.error('Gagal menambahkan layanan');
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, ...serviceData }: any) => {
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Layanan berhasil diupdate');
      setIsDialogOpen(false);
      setEditingService(null);
    },
    onError: () => {
      toast.error('Gagal mengupdate layanan');
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Layanan berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus layanan');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const serviceData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category'),
      is_active: formData.get('is_active') === 'on'
    };

    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, ...serviceData });
    } else {
      createServiceMutation.mutate(serviceData);
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Manajemen Layanan</h2>
          <p className="text-muted-foreground">Kelola layanan digital yang ditawarkan</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Layanan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nama Layanan</label>
                <Input name="name" defaultValue={editingService?.name} required />
              </div>
              <div>
                <label className="text-sm font-medium">Deskripsi</label>
                <Textarea name="description" defaultValue={editingService?.description} />
              </div>
              <div>
                <label className="text-sm font-medium">Harga (Rp)</label>
                <Input name="price" type="number" defaultValue={editingService?.price} required />
              </div>
              <div>
                <label className="text-sm font-medium">Kategori</label>
                <Input name="category" defaultValue={editingService?.category} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch name="is_active" defaultChecked={editingService?.is_active ?? true} />
                <label className="text-sm font-medium">Layanan Aktif</label>
              </div>
              <Button type="submit" className="w-full">
                {editingService ? 'Update Layanan' : 'Tambah Layanan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services?.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={service.is_active ? "default" : "secondary"}>
                    {service.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingService(service);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteServiceMutation.mutate(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">{service.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-medium">Rp {service.price?.toLocaleString('id-ID')}</span>
                </div>
                {service.category && (
                  <Badge variant="outline">{service.category}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicesManager;
