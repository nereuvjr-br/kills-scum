'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Trophy, Skull, Target, TrendingUp } from 'lucide-react';

export function PlayerSearch() {
  const [playerName, setPlayerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: playerStats, isLoading, error } = trpc.dashboard.getPlayerStats.useQuery(
    { playerName: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      setSearchQuery(playerName.trim());
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Jogador
          </CardTitle>
          <CardDescription>
            Veja as estatísticas detalhadas de qualquer jogador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Nome do jogador..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !playerName.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">Erro ao buscar jogador: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {playerStats && (
        <div className="space-y-6">
          {/* Stats Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kills</CardTitle>
                <Trophy className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{playerStats.kills}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deaths</CardTitle>
                <Skull className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{playerStats.deaths}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">K/D Ratio</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {playerStats.kd.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Combates</CardTitle>
                <Target className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {playerStats.kills + playerStats.deaths}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Armas Favoritas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Armas Favoritas</CardTitle>
                <CardDescription>Top 5 armas mais utilizadas</CardDescription>
              </CardHeader>
              <CardContent>
                {playerStats.favoriteWeapons.length > 0 ? (
                  <div className="space-y-3">
                    {playerStats.favoriteWeapons.map((weapon, i) => (
                      <div key={weapon.weapon} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {i + 1}.
                          </span>
                          <span className="font-medium">{weapon.weapon}</span>
                        </div>
                        <span className="text-sm font-bold text-orange-600">
                          {weapon.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum kill registrado</p>
                )}
              </CardContent>
            </Card>

            {/* Vítimas Frequentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vítimas Frequentes</CardTitle>
                <CardDescription>Jogadores que mais matou</CardDescription>
              </CardHeader>
              <CardContent>
                {playerStats.topVictims.length > 0 ? (
                  <div className="space-y-3">
                    {playerStats.topVictims.map((victim, i) => (
                      <div key={victim.victim} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {i + 1}.
                          </span>
                          <span className="font-medium">{victim.victim}</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          {victim.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum kill registrado</p>
                )}
              </CardContent>
            </Card>

            {/* Morto Por */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Morto Por</CardTitle>
                <CardDescription>Jogadores que mais o mataram</CardDescription>
              </CardHeader>
              <CardContent>
                {playerStats.killedBy.length > 0 ? (
                  <div className="space-y-3">
                    {playerStats.killedBy.map((killer, i) => (
                      <div key={killer.killer} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {i + 1}.
                          </span>
                          <span className="font-medium">{killer.killer}</span>
                        </div>
                        <span className="text-sm font-bold text-red-600">
                          {killer.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nunca morreu</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
