import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar .env do apps/web
config({ path: resolve(process.cwd(), 'apps/web/.env') });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_APPWRITE_TOKEN;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_KILLS;
const COLLECTION_ID = 'killfeeds';

async function testDashboardQuery() {
  console.log('🔍 Testando query do dashboard...\n');

  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - 72);
  const cutoffISO = cutoffTime.toISOString();

  console.log(`📅 Data de corte (72h atrás): ${cutoffISO}`);
  console.log(`📅 Data atual: ${new Date().toISOString()}\n`);

  // Primeiro, vamos buscar sem filtros para ver a estrutura
  console.log('📊 Testando busca SEM filtros primeiro...\n');
  
  let url = new URL(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`);
  url.searchParams.set('limit', '5');
  
  let response = await fetch(url.toString(), {
    headers: {
      'X-Appwrite-Project': PROJECT_ID!,
      'X-Appwrite-Key': API_KEY!,
      'Content-Type': 'application/json',
    },
  });

  let data: any = await response.json();
  console.log(`Total de documentos na coleção: ${data.total}`);
  if (data.documents && data.documents.length > 0) {
    console.log('Exemplo de documento:');
    console.log(JSON.stringify(data.documents[0], null, 2));
  }

  console.log('\n📊 Agora testando com filtro de 72 horas...\n');

  const PAGE_LIMIT = 500;
  let totalDocuments = 0;
  let offset = 0;
  let pageNum = 1;

  while (true) {
    const url = new URL(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`);
    url.searchParams.set('limit', PAGE_LIMIT.toString());
    url.searchParams.set('offset', offset.toString());
    
    // Sem queries, vamos buscar tudo ordenado
    // url.searchParams.append('queries[]', 'orderDesc($createdAt)');

    console.log(`📄 Buscando página ${pageNum}...`);

    const response = await fetch(url.toString(), {
      headers: {
        'X-Appwrite-Project': PROJECT_ID!,
        'X-Appwrite-Key': API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro: ${response.status} - ${errorText}`);
      break;
    }

    const data = await response.json();
    const docs = data.documents ?? [];

    console.log(`   ✅ Página ${pageNum}: ${docs.length} documentos`);

    if (docs.length > 0) {
      const first = docs[0];
      const last = docs[docs.length - 1];
      console.log(`   📌 Primeiro timestamp: ${first.timestamp}`);
      console.log(`   📌 Último timestamp: ${last.timestamp}`);
    }

    totalDocuments += docs.length;
    
    if (docs.length < PAGE_LIMIT) {
      break;
    }

    offset += PAGE_LIMIT;
    pageNum++;
  }

  console.log(`\n🎯 Total de documentos nas últimas 72h: ${totalDocuments}`);
}

testDashboardQuery().catch(console.error);
