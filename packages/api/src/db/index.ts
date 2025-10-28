import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Durante o build, não inicializa o pool de conexões
// Apenas em runtime (quando realmente for fazer queries)
let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getPool(): Pool {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL não está configurada nas variáveis de ambiente');
  }
  
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: false, // Altere para true se precisar de SSL
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  
  return pool;
}

function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance;
}

// Export como getter para lazy initialization
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  }
});

// Helper para testar conexão
export async function testConnection() {
  try {
    const poolInstance = getPool();
    const client = await poolInstance.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { success: true, time: result.rows[0] };
  } catch (error) {
    return { success: false, error };
  }
}
