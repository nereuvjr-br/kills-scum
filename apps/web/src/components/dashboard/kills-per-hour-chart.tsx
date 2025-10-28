'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from './chart-card';

interface KillsByHour {
  hour: string;
  kills: number;
  average: number;
}

interface KillsPerHourChartProps {
  data: KillsByHour[];
}

export function KillsPerHourChart({ data }: KillsPerHourChartProps) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    return data;
  }, [data]);

  const totalKills = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.kills, 0);
  }, [chartData]);

  const peakHour = useMemo(() => {
    if (!chartData.length) return null;
    return chartData.reduce((prev, current) =>
      current.kills > prev.kills ? current : prev
    );
  }, [chartData]);

  return (
    <ChartCard
      title="Kills por Horário"
      description={`Média dos últimos 7 dias • Total: ${totalKills} kills${peakHour ? ` • Pico: ${peakHour.hour} (${peakHour.average}/dia)` : ''}`}
    >
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              interval={2}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              label={{ value: 'Média/dia', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'average') return [`${value} kills/dia`, 'Média'];
                return [`${value} kills`, 'Total (7 dias)'];
              }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar
              dataKey="average"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Ainda sem dados suficientes.
        </div>
      )}
    </ChartCard>
  );
}
