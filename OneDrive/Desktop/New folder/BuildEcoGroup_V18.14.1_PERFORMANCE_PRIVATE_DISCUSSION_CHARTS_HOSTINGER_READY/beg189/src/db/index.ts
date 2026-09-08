import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import { env, isDatabaseConfigured } from '../../server/env';

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

export function getPool(): pg.Pool | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!poolInstance) {
    if (env.DATABASE_URL) {
      poolInstance = new Pool({
        connectionString: env.DATABASE_URL,
        ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    } else if (env.PGHOST) {
      poolInstance = new Pool({
        host: env.PGHOST,
        port: env.PGPORT || 5432,
        user: env.PGUSER,
        password: env.PGPASSWORD,
        database: env.PGDATABASE,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }
  }

  return poolInstance;
}

export function getDb(): NodePgDatabase<typeof schema> | null {
  if (dbInstance) {
    return dbInstance;
  }

  const pool = getPool();
  if (pool) {
    dbInstance = drizzle(pool, { schema });
    return dbInstance;
  }

  return null;
}

export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  configured: boolean;
  message: string;
  latencyMs?: number;
  tables?: string[];
  version?: string;
}> {
  if (!isDatabaseConfigured()) {
    return {
      connected: false,
      configured: false,
      message: 'DATABASE_URL environment variable is not configured. Utilizing in-memory event-sourced store fallback.',
    };
  }

  const pool = getPool();
  if (!pool) {
    return {
      connected: false,
      configured: true,
      message: 'Failed to initialize PostgreSQL connection pool.',
    };
  }

  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      const versionRes = await client.query('SELECT version()');
      const latencyMs = Date.now() - start;

      const tablesRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      
      const tables = tablesRes.rows.map((r: any) => r.table_name);

      return {
        connected: true,
        configured: true,
        message: 'PostgreSQL connection verified via Drizzle ORM driver.',
        latencyMs,
        version: versionRes.rows[0]?.version?.split(' ')[0] + ' ' + (versionRes.rows[0]?.version?.split(' ')[1] || ''),
        tables,
      };
    } finally {
      client.release();
    }
  } catch (error: any) {
    return {
      connected: false,
      configured: true,
      message: `PostgreSQL connection error: ${error.message}`,
      latencyMs: Date.now() - start,
    };
  }
}

export { schema };
