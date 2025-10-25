## 🎯 Dashboard SCUM Kills - Guia Rápido

### Acesso
```
http://localhost:3001/dashboard
```

### Funcionalidades Principais

#### 1️⃣ Estatísticas Gerais
- **Total de Kills**: 1.401 registros
- **Jogadores Únicos**: Todos os players que participaram
- **Distância Média**: Stats de distância dos kills
- **Armas Utilizadas**: Variedade de armas

#### 2️⃣ Rankings
- 🏆 **Top 10 Killers**: Jogadores com mais kills
- 💀 **Top 10 Victims**: Jogadores com mais mortes
- 📈 **Top 10 K/D Ratio**: Melhor performance
- 🔫 **Top 10 Armas**: Mais utilizadas

#### 3️⃣ Busca de Jogador
Digite o nome de qualquer jogador para ver:
- Kills e Deaths totais
- K/D Ratio
- Armas favoritas (top 5)
- Vítimas frequentes (top 5)
- Quem mais o mata (top 5)

#### 4️⃣ Kills Recentes
- Últimos 10 kills registrados
- Mostra: killer → victim, arma, distância, hora

#### 5️⃣ Top Clans
- 5 clans com mais kills

### Navegação
```
Home      → /
Importar  → /import
Dashboard → /dashboard
```

### Cores no Dashboard
- 🟢 Verde: Kills, estatísticas positivas
- 🔴 Vermelho: Deaths, vítimas
- 🔵 Azul: K/D Ratio
- 🟠 Laranja: Armas
- 🟣 Roxo: Clans

### Comandos Úteis

```bash
# Iniciar servidor
npm run dev

# Verificar dados
npx tsx scripts/verify-appwrite-quick.ts

# Analisar banco (console)
npx tsx scripts/analyze-database.ts

# Verificar tipos
npm run check-types
```

### Arquivos Principais

```
📁 Dashboard
├── apps/web/src/app/dashboard/page.tsx    # Página principal
├── apps/web/src/components/
│   └── player-search.tsx                  # Busca de jogador
└── packages/api/src/routers/
    └── dashboard.ts                       # API endpoints

📊 Endpoints tRPC
├── dashboard.getStats        # Todas as estatísticas
├── dashboard.getRecentKills  # Kills recentes
└── dashboard.getPlayerStats  # Stats de um jogador
```

### Features
- ✅ Dark/Light mode
- ✅ Responsivo (mobile/tablet/desktop)
- ✅ Type-safe (TypeScript + tRPC)
- ✅ Cache inteligente (React Query)
- ✅ Loading states
- ✅ Error handling
- ✅ Real-time data (Appwrite)

### Performance
- Dados carregam automaticamente
- Cache de 5 minutos no React Query
- Batch requests com tRPC
- Pagination no Appwrite

---

**Tudo pronto! Acesse `/dashboard` e explore! 🚀**
