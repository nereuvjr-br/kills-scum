'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface TopKiller {
  name: string;
  kills: number;
  clanTag?: string | null;
  clanColor?: string | null;
}

interface TopKillersProps {
  data: TopKiller[];
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function TopKillers({ data }: TopKillersProps) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top 10 Killers
        </CardTitle>
        <CardDescription>Jogadores com mais eliminações registradas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((player, index) => (
            <div key={player.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    index === 0
                      ? 'bg-yellow-500 text-black'
                      : index === 1
                      ? 'bg-gray-300 text-black'
                      : index === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{player.name}</span>
                  {player.clanTag && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                      style={{
                        backgroundColor: player.clanColor || '#gray',
                        color: 'white',
                      }}
                    >
                      {player.clanTag}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-lg font-semibold text-emerald-600">
                {numberFormatter.format(player.kills)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
