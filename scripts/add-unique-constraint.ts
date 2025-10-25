import { Pool } from 'pg';

const DATABASE_URL = "postgresql://admin:cx2n79b3456c2b78394q6b@143.110.140.26:5432/killscum";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false,
});

async function addUniqueConstraint() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adicionando constraint unique em id_discord...');
    
    await client.query(`
      ALTER TABLE killfeeds 
      ADD CONSTRAINT killfeeds_id_discord_unique 
      UNIQUE (id_discord);
    `);
    
    console.log('✅ Constraint unique adicionada com sucesso!');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === '42P07') {
      console.log('⚠️  Constraint já existe');
    } else {
      console.error('❌ Erro ao adicionar constraint:', error);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

addUniqueConstraint();
