import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não está configurada nas variáveis de ambiente');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false, // Altere para true se precisar de SSL
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

// Helper para testar conexão
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { success: true, time: result.rows[0] };
  } catch (error) {
    return { success: false, error };
  }
}
