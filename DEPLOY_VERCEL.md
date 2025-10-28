# Guia de Deploy no Vercel

## ⚠️ Variáveis de Ambiente Necessárias

Para fazer o deploy no Vercel, você **DEVE** configurar as seguintes variáveis de ambiente:

### 1. DATABASE_URL (OBRIGATÓRIO)

A conexão com o banco de dados PostgreSQL:

```
DATABASE_URL=postgresql://usuario:senha@host:porta/nome_do_banco
```

**Exemplo com Supabase:**
```
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:senha@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Exemplo com Neon:**
```
DATABASE_URL=postgresql://usuario:senha@ep-xxx.us-east-2.aws.neon.tech/kills_scum?sslmode=require
```

### 2. Variáveis de Autenticação (se aplicável)

```
BETTER_AUTH_SECRET=sua-chave-secreta-aleatoria
BETTER_AUTH_URL=https://seu-dominio.vercel.app
CORS_ORIGIN=https://seu-dominio.vercel.app
```

## 📝 Como Configurar no Vercel

### Opção 1: Via Dashboard do Vercel

1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável:
   - **Key**: `DATABASE_URL`
   - **Value**: sua connection string do PostgreSQL
   - **Environment**: Selecione `Production`, `Preview` e `Development`
4. Clique em **Save**
5. Faça um novo deploy ou redeploy

### Opção 2: Via Vercel CLI

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Login
vercel login

# Adicionar variável de ambiente
vercel env add DATABASE_URL production

# Você será solicitado a inserir o valor
# Cole sua connection string do PostgreSQL

# Redeploy
vercel --prod
```

## 🗄️ Opções de Banco de Dados PostgreSQL

### Supabase (Recomendado - Grátis)
1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **Project Settings** → **Database**
4. Copie a **Connection String** em modo **Connection pooling**
5. Use essa string como `DATABASE_URL`

### Neon (Alternativa - Grátis)
1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string
4. Use essa string como `DATABASE_URL`

### Vercel Postgres
1. No dashboard do Vercel, vá em **Storage**
2. Crie um novo **Postgres Database**
3. O Vercel automaticamente adicionará `DATABASE_URL` às variáveis de ambiente

## 🔄 Após Configurar

1. Execute as migrations do banco de dados:

```bash
# Se estiver usando Drizzle
npm run db:push

# Ou execute os scripts SQL manualmente
# Os arquivos estão em packages/api/drizzle/
```

2. Verifique se o deploy foi bem-sucedido no Vercel

3. Teste a aplicação acessando a URL do Vercel

## ⚡ Troubleshooting

### Erro: "DATABASE_URL não está configurada"
- ✅ Verifique se a variável foi adicionada no Vercel
- ✅ Certifique-se de que está selecionada para o ambiente correto
- ✅ Faça um redeploy após adicionar a variável

### Erro de conexão com o banco
- ✅ Verifique se a connection string está correta
- ✅ Certifique-se de que o banco permite conexões externas
- ✅ Se usando Supabase, use **Connection pooling** (porta 5432)
- ✅ Verifique se há `?sslmode=require` no final da URL se necessário

### Build passa mas runtime falha
- ✅ As variáveis precisam estar configuradas para **Production**
- ✅ Faça um novo deploy (não redeploy) após adicionar variáveis

## 📚 Mais Informações

- [Documentação Vercel - Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Supabase - Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Neon - Connection Strings](https://neon.tech/docs/connect/connect-from-any-app)
