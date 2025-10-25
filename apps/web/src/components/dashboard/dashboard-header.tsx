'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw, Swords, Users } from 'lucide-react';
import Link from 'next/link';

interface DashboardHeaderProps {
  lastUpdated?: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DashboardHeader({ lastUpdated, onRefresh, isRefreshing }: DashboardHeaderProps) {
  return (
    <header className="space-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard SCUM · PvP</h1>
          <p className="text-muted-foreground">
            Análise completa de todos os eventos PvP do servidor. Dados atualizados automaticamente.
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Última atualização: {new Date(lastUpdated).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/clan-comparison">
            <Button variant="outline" size="sm">
              <Swords className="h-4 w-4 mr-2" />
              Comparar Clãs
            </Button>
          </Link>
          <Link href="/dashboard/player-comparison">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Comparar Players
            </Button>
          </Link>
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar Cache'}
          </Button>
        </div>
      </div>
    </header>
  );
}
