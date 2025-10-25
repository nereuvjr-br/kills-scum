/**
 * Script para verificar idDiscords já existentes na tabela do Appwrite
 * 
 * Uso: npx ts-node scripts/verify-appwrite-ids.ts
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env da pasta apps/web
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../apps/web/.env') });

async function verifyAppwriteIds() {
  try {
    console.log('\n🔍 === VERIFICANDO idDiscords NO APPWRITE ===\n');

    const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const API_KEY = process.env.NEXT_PUBLIC_APPWRITE_TOKEN;
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_KILLS;
    const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_KILLFEEDS;

    if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID || !COLLECTION_ID) {
      console.error('❌ Faltam variáveis de ambiente!');
      console.error('   NEXT_PUBLIC_APPWRITE_ENDPOINT:', ENDPOINT);
      console.error('   NEXT_PUBLIC_APPWRITE_PROJECT_ID:', PROJECT_ID);
      console.error('   NEXT_PUBLIC_APPWRITE_TOKEN:', API_KEY ? '✓' : '✗');
      console.error('   NEXT_PUBLIC_APPWRITE_DATABASE_KILLS:', DATABASE_ID);
      console.error('   NEXT_PUBLIC_APPWRITE_COLLECTION_KILLFEEDS:', COLLECTION_ID);
      return;
    }

    console.log(`📊 Database: ${DATABASE_ID}`);
    console.log(`📋 Collection: ${COLLECTION_ID}`);
    console.log(`🌐 Endpoint: ${ENDPOINT}\n`);

    let allIds: number[] = [];
    let offset = 0;
    let pageCount = 0;
    const pageSize = 25;

    console.log('📥 Buscando documentos do Appwrite...\n');

    while (true) {
      pageCount++;
      console.log(`   Página ${pageCount} (offset: ${offset})...`);

      try {
        const response = await fetch(
          `${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents?limit=${pageSize}&offset=${offset}`,
          {
            headers: {
              'X-Appwrite-Project': PROJECT_ID,
              'X-Appwrite-Key': API_KEY,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error(`   ❌ Erro na requisição: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.error(`   Resposta: ${errorText}`);
          break;
        }

        const data = (await response.json()) as {
          documents: Array<{ idDiscord?: number }>;
        };

        if (!data.documents || data.documents.length === 0) {
          console.log(`   ✓ Nenhum documento nesta página`);
          break;
        }

        // Extrair idDiscord de cada documento
        data.documents.forEach((doc: any) => {
          if (doc.idDiscord !== null && doc.idDiscord !== undefined) {
            allIds.push(parseInt(doc.idDiscord, 10));
          }
        });

        console.log(`   ✓ ${data.documents.length} documentos processados`);

        if (data.documents.length < pageSize) {
          break;
        }

        offset += pageSize;
      } catch (error) {
        console.error(`   ❌ Erro ao buscar página ${pageCount}:`, error);
        break;
      }
    }

    console.log(`\n📊 === RESUMO ===\n`);
    console.log(`✅ Total de documentos: ${allIds.length}`);
    console.log(`📄 Total de páginas processadas: ${pageCount}`);

    // Verificar duplicatas nos registros do Appwrite
    const uniqueIds = new Set(allIds);
    const duplicatesInDb = allIds.length - uniqueIds.size;

    if (duplicatesInDb > 0) {
      console.log(`\n⚠️  DUPLICATAS ENCONTRADAS NO APPWRITE: ${duplicatesInDb}`);

      const duplicateMap = new Map<number, number>();
      allIds.forEach((id) => {
        duplicateMap.set(id, (duplicateMap.get(id) || 0) + 1);
      });

      console.log('\n🔴 IDs duplicados:');
      duplicateMap.forEach((count, id) => {
        if (count > 1) {
          console.log(`   - ${id}: ${count} vezes`);
        }
      });
    } else {
      console.log(`\n✅ Nenhuma duplicata encontrada no Appwrite`);
    }

    // Exibir alguns exemplos
    if (allIds.length > 0) {
      console.log(`\n📋 Primeiros 10 idDiscords no Appwrite:`);
      const sortedIds = Array.from(uniqueIds).sort((a, b) => a - b);
      sortedIds.slice(0, 10).forEach((id, idx) => {
        console.log(`   ${idx + 1}. ${id}`);
      });

      if (allIds.length > 10) {
        console.log(`   ... e mais ${allIds.length - 10}`);
      }
    } else {
      console.log(`\n📭 Nenhum documento encontrado no Appwrite`);
    }

    console.log(`\n✨ === VERIFICAÇÃO CONCLUÍDA ===\n`);

    return {
      totalDocuments: allIds.length,
      uniqueIds: uniqueIds.size,
      duplicates: duplicatesInDb,
      allIds: Array.from(uniqueIds).sort((a, b) => a - b),
    };
  } catch (error) {
    console.error('❌ Erro ao verificar Appwrite:', error);
    throw error;
  }
}

// Executar
verifyAppwriteIds().catch(console.error);
