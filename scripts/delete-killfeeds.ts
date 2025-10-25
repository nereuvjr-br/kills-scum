/**
 * Script para apagar todos os registros de killfeeds do Appwrite
 * Uso: npx tsx scripts/delete-killfeeds.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../apps/web/.env') });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_APPWRITE_TOKEN;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_KILLS;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_KILLFEEDS;

if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID || !COLLECTION_ID) {
  console.error('❌ Variáveis de ambiente não configuradas corretamente');
  console.error('Verifique o arquivo .env em apps/web/');
  process.exit(1);
}

async function deleteAllKillfeeds(): Promise<void> {
  try {
    console.log('🔍 Buscando todos os killfeeds...\n');

    let totalDeleted = 0;
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      // Buscar documentos
      const listResponse = await fetch(
        `${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: {
            'X-Appwrite-Project': PROJECT_ID!,
            'X-Appwrite-Key': API_KEY!,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!listResponse.ok) {
        throw new Error(
          `Erro ao buscar documentos: ${listResponse.status} - ${await listResponse.text()}`
        );
      }

      const data = (await listResponse.json()) as any;
      const documents = data.documents || [];

      if (documents.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`📄 Encontrados ${documents.length} registros (offset: ${offset})`);

      // Apagar cada documento
      for (const doc of documents) {
        try {
          const deleteResponse = await fetch(
            `${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents/${doc.$id}`,
            {
              method: 'DELETE',
              headers: {
                'X-Appwrite-Project': PROJECT_ID!,
                'X-Appwrite-Key': API_KEY!,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!deleteResponse.ok) {
            console.warn(`⚠️  Erro ao apagar ${doc.$id}: ${deleteResponse.status}`);
          } else {
            totalDeleted++;
            process.stdout.write(`\r✅ Apagados: ${totalDeleted} registros`);
          }
        } catch (error) {
          console.warn(`⚠️  Erro ao apagar documento: ${error}`);
        }
      }

      // Se menos de 100 registros foram retornados, chegamos ao fim
      if (documents.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    console.log(`\n\n✨ Processo concluído!\n`);
    console.log(`📊 Total de registros apagados: ${totalDeleted}`);
    console.log(`\n✅ Todos os killfeeds foram apagados com sucesso!`);
    console.log(`🚀 Você pode agora importar os novos registros.\n`);
  } catch (error) {
    console.error('❌ Erro durante o processo de exclusão:', error);
    process.exit(1);
  }
}

// Executar
deleteAllKillfeeds();
