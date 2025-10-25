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

    return data
      .slice(-14)
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

  return (
    <ChartCard title="Kills por Dia" description="Últimos 14 dias de atividade PvP">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="killsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: number) => [`${value} kills`, 'Total']} />
            <Area type="monotone" dataKey="kills" stroke="#059669" fill="url(#killsGradient)" />
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
