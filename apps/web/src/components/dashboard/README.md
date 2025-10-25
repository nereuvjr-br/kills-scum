# Dashboard - Componentes Refatorados

## 📋 Visão Geral

O dashboard foi refatorado em componentes modulares e reutilizáveis para melhorar a manutenibilidade, testabilidade e organização do código.

## 🗂️ Estrutura de Componentes

```
src/components/dashboard/
├── chart-card.tsx              # Card wrapper para gráficos
├── dashboard-header.tsx        # Cabeçalho com título e botão de refresh
├── distance-distribution-chart.tsx  # Gráfico de distribuição por distância
├── kills-per-day-chart.tsx     # Gráfico de kills por dia
├── kills-per-hour-chart.tsx    # Gráfico de kills por horário
├── recent-kills.tsx            # Lista de kills recentes
├── summary-cards.tsx           # Cards de resumo (total kills, players, etc)
├── top-clans.tsx              # Card com top clãs
├── top-kd.tsx                 # Card com top K/D ratio
├── top-killers.tsx            # Card com top killers
├── top-victims.tsx            # Card com top vítimas
├── weapon-usage-chart.tsx     # Gráfico de uso de armas
└── index.ts                   # Barrel export
```

## 🎯 Componentes Principais

### `DashboardHeader`
Cabeçalho do dashboard com título, descrição e botão de atualização.

**Props:**
- `lastUpdated?: string` - Data da última atualização
- `onRefresh: () => void` - Callback para atualizar cache
- `isRefreshing: boolean` - Estado de carregamento

### `SummaryCards`
Grid de cards com estatísticas gerais do servidor.

**Props:**
- `totalKills: number`
- `uniqueKillers: number`
- `uniqueVictims: number`
- `uniquePlayers: number`
- `uniqueWeapons: number`
- `distanceStats: { avg, median, max, min }`

### `ChartCard`
Wrapper reutilizável para gráficos com título e descrição.

**Props:**
- `title: string`
- `description: string`
- `children: ReactNode`
- `className?: string`

### Componentes de Gráficos

#### `KillsPerDayChart`
Gráfico de área mostrando kills dos últimos 14 dias.

**Props:**
- `data: Array<{ date: string, kills: number }>`

#### `DistanceDistributionChart`
Gráfico de barras com distribuição de kills por distância.

**Props:**
- `data: Array<{ bucket: string, kills: number }>`

#### `KillsPerHourChart`
Gráfico de barras mostrando distribuição por hora do dia.

**Props:**
- `data: Array<{ hour: string, kills: number }>`

#### `WeaponUsageChart`
Gráfico horizontal com top armas mais usadas.

**Props:**
- `data: Array<{ weapon: string, kills: number }>`

### Componentes de Rankings

#### `TopKillers`
Lista dos 10 jogadores com mais eliminações.

**Props:**
- `data: Array<{ name: string, kills: number }>`

#### `TopKD`
Lista dos 10 jogadores com melhor K/D ratio.

**Props:**
- `data: Array<{ name: string, kills: number, deaths: number, kd: number }>`

#### `TopVictims`
Lista dos 10 jogadores com mais mortes.

**Props:**
- `data: Array<{ name: string, deaths: number }>`

#### `TopClans`
Grid com os 5 clãs mais ativos.

**Props:**
- `data: Array<{ name: string, count: number }>`

### `RecentKills`
Lista de eliminações recentes com detalhes.

**Props:**
- `data?: Array<{ id, killer, victim, weapon, distance, timestamp }>`
- `isLoading: boolean`

## 🔧 Uso

### Importação Individual
```tsx
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { TopKillers } from '@/components/dashboard/top-killers';
```

### Importação via Barrel
```tsx
import { 
  SummaryCards, 
  TopKillers, 
  DashboardHeader 
} from '@/components/dashboard';
```

## 🎨 Benefícios da Refatoração

### ✅ Separação de Responsabilidades
- Cada componente tem uma única responsabilidade
- Facilita testes unitários
- Melhora a reutilização

### ✅ Manutenibilidade
- Código mais fácil de entender e modificar
- Mudanças isoladas não afetam outros componentes
- Documentação clara de props

### ✅ Performance
- Componentes podem ser otimizados individualmente
- Memoization mais efetiva
- Code splitting mais granular

### ✅ Testabilidade
- Componentes isolados são mais fáceis de testar
- Props explícitas facilitam mock de dados
- Testes mais focados e rápidos

## 📊 Fluxo de Dados

```
DashboardPage (page.tsx)
    ↓
trpc.dashboard.getStats.useQuery()
    ↓
Distribui dados para componentes filhos
    ↓
Componentes renderizam suas seções
```

## 🚀 Próximos Passos

- [ ] Adicionar testes unitários para cada componente
- [ ] Implementar Storybook para documentação visual
- [ ] Adicionar animações nas transições
- [ ] Implementar filtros de data
- [ ] Adicionar exports de dados (CSV/PDF)
- [ ] Criar versão mobile otimizada
- [ ] Adicionar loading states granulares

## 📝 Convenções

- Todos os componentes são **client components** (`'use client'`)
- Uso de **TypeScript** com tipos explícitos
- Formatação de números com `Intl.NumberFormat('pt-BR')`
- Ícones do **lucide-react**
- Charts do **recharts**
- UI components do **shadcn/ui**

## 🛠️ Manutenção

Ao adicionar novos componentes:
1. Criar arquivo na pasta `dashboard/`
2. Exportar no `index.ts`
3. Documentar props neste README
4. Manter padrão de nomenclatura
5. Adicionar tipos TypeScript

---

**Última atualização:** 24/10/2025
