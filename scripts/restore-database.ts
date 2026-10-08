import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { INITIAL_SCHEMA_SQL } from "../lib/db/src/local-schema";
import { assertEmptyDestination, restoreDatabaseRows, validateDatabaseBackup } from "../shared/database-backup.mjs";

const input = process.argv[2];
if (!input || !process.env.RESTORE_DATABASE_URL) {
  console.error("Usage: RESTORE_DATABASE_URL=<new empty database> pnpm --filter @workspace/scripts exec tsx ./restore-database.ts <backup.json>");
  process.exit(1);
}

const requireDb = createRequire(new URL("../lib/db/package.json", import.meta.url));
const { Client } = requireDb("pg");
const client = new Client({ connectionString: process.env.RESTORE_DATABASE_URL, connectionTimeoutMillis: 15_000 });
let connected = false;
let inTransaction = false;
try {
  const backup = validateDatabaseBackup(JSON.parse(await readFile(input, "utf8")));
  await client.connect();
  connected = true;
  await client.query("BEGIN");
  inTransaction = true;
  await assertEmptyDestination(client);
  await client.query(INITIAL_SCHEMA_SQL);
  await restoreDatabaseRows(client, backup);
  await client.query("COMMIT");
  inTransaction = false;
  console.log("Database restored; existing event IDs and organizer accounts were preserved.");
  console.log(JSON.stringify(Object.fromEntries(Object.entries(backup.tables).map(([table, rows]) => [table, rows.length]))));
} catch {
  if (inTransaction) await client.query("ROLLBACK").catch(() => {});
  // Do not print the driver error: it may contain a connection string or row data.
  console.error("Restore failed. No row changes were committed. Check the backup and use a new empty destination database.");
  process.exitCode = 1;
} finally {
  if (connected) await client.end().catch(() => {});
}
