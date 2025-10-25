'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

interface RecentKill {
  id: string;
  killer: string;
  killerClanTag?: string | null;
  killerClanColor?: string | null;
  victim: string;
  victimClanTag?: string | null;
  victimClanColor?: string | null;
  weapon: string;
  distance: string;
  timestamp: string;
}

interface RecentKillsProps {
  data?: RecentKill[];
  isLoading: boolean;
}

export function RecentKills({ data, isLoading }: RecentKillsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-500" />
          Kills Recentes
        </CardTitle>
        <CardDescription>Últimos eventos registrados na base</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
        ) : data?.length ? (
          <div className="space-y-3">
            {data.map((kill, index) => (
              <div
                key={`${kill.id}-${index}`}
                className="flex items-center justify-between rounded-lg border bg-card p-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-500">{kill.killer}</span>
                      {kill.killerClanTag && (
                        <span
                          className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: kill.killerClanColor || '#gray',
                            color: 'white',
                          }}
                        >
                          {kill.killerClanTag}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground">eliminou</span>
                    <div className="flex items-center gap-1">
                      <span className="text-red-500">{kill.victim}</span>
                      {kill.victimClanTag && (
                        <span
                          className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: kill.victimClanColor || '#gray',
                            color: 'white',
                          }}
                        >
                          {kill.victimClanTag}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {kill.weapon} · {kill.distance}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(kill.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum evento recente encontrado.</p>
        )}
      </CardContent>
    </Card>
  );
}
