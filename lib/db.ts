// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pool: any = null;

export function getPool() {
  if (typeof window !== 'undefined') return null;

  if (pool) return pool;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  try {
    // Dynamic require to avoid webpack bundling for client
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('pg');
    pool = new Pool({ connectionString: databaseUrl });
    return pool;
  } catch {
    return null;
  }
}
