
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, Star, Users, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const ContentManager = () => {
  const queryClient = useQueryClient();
  const [editingContent, setEditingContent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: landingContent, isLoading } = useQuery({
    queryKey: ['landing-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_content')
        .select('*')
        .order('section_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: testimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: footerContent } = useQuery({
    queryKey: ['footer-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('footer_content')
        .select('*')
        .order('column_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ table, id, data }: { table: string; id?: string; data: any }) => {
      if (id) {
        const { error } = await supabase
          .from(table)
          .update(data)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: (_, { table }) => {
      queryClient.invalidateQueries({ queryKey: [table === 'landing_content' ? 'landing-content' : table === 'testimonials' ? 'testimonials' : 'footer-content'] });
      toast.success('Konten berhasil disimpan');
      setIsDialogOpen(false);
      setEditingContent(null);
    },
    onError: () => {
      toast.error('Gagal menyimpan konten');
    }
  });

  const deleteContentMutation = useMutation({
    mutationFn: async ({ table, id }: { table: string; id: string }) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { table }) => {
      queryClient.invalidateQueries({ queryKey: [table === 'landing_content' ? 'landing-content' : table === 'testimonials' ? 'testimonials' : 'footer-content'] });
      toast.success('Konten berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus konten');
    }
  });

  const handleSubmit = (e: React.FormEvent, table: string) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    let data: any = {};
    
    if (table === 'landing_content') {
      data = {
        section_name: formData.get('section_name'),
        title: formData.get('title'),
        subtitle: formData.get('subtitle'),
        content: formData.get('content'),
        is_enabled: formData.get('is_enabled') === 'on',
        section_order: parseInt(formData.get('section_order') as string) || 0
      };
    } else if (table === 'testimonials') {
      data = {
        customer_name: formData.get('customer_name'),
        customer_position: formData.get('customer_position'),
        company: formData.get('company'),
        testimonial: formData.get('testimonial'),
        rating: parseInt(formData.get('rating') as string) || 5,
        is_featured: formData.get('is_featured') === 'on'
      };
    } else if (table === 'footer_content') {
      data = {
        column_title: formData.get('column_title'),
        links: formData.get('links')?.toString().split('\n').filter(link => link.trim()),
        column_order: parseInt(formData.get('column_order') as string) || 0,
        is_enabled: formData.get('is_enabled') === 'on'
      };
    }

    updateContentMutation.mutate({
      table,
      id: editingContent?.id,
      data
    });
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
        <Globe className="h-6 w-6" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manajemen Konten</h2>
          <p className="text-muted-foreground">Kelola konten website dan landing page</p>
        </div>
      </div>

      <Tabs defaultValue="landing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="landing" className="gap-2">
            <Globe className="h-4 w-4" />
            Landing Page
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="gap-2">
            <Star className="h-4 w-4" />
            Testimonial
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-2">
            <Users className="h-4 w-4" />
            Footer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="landing">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Konten Landing Page</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => setEditingContent(null)}>
                  <Plus className="h-4 w-4" />
                  Tambah Konten
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingContent ? 'Edit Konten' : 'Tambah Konten Baru'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => handleSubmit(e, 'landing_content')} className="space-y-4">
                  <div>
                    <Label>Nama Seksi</Label>
                    <Input name="section_name" defaultValue={editingContent?.section_name} required />
                  </div>
                  <div>
                    <Label>Judul</Label>
                    <Input name="title" defaultValue={editingContent?.title} />
                  </div>
                  <div>
                    <Label>Subjudul</Label>
                    <Input name="subtitle" defaultValue={editingContent?.subtitle} />
                  </div>
                  <div>
                    <Label>Konten</Label>
                    <Textarea name="content" defaultValue={editingContent?.content} />
                  </div>
                  <div>
                    <Label>Urutan</Label>
                    <Input name="section_order" type="number" defaultValue={editingContent?.section_order || 0} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch name="is_enabled" defaultChecked={editingContent?.is_enabled ?? true} />
                    <Label>Aktifkan Seksi</Label>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingContent ? 'Update Konten' : 'Tambah Konten'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {landingContent?.map((content) => (
              <Card key={content.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{content.section_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={content.is_enabled ? "default" : "secondary"}>
                        {content.is_enabled ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingContent(content);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteContentMutation.mutate({ table: 'landing_content', id: content.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {content.title && <p><strong>Judul:</strong> {content.title}</p>}
                    {content.subtitle && <p><strong>Subjudul:</strong> {content.subtitle}</p>}
                    {content.content && <p><strong>Konten:</strong> {content.content.substring(0, 100)}...</p>}
                    <p><strong>Urutan:</strong> {content.section_order}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testimonials">
          {/* Similar structure for testimonials */}
          <div className="text-center py-8">
            <p className="text-muted-foreground">Manajemen testimonial akan ditambahkan di sini</p>
          </div>
        </TabsContent>

        <TabsContent value="footer">
          {/* Similar structure for footer content */}
          <div className="text-center py-8">
            <p className="text-muted-foreground">Manajemen footer akan ditambahkan di sini</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManager;
