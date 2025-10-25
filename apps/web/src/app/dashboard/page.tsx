'use client';

import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayerSearch } from '@/components/player-search';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { KillsPerDayChart } from '@/components/dashboard/kills-per-day-chart';
import { DistanceDistributionChart } from '@/components/dashboard/distance-distribution-chart';
import { KillsPerHourChart } from '@/components/dashboard/kills-per-hour-chart';
import { WeaponUsageChart } from '@/components/dashboard/weapon-usage-chart';
import { TopKillers } from '@/components/dashboard/top-killers';
import { TopKD } from '@/components/dashboard/top-kd';
import { TopVictims } from '@/components/dashboard/top-victims';
import { TopClans } from '@/components/dashboard/top-clans';
import { RecentKills } from '@/components/dashboard/recent-kills';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = trpc.dashboard.getStats.useQuery(undefined, {
    refetchInterval: 30000, // Auto-refresh a cada 30 segundos
  });

  const {
    data: recentKills,
    isLoading: recentLoading,
  } = trpc.dashboard.getRecentKills.useQuery(
    { limit: 20 },
    {
      refetchInterval: 30000,
    }
  );

  const refreshCacheMutation = trpc.dashboard.refreshCache.useMutation();

  const handleRefresh = () => {
    refreshCacheMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao carregar o dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <DashboardHeader
        lastUpdated={stats.lastUpdated}
        onRefresh={handleRefresh}
        isRefreshing={refreshCacheMutation.isPending}
      />

      <section>
        <SummaryCards
          totalKills={stats.totalKills}
          uniqueKillers={stats.uniqueKillers}
          uniqueVictims={stats.uniqueVictims}
          uniquePlayers={stats.uniquePlayers}
          uniqueWeapons={stats.uniqueWeapons}
          distanceStats={stats.distanceStats}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <KillsPerDayChart data={stats.charts.killsByDay} />
          <DistanceDistributionChart data={stats.charts.distanceBuckets} />
        </div>

        <div className="space-y-6">
          <KillsPerHourChart data={stats.charts.killsByHour} />
          <WeaponUsageChart data={stats.charts.weaponUsage} />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <TopKillers data={stats.topKillers} />
        <TopKD data={stats.topKD} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopVictims data={stats.topVictims} />
        <TopClans data={stats.topClans} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentKills data={recentKills} isLoading={recentLoading} />
        <PlayerSearch />
      </section>
    </div>
  );
}
