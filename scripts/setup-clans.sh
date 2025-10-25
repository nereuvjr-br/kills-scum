#!/bin/bash

# Script para configurar o sistema de clãs e players

echo "🚀 Configurando Sistema de Clãs e Players..."
echo ""

# 1. Verificar .env
echo "1️⃣ Verificando DATABASE_URL..."
if grep -q "^DATABASE_URL=" apps/web/.env 2>/dev/null; then
    echo "✅ DATABASE_URL encontrada"
else
    echo "❌ DATABASE_URL não encontrada!"
    echo ""
    echo "Por favor, configure o DATABASE_URL no arquivo apps/web/.env"
    echo "Exemplo: DATABASE_URL='postgresql://usuario:senha@localhost:5432/kills_scum'"
    exit 1
fi

echo ""

# 2. Executar migration
echo "2️⃣ Executando migration..."
npx tsx scripts/run-clans-migration.ts

if [ $? -eq 0 ]; then
    echo "✅ Migration executada com sucesso!"
else
    echo "❌ Erro ao executar migration"
    exit 1
fi

echo ""

# 3. Rebuild API
echo "3️⃣ Reconstruindo pacote API..."
npm run build --workspace=packages/api

if [ $? -eq 0 ]; then
    echo "✅ API reconstruída com sucesso!"
else
    echo "❌ Erro ao reconstruir API"
    exit 1
fi

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "Próximos passos:"
echo "1. Reinicie o servidor: npm run dev"
echo "2. Acesse: http://localhost:3001/admin/clans"
echo "3. Acesse: http://localhost:3001/admin/players"
echo ""
