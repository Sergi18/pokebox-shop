import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Si la URL contiene pgbouncer=true, pg driver a veces da problemas. 
// Para el pooler de Supabase en puerto 6543, solemos necesitar SSL.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
