'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Loader from '@/components/loader';
import { Swords, TrendingUp, Users, Target, Clock } from 'lucide-react';

export default function ClanComparisonPage() {
  const [selectedClan1, setSelectedClan1] = useState<number | null>(null);
  const [selectedClan2, setSelectedClan2] = useState<number | null>(null);

  const { data: clans, isLoading: clansLoading } = trpc.clans.list.useQuery();
  const { data: comparison, isLoading: comparisonLoading } = trpc.clanComparison.compare.useQuery(
    { clan1Id: selectedClan1!, clan2Id: selectedClan2! },
    { enabled: !!selectedClan1 && !!selectedClan2 && selectedClan1 !== selectedClan2 }
  );

  const numberFormatter = new Intl.NumberFormat('pt-BR');

  if (clansLoading) {
    return <Loader />;
  }

  const availableClans = clans || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Comparação de Clãs</h1>
        <p className="text-muted-foreground">Analise o desempenho de dois clãs lado a lado</p>
      </div>

      {/* Seletores de Clãs */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Clã 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {availableClans.map((clan) => (
                <Button
                  key={clan.id}
                  variant={selectedClan1 === clan.id ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setSelectedClan1(clan.id)}
                  disabled={selectedClan2 === clan.id}
                  style={
                    selectedClan1 === clan.id
                      ? { backgroundColor: clan.color || undefined }
                      : undefined
                  }
                >
                  {clan.tag}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clã 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {availableClans.map((clan) => (
                <Button
                  key={clan.id}
                  variant={selectedClan2 === clan.id ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setSelectedClan2(clan.id)}
                  disabled={selectedClan1 === clan.id}
                  style={
                    selectedClan2 === clan.id
                      ? { backgroundColor: clan.color || undefined }
                      : undefined
                  }
                >
                  {clan.tag}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados da Comparação */}
      {comparisonLoading && <Loader />}

      {comparison && (
        <div className="space-y-6">
          {/* Head to Head */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-red-500" />
                Confronto Direto
              </CardTitle>
              <CardDescription>
                Estatísticas de confrontos entre {comparison.clan1.tag} e {comparison.clan2.tag}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div
                    className="text-4xl font-bold mb-2"
                    style={{ color: comparison.clan1.color || undefined }}
                  >
                    {numberFormatter.format(comparison.headToHead.clan1Wins)}
                  </div>
                  <div className="text-sm text-muted-foreground">{comparison.clan1.tag} vitórias</div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-6xl font-bold text-muted-foreground">VS</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-muted">
                  <div
                    className="text-4xl font-bold mb-2"
                    style={{ color: comparison.clan2.color || undefined }}
                  >
                    {numberFormatter.format(comparison.headToHead.clan2Wins)}
                  </div>
                  <div className="text-sm text-muted-foreground">{comparison.clan2.tag} vitórias</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Gerais */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Clã 1 */}
            <Card>
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: comparison.clan1.color || undefined }}
                >
                  {comparison.clan1.tag} - {comparison.clan1.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Membros</span>
                  </div>
                  <span className="font-semibold">{comparison.clan1.memberCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">Total Kills</span>
                  </div>
                  <span className="font-semibold text-emerald-600">
                    {numberFormatter.format(comparison.clan1.totalKills)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">Total Deaths</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    {numberFormatter.format(comparison.clan1.totalDeaths)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">K/D Ratio</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {comparison.clan1.kd.toFixed(2)}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-sm">Top Killers</h4>
                  <div className="space-y-2">
                    {comparison.clan1.topKillers.map((killer) => (
                      <div key={killer.name} className="flex justify-between text-sm">
                        <span>{killer.name}</span>
                        <span className="text-muted-foreground">
                          {numberFormatter.format(killer.kills)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-sm">Armas Favoritas</h4>
                  <div className="space-y-2">
                    {comparison.clan1.topWeapons.map((weapon) => (
                      <div key={weapon.weapon} className="flex justify-between text-sm">
                        <span>{weapon.weapon}</span>
                        <span className="text-muted-foreground">
                          {numberFormatter.format(weapon.count)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clã 2 */}
            <Card>
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: comparison.clan2.color || undefined }}
                >
                  {comparison.clan2.tag} - {comparison.clan2.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Membros</span>
                  </div>
                  <span className="font-semibold">{comparison.clan2.memberCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">Total Kills</span>
                  </div>
                  <span className="font-semibold text-emerald-600">
                    {numberFormatter.format(comparison.clan2.totalKills)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">Total Deaths</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    {numberFormatter.format(comparison.clan2.totalDeaths)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">K/D Ratio</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {comparison.clan2.kd.toFixed(2)}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-sm">Top Killers</h4>
                  <div className="space-y-2">
                    {comparison.clan2.topKillers.map((killer) => (
                      <div key={killer.name} className="flex justify-between text-sm">
                        <span>{killer.name}</span>
                        <span className="text-muted-foreground">
                          {numberFormatter.format(killer.kills)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-sm">Armas Favoritas</h4>
                  <div className="space-y-2">
                    {comparison.clan2.topWeapons.map((weapon) => (
                      <div key={weapon.weapon} className="flex justify-between text-sm">
                        <span>{weapon.weapon}</span>
                        <span className="text-muted-foreground">
                          {numberFormatter.format(weapon.count)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Batalhas Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Últimas Batalhas entre os Clãs
              </CardTitle>
              <CardDescription>Confrontos diretos recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparison.headToHead.recentBattles.map((battle, index) => {
                  const isFromClan1 = comparison.clan1.topKillers.some(
                    (k) => k.name === battle.killer
                  );
                  const killerColor = isFromClan1 ? comparison.clan1.color : comparison.clan2.color;
                  const victimColor = isFromClan1 ? comparison.clan2.color : comparison.clan1.color;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border bg-card p-3"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                          <span style={{ color: killerColor || undefined }}>{battle.killer}</span>
                          <span className="text-muted-foreground">eliminou</span>
                          <span style={{ color: victimColor || undefined }}>{battle.victim}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {battle.weapon} · {battle.distance}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-4">
                        {new Date(battle.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedClan1 || !selectedClan2 ? (
        <div className="text-center py-12 text-muted-foreground">
          Selecione dois clãs diferentes para comparar suas estatísticas
        </div>
      ) : null}

      {selectedClan1 === selectedClan2 && selectedClan1 !== null ? (
        <div className="text-center py-12 text-muted-foreground">
          Por favor, selecione dois clãs diferentes
        </div>
      ) : null}
    </div>
  );
}
