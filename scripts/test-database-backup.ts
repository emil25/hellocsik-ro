import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { INITIAL_SCHEMA_SQL } from "../lib/db/src/local-schema";
import { assertEmptyDestination, DATABASE_BACKUP_SQL, restoreDatabaseRows, validateDatabaseBackup } from "../shared/database-backup.mjs";

const requireDb = createRequire(new URL("../lib/db/package.json", import.meta.url));
const { PGlite } = requireDb("@electric-sql/pglite");
const source = new PGlite();
const destination = new PGlite();
try {
  await source.exec(INITIAL_SCHEMA_SQL);
  await source.query("INSERT INTO organizers (id, slug, name, email, password_hash) VALUES (7, 'teszt', 'Őrzött szervező', 'test@example.invalid', 'opaque-test-hash')");
  await source.query("SELECT setval('organizers_id_seq', 7, true)");
  await source.query(`INSERT INTO events (id, title, description, image_url, start_date, end_date, location, category_id, organizer_id, status, tags, news_links, submitter_email)
    VALUES (79, 'Árvíztűrő tükörfúrógép', 'Többsoros\nleírás', '/events/test.jpg', '2026-10-25 03:30:00', '2026-10-26 20:00:00', 'Csíkszereda', 1, 7, 'pending', ARRAY['ő', 'ű'], ARRAY['{"title":"Facebook","url":"https://example.invalid"}'], 'private@example.invalid')`);
  await source.query("SELECT setval('events_id_seq', 105, true)");
  await source.query("INSERT INTO banners (title, image_url, active) VALUES ('Teszt', '/banner.jpg', false)");
  await source.query("INSERT INTO newsletter_subscriptions (email) VALUES ('subscriber@example.invalid')");
  const backup = validateDatabaseBackup((await source.query(DATABASE_BACKUP_SQL)).rows[0].backup);
  await assertEmptyDestination(destination);
  await destination.exec("BEGIN");
  await destination.exec(INITIAL_SCHEMA_SQL);
  await restoreDatabaseRows(destination, backup);
  await destination.exec("COMMIT");
  const restored = (await destination.query(DATABASE_BACKUP_SQL)).rows[0].backup;
  assert.deepEqual(restored.tables, backup.tables, "Every field, timestamp, relationship and account hash survives the restore.");
  assert.equal(restored.sequences.events.last_value, 105, "Deleted IDs are not reused.");
  assert.equal((await destination.query("SELECT nextval('events_id_seq') AS id")).rows[0].id, 106);
  await assert.rejects(() => assertEmptyDestination(destination), /already contains data/);
  assert.throws(() => validateDatabaseBackup({ ...backup, tables: {} }), /Incomplete/);
  assert.throws(() => validateDatabaseBackup({ ...backup, version: 99 }), /Unsupported/);
  const invalid = structuredClone(backup);
  delete invalid.tables.events[0].title;
  await destination.exec("BEGIN");
  await destination.exec("DELETE FROM events; DELETE FROM organizers; DELETE FROM banners; DELETE FROM newsletter_subscriptions");
  await assert.rejects(() => restoreDatabaseRows(destination, invalid), /Schema mismatch/);
  await destination.exec("ROLLBACK");
  assert.deepEqual((await destination.query(DATABASE_BACKUP_SQL)).rows[0].backup.tables, backup.tables, "A failed restore rolls back all row changes.");
  console.log("Backup round trip passed: all tables, private fields, date values, original IDs, sequence gaps, destination guard and rollback.");
} catch (err) {
  console.error(err instanceof Error ? err.message : "Backup test failed.");
  process.exitCode = 1;
} finally {
  await source.close();
  await destination.close();
}
