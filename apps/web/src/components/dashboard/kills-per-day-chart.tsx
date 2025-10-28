'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from './chart-card';

interface KillsByDay {
  date: string;
  kills: number;
}

interface KillsPerDayChartProps {
  data: KillsByDay[];
}

export function KillsPerDayChart({ data }: KillsPerDayChartProps) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];

    // Dados já vêm filtrados do backend (últimos 7 dias)
    return data
      .map(({ date, kills }) => {
        const parsedDate = new Date(date);
        const label = parsedDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        });

        return { date, label, kills };
      })
      .filter((item) => !Number.isNaN(new Date(item.date).getTime()));
  }, [data]);

  const totalKills = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.kills, 0);
  }, [chartData]);

  const avgKillsPerDay = useMemo(() => {
    return chartData.length > 0 ? (totalKills / chartData.length).toFixed(1) : '0';
  }, [chartData, totalKills]);

  return (
    <ChartCard
      title="Kills por Dia"
      description={`Últimos 7 dias • Total: ${totalKills} kills • Média: ${avgKillsPerDay} kills/dia`}
    >
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="killsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [`${value} kills`, 'Total']}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="kills"
              stroke="#059669"
              strokeWidth={2}
              fill="url(#killsGradient)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Sem eventos suficientes para gerar o gráfico.
        </div>
      )}
    </ChartCard>
  );
}
