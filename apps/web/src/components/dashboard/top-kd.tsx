'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface TopKDPlayer {
  name: string;
  kills: number;
  deaths: number;
  kd: number;
  clanTag?: string | null;
  clanColor?: string | null;
}

interface TopKDProps {
  data: TopKDPlayer[];
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function TopKD({ data }: TopKDProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Top K/D Ratio
        </CardTitle>
        <CardDescription>Eficiência dos jogadores com melhor desempenho</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((player, index) => (
            <div key={player.name} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{player.name}</p>
                  {player.clanTag && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: player.clanColor || '#gray',
                        color: 'white',
                      }}
                    >
                      {player.clanTag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {numberFormatter.format(player.kills)} kills · {numberFormatter.format(player.deaths)} mortes
                </p>
              </div>
              <span className={`text-lg font-semibold ${index === 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                {player.kd.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
