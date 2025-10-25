'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface TopClan {
  name: string;
  tag: string;
  color: string;
  count: number;
}

interface TopClansProps {
  data: TopClan[];
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function TopClans({ data }: TopClansProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          Clãs em Destaque
        </CardTitle>
        <CardDescription>Grupos com maior volume de eliminações</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum clã encontrado
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((clan, index) => (
              <div key={clan.tag} className="rounded-lg border bg-card p-4">
                <p className="text-xs text-muted-foreground">#{index + 1}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold text-white"
                    style={{ backgroundColor: clan.color }}
                  >
                    {clan.tag}
                  </span>
                  <p className="text-lg font-semibold">{clan.name}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {numberFormatter.format(clan.count)} kills
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
