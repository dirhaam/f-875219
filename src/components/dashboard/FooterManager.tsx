
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const FooterManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);

  const { data: footerLinks, isLoading } = useQuery({
    queryKey: ['footer-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('footer_content')
        .select('*')
        .order('parent_column', { ascending: true })
        .order('column_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const createLinkMutation = useMutation({
    mutationFn: async (linkData: any) => {
      const { error } = await supabase
        .from('footer_content')
        .insert([linkData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-links'] });
      toast.success('Link footer berhasil ditambahkan');
      setIsDialogOpen(false);
      setEditingLink(null);
    },
    onError: () => {
      toast.error('Gagal menambahkan link footer');
    }
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, ...linkData }: any) => {
      const { error } = await supabase
        .from('footer_content')
        .update(linkData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-links'] });
      toast.success('Link footer berhasil diupdate');
      setIsDialogOpen(false);
      setEditingLink(null);
    },
    onError: () => {
      toast.error('Gagal mengupdate link footer');
    }
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('footer_content')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-links'] });
      toast.success('Link footer berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus link footer');
    }
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase
        .from('footer_content')
        .update({ is_enabled })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-links'] });
      toast.success('Visibilitas link berhasil diupdate');
    },
    onError: () => {
      toast.error('Gagal mengupdate visibilitas link');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const linkData = {
      parent_column: formData.get('parent_column'),
      column_title: formData.get('parent_column'), // Use same as parent for consistency
      link_text: formData.get('link_text'),
      link_url: formData.get('link_url'),
      column_order: parseInt(formData.get('column_order') as string) || 1,
      is_enabled: true
    };

    if (editingLink) {
      updateLinkMutation.mutate({ id: editingLink.id, ...linkData });
    } else {
      createLinkMutation.mutate(linkData);
    }
  };

  const groupedLinks = footerLinks?.reduce((acc, link) => {
    const group = link.parent_column || 'Lainnya';
    if (!acc[group]) acc[group] = [];
    acc[group].push(link);
    return acc;
  }, {} as Record<string, any[]>);

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
          <h2 className="text-2xl font-bold text-foreground mb-2">Manajemen Footer</h2>
          <p className="text-muted-foreground">Kelola link dan konten footer website</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLink ? 'Edit Link Footer' : 'Tambah Link Footer'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Kategori</label>
                <Input 
                  name="parent_column" 
                  placeholder="Contoh: Layanan, Perusahaan, Dukungan"
                  defaultValue={editingLink?.parent_column || ''}
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Teks Link</label>
                <Input 
                  name="link_text" 
                  placeholder="Contoh: Tentang Kami"
                  defaultValue={editingLink?.link_text || ''}
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium">URL</label>
                <Input 
                  name="link_url" 
                  placeholder="Contoh: /about atau https://example.com"
                  defaultValue={editingLink?.link_url || ''}
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Urutan</label>
                <Input 
                  name="column_order" 
                  type="number" 
                  min="1"
                  defaultValue={editingLink?.column_order || 1}
                  required 
                />
              </div>
              <Button type="submit" className="w-full">
                {editingLink ? 'Update Link' : 'Tambah Link'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedLinks || {}).map(([category, links]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {links.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{link.link_text}</span>
                        {!link.is_enabled && (
                          <Badge variant="secondary">Tersembunyi</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{link.link_url}</p>
                      <p className="text-xs text-muted-foreground">Urutan: {link.column_order}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => 
                          toggleVisibilityMutation.mutate({ 
                            id: link.id, 
                            is_enabled: !link.is_enabled 
                          })
                        }
                      >
                        {link.is_enabled ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingLink(link);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Yakin ingin menghapus link ini?')) {
                            deleteLinkMutation.mutate(link.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {links.length === 0 && (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    Belum ada link di kategori ini
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FooterManager;
