
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
  const [activeContentType, setActiveContentType] = useState('landing_content');

  const { data: landingContent, isLoading } = useQuery({
    queryKey: ['landing-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_content' as any)
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
        .from('testimonials' as any)
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
        .from('footer_content' as any)
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
          .from(table as any)
          .update(data)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table as any)
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: (_, { table }) => {
      const queryKey = table === 'landing_content' ? 'landing-content' : 
                      table === 'testimonials' ? 'testimonials' : 'footer-content';
      queryClient.invalidateQueries({ queryKey: [queryKey] });
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
        .from(table as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { table }) => {
      const queryKey = table === 'landing_content' ? 'landing-content' : 
                      table === 'testimonials' ? 'testimonials' : 'footer-content';
      queryClient.invalidateQueries({ queryKey: [queryKey] });
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

  const openDialog = (contentType: string, content: any = null) => {
    setActiveContentType(contentType);
    setEditingContent(content);
    setIsDialogOpen(true);
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
            <Button className="gap-2" onClick={() => openDialog('landing_content')}>
              <Plus className="h-4 w-4" />
              Tambah Konten
            </Button>
          </div>

          <div className="grid gap-4">
            {landingContent?.map((content: any) => (
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
                        onClick={() => openDialog('landing_content', content)}
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Manajemen Testimonial</h3>
            <Button className="gap-2" onClick={() => openDialog('testimonials')}>
              <Plus className="h-4 w-4" />
              Tambah Testimonial
            </Button>
          </div>

          <div className="grid gap-4">
            {testimonials?.map((testimonial: any) => (
              <Card key={testimonial.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{testimonial.customer_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={testimonial.is_featured ? "default" : "secondary"}>
                        {testimonial.is_featured ? 'Featured' : 'Normal'}
                      </Badge>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog('testimonials', testimonial)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteContentMutation.mutate({ table: 'testimonials', id: testimonial.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Posisi:</strong> {testimonial.customer_position}</p>
                    <p><strong>Perusahaan:</strong> {testimonial.company}</p>
                    <p><strong>Testimonial:</strong> {testimonial.testimonial.substring(0, 150)}...</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="footer">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Manajemen Footer</h3>
            <Button className="gap-2" onClick={() => openDialog('footer_content')}>
              <Plus className="h-4 w-4" />
              Tambah Kolom Footer
            </Button>
          </div>

          <div className="grid gap-4">
            {footerContent?.map((footer: any) => (
              <Card key={footer.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{footer.column_title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={footer.is_enabled ? "default" : "secondary"}>
                        {footer.is_enabled ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog('footer_content', footer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteContentMutation.mutate({ table: 'footer_content', id: footer.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Urutan:</strong> {footer.column_order}</p>
                    <p><strong>Links:</strong> {footer.links?.join(', ')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Edit' : 'Tambah'} {
                activeContentType === 'landing_content' ? 'Konten Landing' :
                activeContentType === 'testimonials' ? 'Testimonial' : 'Footer'
              }
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, activeContentType)} className="space-y-4">
            {activeContentType === 'landing_content' && (
              <>
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
              </>
            )}

            {activeContentType === 'testimonials' && (
              <>
                <div>
                  <Label>Nama Customer</Label>
                  <Input name="customer_name" defaultValue={editingContent?.customer_name} required />
                </div>
                <div>
                  <Label>Posisi</Label>
                  <Input name="customer_position" defaultValue={editingContent?.customer_position} />
                </div>
                <div>
                  <Label>Perusahaan</Label>
                  <Input name="company" defaultValue={editingContent?.company} />
                </div>
                <div>
                  <Label>Testimonial</Label>
                  <Textarea name="testimonial" defaultValue={editingContent?.testimonial} required />
                </div>
                <div>
                  <Label>Rating (1-5)</Label>
                  <Input name="rating" type="number" min="1" max="5" defaultValue={editingContent?.rating || 5} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch name="is_featured" defaultChecked={editingContent?.is_featured ?? false} />
                  <Label>Featured</Label>
                </div>
              </>
            )}

            {activeContentType === 'footer_content' && (
              <>
                <div>
                  <Label>Judul Kolom</Label>
                  <Input name="column_title" defaultValue={editingContent?.column_title} required />
                </div>
                <div>
                  <Label>Links (satu per baris)</Label>
                  <Textarea 
                    name="links" 
                    defaultValue={editingContent?.links?.join('\n')} 
                    placeholder="Link 1&#10;Link 2&#10;Link 3"
                  />
                </div>
                <div>
                  <Label>Urutan</Label>
                  <Input name="column_order" type="number" defaultValue={editingContent?.column_order || 0} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch name="is_enabled" defaultChecked={editingContent?.is_enabled ?? true} />
                  <Label>Aktifkan Kolom</Label>
                </div>
              </>
            )}

            <Button type="submit" className="w-full">
              {editingContent ? 'Update' : 'Tambah'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManager;
