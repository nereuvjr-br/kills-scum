/**
 * Script rápido para contar idDiscords existentes no Appwrite
 * 
 * Uso: npx ts-node scripts/verify-appwrite-quick.ts
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../apps/web/.env') });

async function verifyAppwriteIdsQuick() {
  try {
    console.log('\n🔍 === CONTANDO idDiscords NO APPWRITE (MODO RÁPIDO) ===\n');

    const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const API_KEY = process.env.NEXT_PUBLIC_APPWRITE_TOKEN;
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_KILLS;
    const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_KILLFEEDS;

    if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID || !COLLECTION_ID) {
      console.error('❌ Faltam variáveis de ambiente!');
      return;
    }

    console.log(`📊 Database: ${DATABASE_ID}`);
    console.log(`📋 Collection: ${COLLECTION_ID}\n`);

    // Buscar primeira página para ver o count total
    console.log('📥 Buscando informações do Appwrite...\n');

    const response = await fetch(
      `${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents?limit=1&offset=0`,
      {
        headers: {
          'X-Appwrite-Project': PROJECT_ID,
          'X-Appwrite-Key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`❌ Erro na requisição: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`   Resposta: ${errorText}`);
      return;
    }

    const data = (await response.json()) as {
      total: number;
      documents: Array<{ idDiscord?: number }>;
    };

    console.log(`📊 === RESULTADO ===\n`);
    console.log(`✅ Total de documentos na coleção: ${data.total}`);

    console.log(`\n✨ === VERIFICAÇÃO CONCLUÍDA ===\n`);

    return data.total;
  } catch (error) {
    console.error('❌ Erro ao verificar Appwrite:', error);
    throw error;
  }
}

// Executar
verifyAppwriteIdsQuick().catch(console.error);
