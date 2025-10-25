/**
 * Script agressivo para apagar TODOS os killfeeds - força deleção até limpar tudo
 * Uso: npx tsx scripts/delete-all-killfeeds-aggressive.ts
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
    console.log('🔍 Iniciando exclusão TOTAL de todos os killfeeds...\n');

    let totalDeleted = 0;
    let batchNumber = 1;
    let keepDeleting = true;

    while (keepDeleting) {
      console.log(`\n📦 Lote ${batchNumber}:`);

      let batchDeleted = 0;
      let offset = 0;
      const limit = 100;

      while (true) {
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
          console.log(`  ✅ Nenhum documento encontrado neste lote`);
          break;
        }

        console.log(`  📄 Encontrados ${documents.length} registros (offset: ${offset})`);

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
              console.warn(`  ⚠️  Erro ao apagar ${doc.$id}: ${deleteResponse.status}`);
            } else {
              totalDeleted++;
              batchDeleted++;
              process.stdout.write(
                `\r  ✅ Apagados neste lote: ${batchDeleted} | Total: ${totalDeleted}`
              );
            }
          } catch (error) {
            console.warn(`  ⚠️  Erro ao apagar documento: ${error}`);
          }
        }

        // Se menos de 100 registros foram retornados, chegamos ao fim deste lote
        if (documents.length < limit) {
          console.log(`\n  ✨ Lote ${batchNumber} concluído!`);
          break;
        }

        offset += limit;
      }

      batchNumber++;

      // Verificar se ainda há registros
      const finalCheckResponse = await fetch(
        `${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents?limit=1`,
        {
          method: 'GET',
          headers: {
            'X-Appwrite-Project': PROJECT_ID!,
            'X-Appwrite-Key': API_KEY!,
            'Content-Type': 'application/json',
          },
        }
      );

      const finalCheckData = (await finalCheckResponse.json()) as any;
      if (finalCheckData.documents.length === 0) {
        keepDeleting = false;
      } else {
        console.log(
          `\n⏳ Ainda há ${finalCheckData.total || 'mais'} registros. Continuando...\n`
        );
      }
    }

    console.log(`\n\n✨ ╔════════════════════════════════════════╗`);
    console.log(`   ║     PROCESSO CONCLUÍDO COM SUCESSO!      ║`);
    console.log(`   ╚════════════════════════════════════════╝`);
    console.log(`\n📊 Total de registros apagados: ${totalDeleted}`);
    console.log(`✅ A coleção killfeeds está completamente vazia!`);
    console.log(`🚀 Você pode agora importar os novos registros.\n`);
  } catch (error) {
    console.error('❌ Erro durante o processo de exclusão:', error);
    process.exit(1);
  }
}

// Executar
deleteAllKillfeeds();
