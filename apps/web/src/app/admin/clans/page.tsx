'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ClansAdminPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClan, setEditingClan] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: '',
    color: '#3b82f6',
  });

  const { data: clans, isLoading, refetch } = trpc.clans.list.useQuery();
  const createClan = trpc.clans.create.useMutation();
  const updateClan = trpc.clans.update.useMutation();
  const deleteClan = trpc.clans.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClan) {
        await updateClan.mutateAsync({ id: editingClan, ...formData });
        toast.success('Clã atualizado com sucesso!');
        setEditingClan(null);
      } else {
        await createClan.mutateAsync(formData);
        toast.success('Clã criado com sucesso!');
        setIsCreateOpen(false);
      }

      setFormData({ name: '', tag: '', description: '', color: '#3b82f6' });
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar clã');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este clã? Os players perderão a associação.')) {
      return;
    }

    try {
      await deleteClan.mutateAsync({ id });
      toast.success('Clã deletado com sucesso!');
      refetch();
    } catch (error) {
      toast.error('Erro ao deletar clã');
    }
  };

  const handleEdit = (clan: any) => {
    setEditingClan(clan.id);
    setFormData({
      name: clan.name,
      tag: clan.tag,
      description: clan.description || '',
      color: clan.color,
    });
    setIsCreateOpen(true);
  };

  const handleCancel = () => {
    setIsCreateOpen(false);
    setEditingClan(null);
    setFormData({ name: '', tag: '', description: '', color: '#3b82f6' });
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Clãs</h1>
          <p className="text-muted-foreground">Crie e gerencie os clãs do servidor</p>
        </div>
        {!isCreateOpen && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Clã
          </Button>
        )}
      </div>

      {isCreateOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingClan ? 'Editar Clã' : 'Criar Novo Clã'}</CardTitle>
            <CardDescription>Preencha as informações do clã</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Clã *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="The Death Brigade"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tag">Tag/Sigla *</Label>
                  <Input
                    id="tag"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="TDB"
                    maxLength={50}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do clã"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Cor do Clã</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3b82f6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createClan.isPending || updateClan.isPending}>
                  {editingClan ? 'Atualizar' : 'Criar'} Clã
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clans?.map((clan) => (
          <Card key={clan.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: clan.color || '#3b82f6' }}
                  />
                  <div>
                    <CardTitle className="text-lg">{clan.name}</CardTitle>
                    <CardDescription className="text-xs font-mono">[{clan.tag}]</CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(clan)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(clan.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {clan.description || 'Sem descrição'}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{clan.memberCount}</span>
                <span className="text-muted-foreground">
                  {clan.memberCount === 1 ? 'membro' : 'membros'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clans?.length === 0 && !isCreateOpen && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum clã cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece criando seu primeiro clã
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Clã
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
