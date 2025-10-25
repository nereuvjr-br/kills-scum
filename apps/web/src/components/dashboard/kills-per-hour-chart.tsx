'use client';

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
}

interface KillsPerHourChartProps {
  data: KillsByHour[];
}

export function KillsPerHourChart({ data }: KillsPerHourChartProps) {
  return (
    <ChartCard title="Kills por Horário" description="Distribuição ao longo do dia (UTC)">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} interval={2} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: number) => [`${value} kills`, 'Total']} />
            <Bar dataKey="kills" fill="#f59e0b" radius={[4, 4, 0, 0]} />
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
