import { db } from '../packages/api/src/db';
import { killfeeds } from '../packages/api/src/db/schema';
import { desc } from 'drizzle-orm';

async function testDrizzleQuery() {
  try {
    console.log('🔄 Testando query do Drizzle...\n');
    
    const allDocuments = await db
      .select()
      .from(killfeeds)
      .orderBy(desc(killfeeds.timestamp));
    
    console.log('📊 Total de registros retornados:', allDocuments.length);
    console.log('\n📝 Primeiros 3:');
    console.table(allDocuments.slice(0, 3).map(d => ({
      id: d.id,
      killer: d.killer,
      victim: d.victim,
      timestamp: d.timestamp
    })));
    
    console.log('\n📝 Últimos 3:');
    console.table(allDocuments.slice(-3).map(d => ({
      id: d.id,
      killer: d.killer,
      victim: d.victim,
      timestamp: d.timestamp
    })));
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
  
  process.exit(0);
}

testDrizzleQuery();
