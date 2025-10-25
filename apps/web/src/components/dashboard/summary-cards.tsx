'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Crosshair,
  Skull,
  Swords,
  Target,
  Trophy,
  Users,
} from 'lucide-react';

interface DistanceStats {
  avg: number;
  median: number;
  max: number;
  min: number;
}

interface SummaryCardsProps {
  totalKills: number;
  uniqueKillers: number;
  uniqueVictims: number;
  uniquePlayers: number;
  uniqueWeapons: number;
  distanceStats: DistanceStats;
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function SummaryCards({
  totalKills,
  uniqueKillers,
  uniqueVictims,
  uniquePlayers,
  uniqueWeapons,
  distanceStats,
}: SummaryCardsProps) {
  const summaryCards = [
    {
      title: 'Total de Kills',
      value: numberFormatter.format(totalKills),
      icon: Crosshair,
      highlight: 'Todas as eliminações registradas',
    },
    {
      title: 'Matadores Únicos',
      value: numberFormatter.format(uniqueKillers),
      icon: Trophy,
      highlight: 'Jogadores que eliminaram alguém',
    },
    {
      title: 'Vítimas Únicas',
      value: numberFormatter.format(uniqueVictims),
      icon: Skull,
      highlight: 'Jogadores que foram abatidos',
    },
    {
      title: 'Jogadores Únicos',
      value: numberFormatter.format(uniquePlayers),
      icon: Users,
      highlight: 'Total de participantes distintos',
    },
    {
      title: 'Armas Diferentes',
      value: numberFormatter.format(uniqueWeapons),
      icon: Swords,
      highlight: 'Variedade de armas utilizadas',
    },
    {
      title: 'Distância Média',
      value: `${distanceStats.avg.toFixed(1)}m`,
      icon: Target,
      highlight: `Mediana ${distanceStats.median.toFixed(0)}m · Máxima ${distanceStats.max.toFixed(0)}m`,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {summaryCards.map(({ title, value, icon: Icon, highlight }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-2">{highlight}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
