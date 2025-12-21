# 💀 Kills Scum Dashboard

Um sistema completo de análise de logs e estatísticas para servidores private do jogo **SCUM**.

Este projeto permite importar logs de kills (killfeeds), gerenciar clãs e visualizar estatísticas detalhadas sobre jogadores, armas e confrontos no servidor.

## 🚀 Funcionalidades Principais

### 📊 Dashboard Analítico
Uma visão geral completa do estado do servidor:
- **Estatísticas Gerais**: Total de kills, jogadores únicos, distância média.
- **Rankings**: Top 10 Killers, Top 10 Victims e melhor K/D Ratio.
- **Análise de Combate**: Armas mais utilizadas e estatísticas de distância.
- **Feed em Tempo Real**: Visualização dos últimos confrontos registrados.

### 📥 Importador CSV Inteligente (v2.1)
Ferramenta robusta para processamento de logs do jogo:
- **Detecção de Duplicatas**: Identifica automaticamente registros já existentes.
- **Feedback Visual**: Modal com progresso em tempo real e logs detalhados.
- **Resiliência**: Tratamento de erros e limpeza automática de dados (ex: emoticons).
- **Importação Seletiva**: Importa apenas novos registros, ignorando redundâncias.

### 🛡️ Sistema de Clãs
Gerenciamento completo de grupos e jogadores:
- **Administração**: Criação e edição de clãs (Nome, Tag, Cor).
- **Associação**: Vínculo de players a clãs com sincronização automática.
- **Rivalidades**: (Em desenvolvimento) Estatísticas focadas em guerras de clãs.

---

## 🛠️ Tecnologias

O projeto utiliza a stack moderna **Better-T-Stack**:

- **Framework**: Next.js 15+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS + shadcn/ui
- **API**: tRPC (End-to-end type safety)
- **Gerenciamento de Estado**: TanStack Query
- **Banco de Dados**: Appwrite / PostgreSQL (Drizzle ORM para Clãs)
- **Monorepo**: Turborepo

---

## 🏁 Começando

### Instalação

```bash
# Clone o repositório e instale as dependências
npm install
```

### Executando o Projeto

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

O sistema estará disponível em `http://localhost:3001` (porta padrão definida para web).

---

## 📍 Rotas Importantes

| Funcionalidade | Rota | Descrição |
|----------------|------|-----------|
| **Dashboard** | `/dashboard` | Visão geral e estatísticas |
| **Importador** | `/import` | Upload e processamento de CSVs |
| **Admin Clãs** | `/admin/clans` | Gerenciamento de clãs |
| **Admin Players**| `/admin/players`| Gerenciamento e sync de players |

---

## 📚 Documentação Adicional

Para detalhes técnicos específicos, consulte os guias no diretório raiz:

- **[COMECE_AQUI.md](./COMECE_AQUI.md)**: Guia rápido da versão v2.1 e correções recentes.
- **[DASHBOARD.md](./DASHBOARD.md)**: Detalhes sobre as métricas e endpoints do dashboard.
- **[SISTEMA_CLANS.md](./SISTEMA_CLANS.md)**: Documentação da arquitetura e uso do sistema de clãs.
- **[RESUMO_EXECUTIVO_V2.md](./RESUMO_EXECUTIVO_V2.md)**: Visão geral das mudanças na refatoração do importador.

---

## 📁 Estrutura do Projeto

```
kills-scum/
├── apps/
│   └── web/            # Frontend (Next.js) e Dashboard
├── packages/
│   ├── api/            # Lógica de Backend (tRPC routers)
│   └── db/             # Schemas de Banco de Dados
├── scripts/            # Scripts de migração e utilitários
└── *.md                # Documentação do projeto
```

---

## 📜 Histórico de Commits

| Data / Hora | Mensagem |
|---|---|
| 21/12/2025 01:30:02 | docs: Revise README.md to provide a detailed overview of the Kills Scum Dashboard project, its features, technologies, and documentation. |
| 28/10/2025 15:25:42 | fix: add environment variables to turbo.json for Vercel build |
| 28/10/2025 15:12:36 | fix: move DATABASE_URL declaration inside getPool function for better scope management |
| 28/10/2025 14:57:19 | fix: lazy initialization do database para suportar build sem DATABASE_URL |
| 28/10/2025 14:37:38 | feat: Add environment configuration files for database and authentication setup |
| 28/10/2025 14:22:49 | fix: corrige conflito de versões do Next.js no monorepo - Move Next.js de dependency para peerDependency no package api - Ajusta createContext para não depender de tipos específicos do Next.js - Resolve erro de build no Vercel com tipos incompatíveis - Build local testado e funcionando corretamente |
| 28/10/2025 14:02:13 | chore: Update CHANGELOG_V2.md for version 2.0.0 release |
| 28/10/2025 13:59:56 | feat: Enhance dashboard with data filtering and new components for improved statistics |
| 25/10/2025 00:20:04 | feat: Add scripts for managing killfeeds and clans in Appwrite |
| 24/10/2025 12:10:28 | initial commit |
