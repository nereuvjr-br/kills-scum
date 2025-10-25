'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skull } from 'lucide-react';

interface TopVictim {
  name: string;
  deaths: number;
  clanTag?: string | null;
  clanColor?: string | null;
}

interface TopVictimsProps {
  data: TopVictim[];
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function TopVictims({ data }: TopVictimsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skull className="h-5 w-5 text-red-500" />
          Top 10 Vítimas
        </CardTitle>
        <CardDescription>Quem mais morreu em combate</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((player, index) => (
            <div key={player.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
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
              <span className="text-lg font-semibold text-red-600">
                {numberFormatter.format(player.deaths)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
