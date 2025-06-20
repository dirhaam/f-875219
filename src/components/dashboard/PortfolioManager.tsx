
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
import { Plus, Edit, Trash2, Star, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const PortfolioManager = () => {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createPortfolioMutation = useMutation({
    mutationFn: async (portfolioData: any) => {
      const { error } = await supabase
        .from('portfolio')
        .insert([portfolioData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Portfolio berhasil ditambahkan');
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: () => {
      toast.error('Gagal menambahkan portfolio');
    }
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: async ({ id, ...portfolioData }: any) => {
      const { error } = await supabase
        .from('portfolio')
        .update(portfolioData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Portfolio berhasil diupdate');
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: () => {
      toast.error('Gagal mengupdate portfolio');
    }
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: async (portfolioId: string) => {
      const { error } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', portfolioId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Portfolio berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus portfolio');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const portfolioData = {
      title: formData.get('title'),
      description: formData.get('description'),
      project_url: formData.get('project_url'),
      image_url: formData.get('image_url'),
      category: formData.get('category'),
      technologies: formData.get('technologies')?.toString().split(',').map(t => t.trim()) || [],
      is_featured: formData.get('is_featured') === 'on'
    };

    if (editingItem) {
      updatePortfolioMutation.mutate({ id: editingItem.id, ...portfolioData });
    } else {
      createPortfolioMutation.mutate(portfolioData);
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Manajemen Portfolio</h2>
          <p className="text-muted-foreground">Kelola portfolio proyek yang telah dikerjakan</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Portfolio' : 'Tambah Portfolio Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Judul Proyek</label>
                <Input name="title" defaultValue={editingItem?.title} required />
              </div>
              <div>
                <label className="text-sm font-medium">Deskripsi</label>
                <Textarea name="description" defaultValue={editingItem?.description} />
              </div>
              <div>
                <label className="text-sm font-medium">URL Proyek</label>
                <Input name="project_url" type="url" defaultValue={editingItem?.project_url} />
              </div>
              <div>
                <label className="text-sm font-medium">URL Gambar</label>
                <Input name="image_url" type="url" defaultValue={editingItem?.image_url} />
              </div>
              <div>
                <label className="text-sm font-medium">Kategori</label>
                <Input name="category" defaultValue={editingItem?.category} />
              </div>
              <div>
                <label className="text-sm font-medium">Teknologi (pisahkan dengan koma)</label>
                <Input name="technologies" defaultValue={editingItem?.technologies?.join(', ')} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch name="is_featured" defaultChecked={editingItem?.is_featured ?? false} />
                <label className="text-sm font-medium">Portfolio Unggulan</label>
              </div>
              <Button type="submit" className="w-full">
                {editingItem ? 'Update Portfolio' : 'Tambah Portfolio'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {portfolio?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {item.is_featured && (
                    <Badge variant="default" className="gap-1">
                      <Star className="h-3 w-3" />
                      Unggulan
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingItem(item);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePortfolioMutation.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <p className="text-muted-foreground mb-3">{item.description}</p>
              
              {item.technologies && item.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                {item.category && (
                  <Badge variant="secondary">{item.category}</Badge>
                )}
                {item.project_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={item.project_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PortfolioManager;
