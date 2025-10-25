import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), 'apps/web/.env') });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.NEXT_PUBLIC_APPWRITE_TOKEN!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_KILLS!;
const COLLECTION_ID = 'killfeeds';

async function testDashboard() {
  console.log('🎯 Testando lógica final do dashboard\n');

  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - 72);
  
  console.log(`📅 Buscando documentos das últimas 72h`);
  console.log(`   Corte: ${cutoffTime.toISOString()}\n`);

  const PAGE_LIMIT = 25; // Limite máximo permitido pelo Appwrite
  let allDocuments: any[] = [];
  let offset = 0;
  let pageNum = 1;

  console.log('🔄 Buscando todas as páginas (limite 25 por página)...\n');

  // Limitar a 60 páginas (1500 documentos) para teste
  while (pageNum <= 60) {
    const url = new URL(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`);
    url.searchParams.set('limit', PAGE_LIMIT.toString());
    url.searchParams.set('offset', offset.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${await response.text()}`);
    }

    const data: any = await response.json();
    const docs = data.documents ?? [];

    if (pageNum % 10 === 0 || pageNum === 1) {
      console.log(`📄 Página ${pageNum}: ${docs.length} docs (total acumulado: ${allDocuments.length + docs.length}/${data.total})`);
    }

    if (docs.length === 0) break;

    allDocuments.push(...docs);
    offset += PAGE_LIMIT;
    pageNum++;

    if (docs.length < PAGE_LIMIT) break;
  }

  console.log(`\n✅ Total de documentos no banco: ${allDocuments.length}`);

  // Filtrar últimas 72h
  const recentDocuments = allDocuments.filter((doc) => {
    const docDate = new Date(doc.timestamp);
    return docDate >= cutoffTime && !isNaN(docDate.getTime());
  });

  console.log(`✅ Documentos nas últimas 72h: ${recentDocuments.length}\n`);

  if (recentDocuments.length > 0) {
    const sorted = recentDocuments.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    console.log('📊 Amostra de dados (5 mais recentes):');
    sorted.slice(0, 5).forEach((doc, i) => {
      console.log(`${i + 1}. ${doc.killer} matou ${doc.victim} - ${doc.timestamp}`);
    });

    // Estatísticas
    const killers = new Set(recentDocuments.map(d => d.killer));
    const victims = new Set(recentDocuments.map(d => d.victim));
    const weapons = new Set(recentDocuments.map(d => d.weapon));

    console.log(`\n📈 Estatísticas das últimas 72h:`);
    console.log(`   🎯 Total de kills: ${recentDocuments.length}`);
    console.log(`   👤 Matadores únicos: ${killers.size}`);
    console.log(`   💀 Vítimas únicas: ${victims.size}`);
    console.log(`   🔫 Armas diferentes: ${weapons.size}`);
  }
}

testDashboard().catch(console.error);
