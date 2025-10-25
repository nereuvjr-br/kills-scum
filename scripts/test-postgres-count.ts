import { Pool } from 'pg';

const DATABASE_URL = "postgresql://admin:cx2n79b3456c2b78394q6b@143.110.140.26:5432/killscum";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false,
});

async function testCount() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Verificando total de registros...\n');
    
    // Total de registros
    const totalResult = await client.query('SELECT COUNT(*) as total FROM killfeeds');
    console.log('📊 Total de killfeeds:', totalResult.rows[0].total);
    
    // Últimos 5 registros
    console.log('\n📝 Últimos 5 registros:');
    const recentResult = await client.query(
      'SELECT id, killer, victim, weapon, timestamp FROM killfeeds ORDER BY timestamp DESC LIMIT 5'
    );
    console.table(recentResult.rows);
    
    // Primeiros 5 registros
    console.log('\n📝 Primeiros 5 registros:');
    const firstResult = await client.query(
      'SELECT id, killer, victim, weapon, timestamp FROM killfeeds ORDER BY timestamp ASC LIMIT 5'
    );
    console.table(firstResult.rows);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testCount();
