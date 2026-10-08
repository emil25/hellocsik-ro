export const BACKUP_TABLES = [
  "categories", "organizers", "events", "banners", "newsletter_subscriptions",
];

// One statement gives every table the same PostgreSQL snapshot. row_to_json
// preserves timestamp-without-time-zone values and text arrays for restoration.
export const DATABASE_BACKUP_SQL = `SELECT json_build_object(
  'format', 'hellocsik-database-backup',
  'version', 1,
  'createdAt', now(),
  'databaseBytes', pg_database_size(current_database()),
  'tables', json_build_object(${BACKUP_TABLES.map(table => `
    '${table}', COALESCE((SELECT json_agg(row_to_json(r) ORDER BY r.id) FROM public."${table}" r), '[]'::json)
  `).join(",")}),
  'sequences', json_build_object(${BACKUP_TABLES.map(table => `
    '${table}', (SELECT json_build_object('last_value', last_value, 'is_called', is_called) FROM public."${table}_id_seq")
  `).join(",")})
) AS backup`;

export function validateDatabaseBackup(backup) {
  if (backup?.format !== "hellocsik-database-backup" || backup.version !== 1) {
    throw new Error("Unsupported database backup format.");
  }
  for (const table of BACKUP_TABLES) {
    const rows = backup.tables?.[table];
    const sequence = backup.sequences?.[table];
    if (!Array.isArray(rows) || !sequence || !Number.isSafeInteger(Number(sequence.last_value))
      || Number(sequence.last_value) < 1 || typeof sequence.is_called !== "boolean") {
      throw new Error(`Incomplete backup: ${table}.`);
    }
    const ids = new Set();
    for (const row of rows) {
      if (!row || !Number.isSafeInteger(row.id) || row.id < 1 || ids.has(row.id)) {
        throw new Error(`Invalid or duplicate row identifier: ${table}.`);
      }
      ids.add(row.id);
    }
    if (rows.some(row => row.id > Number(sequence.last_value))) {
      throw new Error(`Invalid sequence: ${table}.`);
    }
  }
  return backup;
}

// This deliberately refuses any non-empty destination, rather than merging or
// overwriting an existing database. The caller owns the surrounding transaction.
export async function assertEmptyDestination(client) {
  for (const table of BACKUP_TABLES) {
    const exists = await client.query("SELECT to_regclass($1) AS name", [`public.${table}`]);
    if (!exists.rows[0]?.name) continue;
    const result = await client.query(`SELECT count(*)::int AS count FROM public."${table}"`);
    if (result.rows[0].count !== 0) {
      throw new Error(`Destination already contains data in ${table}; nothing was overwritten.`);
    }
  }
}

export async function restoreDatabaseRows(client, backup) {
  validateDatabaseBackup(backup);
  // Bootstrap inserts default categories. The destination was checked empty
  // before bootstrap, so only those new defaults are removed here.
  await client.query("DELETE FROM public.categories");
  for (const table of BACKUP_TABLES) {
    const rows = backup.tables[table];
    const columns = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
      [table],
    );
    const names = columns.rows.map(row => row.column_name);
    if (rows.some(row => names.some(name => !(name in row)) || Object.keys(row).some(name => !names.includes(name)))) {
      throw new Error(`Schema mismatch for ${table}; restore rolled back.`);
    }
    if (rows.length) {
      await client.query(`INSERT INTO public."${table}" SELECT * FROM json_populate_recordset(NULL::public."${table}", $1::json)`, [JSON.stringify(rows)]);
    }
    const sequence = backup.sequences[table];
    await client.query("SELECT setval(pg_get_serial_sequence($1, 'id'), $2, $3)", [
      `public.${table}`, sequence.last_value, sequence.is_called,
    ]);
    const result = await client.query(`SELECT count(*)::int AS count FROM public."${table}"`);
    if (result.rows[0].count !== rows.length) throw new Error(`Row count mismatch for ${table}.`);
  }
}
