import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { drizzle as drizzleLocal } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { INITIAL_SCHEMA_SQL, initializeLocalDatabase } from "./local-schema";

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
const localClient = pool ? null : new PGlite(process.env.PGLITE_DATA_DIR!);
if (localClient) await initializeLocalDatabase(localClient);
// Netlify uses the already migrated database; cold starts must not run schema DDL.
if (pool && process.env.NETLIFY !== "true") await pool.query(INITIAL_SCHEMA_SQL);
export const db = pool ? drizzle(pool, { schema }) : drizzleLocal(localClient!, { schema });

export * from "./schema";
