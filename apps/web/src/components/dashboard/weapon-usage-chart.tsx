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

interface WeaponUsage {
  weapon: string;
  kills: number;
}

interface WeaponUsageChartProps {
  data: WeaponUsage[];
}

export function WeaponUsageChart({ data }: WeaponUsageChartProps) {
  return (
    <ChartCard title="Armas em Destaque" description="Top armas do servidor">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" allowDecimals={false} hide />
            <YAxis dataKey="weapon" type="category" width={120} />
            <Tooltip formatter={(value: number) => [`${value} kills`, 'Quantidade']} />
            <Bar dataKey="kills" fill="#ec4899" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Nenhuma arma registrada ainda.
        </div>
      )}
    </ChartCard>
  );
}
