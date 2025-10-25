# Sistema de Gerenciamento de Clãs e Players

## 📋 Visão Geral

Sistema completo para gerenciar **Clãs** e **Players** no servidor SCUM, reconhecendo que **killer e victim são a mesma entidade** (jogadores).

## 🗄️ Estrutura do Banco de Dados

### Tabela `clans`
```sql
- id: serial PRIMARY KEY
- name: varchar(255) UNIQUE NOT NULL        -- Nome do clã
- tag: varchar(50) UNIQUE NOT NULL          -- Tag/Sigla (ex: TDB, PCD)
- description: text                         -- Descrição opcional
- color: varchar(7) DEFAULT '#3b82f6'       -- Cor em hex para UI
- created_at: timestamp
- updated_at: timestamp
```

### Tabela `players`
```sql
- id: serial PRIMARY KEY
- name: varchar(255) UNIQUE NOT NULL        -- Nome do player
- clan_id: integer REFERENCES clans(id)     -- FK para clã (opcional)
- discord_id: varchar(255)                  -- ID do Discord (opcional)
- created_at: timestamp
- updated_at: timestamp
```

## 🚀 Como Usar

### 1. Executar Migration

```bash
# Via TypeScript
npx tsx scripts/run-clans-migration.ts

# Ou via SQL direto no PostgreSQL
psql -U seu_usuario -d kills_scum -f scripts/run-clans-migration.sql
```

### 2. Acessar Interface de Administração

#### Gerenciar Clãs
```
http://localhost:3000/admin/clans
```

**Funcionalidades:**
- ✅ Criar novos clãs
- ✅ Editar nome, tag, descrição e cor
- ✅ Deletar clãs (remove associação dos players)
- ✅ Visualizar número de membros

#### Gerenciar Players
```
http://localhost:3000/admin/players
```

**Funcionalidades:**
- ✅ Sincronizar players automaticamente dos killfeeds
- ✅ Buscar players por nome
- ✅ Filtrar por clã
- ✅ Associar players a clãs
- ✅ Remover players de clãs
- ✅ Visualizar players sem clã

## 📡 API tRPC

### Clans Router

```typescript
// Listar todos os clãs
trpc.clans.list.useQuery()

// Criar clã
trpc.clans.create.useMutation({
  name: 'The Death Brigade',
  tag: 'TDB',
  description: 'Descrição opcional',
  color: '#ef4444'
})

// Atualizar clã
trpc.clans.update.useMutation({
  id: 1,
  name: 'Novo Nome'
})

// Deletar clã
trpc.clans.delete.useMutation({ id: 1 })

// Buscar por ID com membros
trpc.clans.getById.useQuery({ id: 1 })

// Estatísticas do clã
trpc.clans.getStats.useQuery({ id: 1 })
```

### Players Router

```typescript
// Listar players
trpc.players.list.useQuery({
  search: 'nome',      // opcional
  clanId: 1            // opcional
})

// Criar player manualmente
trpc.players.create.useMutation({
  name: 'PlayerName',
  clanId: 1,           // opcional
  discordId: '123'     // opcional
})

// Atualizar player
trpc.players.update.useMutation({
  id: 1,
  clanId: 2
})

// Associar player a clã
trpc.players.assignToClan.useMutation({
  playerId: 1,
  clanId: 2  // ou null para remover
})

// Associar múltiplos players
trpc.players.assignMultipleToClan.useMutation({
  playerIds: [1, 2, 3],
  clanId: 2
})

// Buscar players sem clã
trpc.players.getUnassigned.useQuery()

// Sincronizar do killfeed
trpc.players.syncFromKillfeeds.useMutation()
```

## 🎨 Clãs de Exemplo Pré-cadastrados

Após executar a migration, os seguintes clãs serão criados:

| Nome                    | Tag   | Cor     |
|------------------------|-------|---------|
| The Death Brigade      | TDB   | #ef4444 |
| Polícia Civil Digital  | PCD   | #3b82f6 |
| Alfa Squad             | Alfa  | #10b981 |
| REI Clan               | REI   | #f59e0b |
| B M X Crew             | BMX   | #8b5cf6 |

## 🔄 Sincronização Automática

A função `syncFromKillfeeds` faz:
1. Busca todos os nomes únicos em `killfeeds.killer` e `killfeeds.victim`
2. Filtra NPCs (nomes que começam com "NPC ")
3. Cria apenas os players que ainda não existem
4. Retorna estatísticas da sincronização

**Exemplo de retorno:**
```json
{
  "total": 150,      // Total de players únicos
  "created": 23,     // Novos players criados
  "existing": 127    // Players já existentes
}
```

## 📊 Integração com Dashboard

### Próximos Passos

Atualizar o dashboard para usar dados dos players e clãs:

```typescript
// Exemplo de query enriquecida
const playerWithClan = await db
  .select()
  .from(killfeeds)
  .leftJoin(players, eq(killfeeds.killer, players.name))
  .leftJoin(clans, eq(players.clanId, clans.id))
```

### Estatísticas por Clã

Possíveis métricas:
- Total de kills do clã
- Total de mortes do clã
- K/D ratio do clã
- Membro mais ativo
- Arma mais usada pelo clã
- Rivalidades (clãs que mais se enfrentam)

## 🛠️ Arquivos Criados

### Backend
1. `/packages/api/src/db/schema.ts` - Schemas das tabelas
2. `/packages/api/src/routers/clans.ts` - Router de clãs
3. `/packages/api/src/routers/players.ts` - Router de players
4. `/packages/api/drizzle/0001_add_clans_and_players.sql` - Migration

### Scripts
1. `/scripts/run-clans-migration.ts` - Migration TypeScript
2. `/scripts/run-clans-migration.sql` - Migration SQL

### Frontend
1. `/apps/web/src/app/admin/clans/page.tsx` - Admin de clãs
2. `/apps/web/src/app/admin/players/page.tsx` - Admin de players

## 🔐 Segurança

⚠️ **IMPORTANTE**: As rotas de administração não têm autenticação!

Adicione autenticação antes de deploy:
```typescript
// Exemplo com middleware
const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user?.isAdmin) {
    throw new Error('Não autorizado');
  }
  return next();
});
```

## 📝 Workflow Recomendado

1. **Criar Clãs** (`/admin/clans`)
   - Definir nome, tag e cor

2. **Sincronizar Players** (`/admin/players`)
   - Clique em "Sincronizar Players"
   - Importa automaticamente de killfeeds

3. **Associar Players a Clãs**
   - Use filtros para encontrar players
   - Selecione o clã no dropdown

4. **Visualizar no Dashboard**
   - Estatísticas por clã
   - Rankings de clãs
   - Rivalidades

## 🎯 Benefícios

✅ **Organização** - Players agrupados por clãs  
✅ **Análises** - Estatísticas por grupo  
✅ **Flexibilidade** - Players podem não ter clã  
✅ **Sincronização** - Auto-importação de killfeeds  
✅ **UI Intuitiva** - Interface de admin completa  
✅ **Type-safe** - tRPC com TypeScript  

---

**Status:** ✅ Implementado e pronto para usar  
**Data:** 24 de outubro de 2025
