import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { INITIAL_SCHEMA_SQL, NETLIFY_REPORTS_SCHEMA_SQL, initializeLocalDatabase } from "./local-schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL && !process.env.PGLITE_DATA_DIR) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.NETLIFY === "true" ? { max: 3, allowExitOnIdle: true, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 10_000 } : {}),
}) : null;
async function createLocalDatabase() {
  // Cloud deployments use PostgreSQL and must not load the local WASM database.
  const [{ PGlite }, { drizzle: drizzleLocal }] = await Promise.all([
    import("@electric-sql/pglite"), import("drizzle-orm/pglite"),
  ]);
  const localClient = new PGlite(process.env.PGLITE_DATA_DIR!);
  await initializeLocalDatabase(localClient);
  return drizzleLocal(localClient, { schema });
}
// Netlify skips the full bootstrap but applies this small idempotent migration.
if (pool && process.env.NETLIFY === "true") await pool.query(NETLIFY_REPORTS_SCHEMA_SQL);
else if (pool) await pool.query(INITIAL_SCHEMA_SQL);
export const db = pool ? drizzle(pool, { schema }) : await createLocalDatabase();

export * from "./schema";
