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

interface DistanceBucket {
  bucket: string;
  kills: number;
}

interface DistanceDistributionChartProps {
  data: DistanceBucket[];
}

export function DistanceDistributionChart({ data }: DistanceDistributionChartProps) {
  return (
    <ChartCard
      title="Distribuição por Distância"
      description="Como as eliminações se distribuem por alcance"
    >
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: number) => [`${value} kills`, 'Quantidade']} />
            <Bar dataKey="kills" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Distâncias ainda não registradas.
        </div>
      )}
    </ChartCard>
  );
}
