import { Pool } from 'pg';

const DATABASE_URL = "postgresql://admin:cx2n79b3456c2b78394q6b@143.110.140.26:5432/killscum";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false,
});

async function createTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Conectando ao PostgreSQL...');
    
    // Teste de conexão
    const testResult = await client.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida:', testResult.rows[0]);
    
    // Criar tabela killfeeds
    console.log('\n🔄 Criando tabela killfeeds...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS killfeeds (
        id SERIAL PRIMARY KEY,
        killer VARCHAR(255) NOT NULL,
        victim VARCHAR(255) NOT NULL,
        distance VARCHAR(50) NOT NULL,
        weapon VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        id_discord VARCHAR(255),
        clan VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Tabela killfeeds criada com sucesso!');
    
    // Criar índices para melhor performance
    console.log('\n🔄 Criando índices...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_killfeeds_timestamp ON killfeeds(timestamp DESC);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_killfeeds_killer ON killfeeds(killer);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_killfeeds_victim ON killfeeds(victim);
    `);
    console.log('✅ Índices criados com sucesso!');
    
    // Verificar estrutura
    console.log('\n📊 Estrutura da tabela:');
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'killfeeds'
      ORDER BY ordinal_position;
    `);
    console.table(structure.rows);
    
    console.log('\n🎉 Migration concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migration:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTable();
