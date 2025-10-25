'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Users, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function PlayersAdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClan, setSelectedClan] = useState<number | null>(null);

  const { data: players, isLoading, refetch } = trpc.players.list.useQuery({
    search: searchTerm || undefined,
    clanId: selectedClan || undefined,
  });

  const { data: clans } = trpc.clans.list.useQuery();
  const { data: unassigned } = trpc.players.getUnassigned.useQuery();
  const syncPlayers = trpc.players.syncFromKillfeeds.useMutation();
  const assignToClan = trpc.players.assignToClan.useMutation();

  const handleSync = async () => {
    try {
      const result = await syncPlayers.mutateAsync();
      toast.success(
        `${result.created} novos players sincronizados! (${result.total} total)`
      );
      refetch();
    } catch (error) {
      toast.error('Erro ao sincronizar players');
    }
  };

  const handleAssignClan = async (playerId: number, clanId: number | null) => {
    try {
      await assignToClan.mutateAsync({ playerId, clanId });
      toast.success('Player atualizado com sucesso!');
      refetch();
    } catch (error) {
      toast.error('Erro ao atualizar player');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Players</h1>
          <p className="text-muted-foreground">
            Associe players aos clãs do servidor
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncPlayers.isPending}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${syncPlayers.isPending ? 'animate-spin' : ''}`}
          />
          Sincronizar Players
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{players?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sem Clã</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {unassigned?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Clãs Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {clans?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Player</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o nome do player..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clan-filter">Filtrar por Clã</Label>
              <select
                id="clan-filter"
                value={selectedClan || ''}
                onChange={(e) =>
                  setSelectedClan(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">Todos os clãs</option>
                <option value="0">Sem clã</option>
                {clans?.map((clan) => (
                  <option key={clan.id} value={clan.id}>
                    [{clan.tag}] {clan.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Players</CardTitle>
          <CardDescription>
            {players?.length || 0} players encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {players?.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {player.clan ? (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: player.clan.color || '#3b82f6' }}
                    />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                  )}
                  <div>
                    <p className="font-medium">{player.name}</p>
                    {player.clan && (
                      <p className="text-xs text-muted-foreground">
                        [{player.clan.tag}] {player.clan.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={player.clanId || ''}
                    onChange={(e) =>
                      handleAssignClan(
                        player.id,
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="h-8 px-3 rounded-md border border-input bg-background text-sm"
                    disabled={assignToClan.isPending}
                  >
                    <option value="">Sem clã</option>
                    {clans?.map((clan) => (
                      <option key={clan.id} value={clan.id}>
                        [{clan.tag}] {clan.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            {players?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum player encontrado</p>
                <Button
                  onClick={handleSync}
                  variant="outline"
                  className="mt-4"
                  disabled={syncPlayers.isPending}
                >
                  Sincronizar Players
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
