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
|-------------|----------|
| 28/10/2025 15:25 | fix: Initial commit clans in Appwrite |
| 28/10/2025 14:22 | fix |
| 25/10/2025 00:20 | feat: Add |
| 24/10/2025 12:10 | initial commit-appwrite-qu |
