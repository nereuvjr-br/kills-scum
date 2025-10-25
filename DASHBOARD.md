# 📊 Dashboard SCUM Kills

Dashboard completo para visualização e análise dos dados de kills do servidor SCUM.

## 🎯 Funcionalidades

### 📈 Estatísticas Gerais
- **Total de Kills**: Contagem total de registros no banco de dados
- **Jogadores Únicos**: Total de players que participaram (killers + victims)
- **Distância Média**: Estatísticas de distância dos kills (média, mediana, min, max)
- **Armas Diferentes**: Quantidade de armas utilizadas

### 🏆 Rankings

#### Top 10 Killers
- Lista dos jogadores com mais kills
- Destaque visual para os 3 primeiros lugares (ouro, prata, bronze)
- Contador de kills para cada jogador

#### Top 10 Victims
- Jogadores que mais morreram
- Visualização clara das mortes

#### Top 10 K/D Ratio
- Melhor taxa de kills/deaths
- Mostra kills e deaths de cada jogador
- Ordena por melhor performance

#### Top 10 Armas
- Armas mais utilizadas no servidor
- Contador de uso de cada arma

#### Top 5 Clans
- Clans com mais kills registrados
- Visualização em grid

### 🔫 Kills Recentes
- Últimos 10 registros no banco de dados
- Mostra killer → victim
- Arma utilizada e distância
- Data e hora do kill

## 🛠️ Tecnologias Utilizadas

- **Next.js 15**: Framework React
- **tRPC**: Type-safe API
- **TailwindCSS**: Estilização
- **shadcn/ui**: Componentes UI
- **Lucide Icons**: Ícones
- **Appwrite**: Banco de dados

## 📁 Estrutura

```
apps/web/src/
├── app/
│   └── dashboard/
│       └── page.tsx          # Página principal do dashboard
├── components/
│   ├── header.tsx            # Navegação (com link para Dashboard)
│   └── ui/                   # Componentes shadcn/ui
└── utils/
    └── trpc.ts               # Cliente tRPC configurado

packages/api/src/
└── routers/
    └── dashboard.ts          # Router com endpoints do dashboard
```

## 🔌 Endpoints tRPC

### `dashboard.getStats`
Retorna todas as estatísticas do dashboard:
- Total de kills
- Jogadores únicos
- Top 10 killers
- Top 10 victims
- Top 10 armas
- Top 10 K/D ratio
- Top 5 clans
- Estatísticas de distância

### `dashboard.getRecentKills`
Retorna os kills mais recentes:
```typescript
input: { limit: number } // default: 20
output: Array<{
  id: string;
  killer: string;
  victim: string;
  distance: string;
  weapon: string;
  timestamp: string;
}>
```

### `dashboard.getPlayerStats`
Retorna estatísticas de um jogador específico:
```typescript
input: { playerName: string }
output: {
  playerName: string;
  kills: number;
  deaths: number;
  kd: number;
  favoriteWeapons: Array<{ weapon: string; count: number }>;
  topVictims: Array<{ victim: string; count: number }>;
  killedBy: Array<{ killer: string; count: number }>;
}
```

## 🚀 Como Usar

1. **Acesse o Dashboard**
   ```
   http://localhost:3001/dashboard
   ```

2. **Navegação**
   - Use o menu superior para navegar entre Home, Importar e Dashboard

3. **Visualização**
   - O dashboard carrega automaticamente todas as estatísticas
   - Todos os dados são buscados em tempo real do Appwrite

## 🎨 Design

- **Tema**: Suporta dark mode e light mode
- **Responsivo**: Funciona em desktop e mobile
- **Cards**: Cada seção é um card independente
- **Cores**:
  - Verde: Kills/Killers
  - Vermelho: Deaths/Victims
  - Azul: K/D Ratio
  - Laranja: Armas
  - Roxo: Clans

## 📊 Análise de Dados

O dashboard processa os dados do banco de dados e calcula:

1. **Frequência**: Conta quantas vezes cada jogador/arma aparece
2. **Ordenação**: Ordena por maior valor
3. **Top N**: Pega os N primeiros resultados
4. **K/D Ratio**: Calcula kills ÷ deaths (se deaths = 0, usa kills)
5. **Estatísticas**: Média, mediana, min, max das distâncias

## 🔄 Atualização de Dados

- Os dados são buscados do Appwrite em tempo real
- Use React Query para cache e refetch automático
- O dashboard recarrega automaticamente quando há novos dados

## 🐛 Troubleshooting

### Dashboard não carrega
1. Verifique se o servidor está rodando: `npm run dev`
2. Verifique as variáveis de ambiente em `apps/web/.env`
3. Verifique a conexão com Appwrite

### Dados desatualizados
1. Force refresh: Ctrl+F5 ou Cmd+Shift+R
2. Limpe o cache do navegador
3. O React Query faz cache por padrão (configurável)

### Erros de tipo
1. Execute: `npm run check-types`
2. Verifique se `@trpc/react-query` está instalado

## 📝 Futuras Melhorias

- [ ] Filtros por data
- [ ] Busca de jogador específico
- [ ] Gráficos interativos (Chart.js / Recharts)
- [ ] Export de dados (CSV/PDF)
- [ ] Comparação entre jogadores
- [ ] Timeline de kills
- [ ] Mapa de calor de distâncias
- [ ] Análise por período (dia/semana/mês)

## 🎯 Performance

- **Caching**: React Query cacheia resultados
- **Batch**: tRPC agrupa requests
- **SSR**: Next.js renderiza server-side
- **Lazy Loading**: Componentes carregam sob demanda

---

**Desenvolvido para o servidor SCUM** 🎮
