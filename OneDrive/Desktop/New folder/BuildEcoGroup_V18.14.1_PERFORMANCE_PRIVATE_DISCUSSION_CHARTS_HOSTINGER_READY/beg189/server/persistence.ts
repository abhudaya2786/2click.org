import { getPool } from '../src/db';
import { store } from './store';
import { env, isDatabaseConfigured } from './env';

const KEY = 'primary';
let pending: NodeJS.Timeout | null = null;
let inFlight: Promise<void> = Promise.resolve();

export async function ensurePersistenceTable(): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS app_runtime_state (state_key TEXT PRIMARY KEY, payload JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
}

export async function restoreRuntimeState(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  const pool = getPool();
  if (!pool) return false;
  await ensurePersistenceTable();
  const result = await pool.query('SELECT payload FROM app_runtime_state WHERE state_key = $1 LIMIT 1', [KEY]);
  if (!result.rows[0]?.payload) return false;
  store.importRuntimeState(result.rows[0].payload);
  return true;
}

export async function persistRuntimeState(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const pool = getPool();
  if (!pool) return;
  await ensurePersistenceTable();
  const payload = store.exportRuntimeState();
  await pool.query(
    `INSERT INTO app_runtime_state (state_key, payload, updated_at) VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (state_key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [KEY, JSON.stringify(payload)],
  );
}

export function schedulePersist(): void {
  if (!isDatabaseConfigured()) return;
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    inFlight = inFlight.then(() => persistRuntimeState()).catch(err => console.error('[BuildEcoGroup] Persistence error:', err?.message || err));
  }, 250);
}

export async function flushPersistence(): Promise<void> {
  if (pending) { clearTimeout(pending); pending = null; }
  await inFlight;
  await persistRuntimeState();
}

export function persistenceMode(): 'postgresql' | 'memory' | 'invalid' {
  return isDatabaseConfigured() ? 'postgresql' : (env.NODE_ENV === 'production' ? 'invalid' : 'memory');
}
