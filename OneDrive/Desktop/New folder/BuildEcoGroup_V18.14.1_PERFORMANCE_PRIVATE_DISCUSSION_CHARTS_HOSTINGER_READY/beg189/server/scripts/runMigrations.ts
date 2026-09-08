import fs from 'fs';
import path from 'path';
import { getPool } from '../../src/db';
import { env } from '../env';

async function main() {
  const pool = getPool();
  if (!pool) throw new Error('Database is not configured. Set DATABASE_URL before running migrations.');
  const dir = path.join(process.cwd(), 'src', 'db', 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await pool.query(sql);
    console.log(`Applied ${file}`);
  }
  console.log(`Migrations complete for ${env.NODE_ENV}.`);
  await pool.end();
}
main().catch(err => { console.error(err); process.exit(1); });
