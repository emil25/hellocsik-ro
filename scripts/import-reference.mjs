import { createRequire } from "node:module";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(path.join(root, "lib/db/package.json"));
const { PGlite } = require("@electric-sql/pglite");
let running = false;
try { running = (await fetch("http://127.0.0.1:8080/api/health", { signal: AbortSignal.timeout(1000) })).ok; } catch {}
if (running) throw new Error("Állítsd le a helyi szervert importálás előtt.");
process.env.TZ = "Europe/Bucharest";
const events = JSON.parse(await readFile(path.join(root, ".local/replit-public-events.json"), "utf8"));
const client = new PGlite(path.join(root, ".local/pgdata"));
const backupDir = path.join(root, ".local/backups");
await mkdir(backupDir, { recursive: true });
await writeFile(path.join(backupDir, `before-reference-${Date.now()}.tar.gz`), Buffer.from(await (await client.dumpDataDir()).arrayBuffer()));
// The legacy reference encoded Romanian wall-clock values with a misleading Z.
// Convert those values to actual instants used by the new application.
const date = value => value ? new Date(value.replace(/Z$/, "")).toISOString() : null;
const images = { 88: "/reference/cloud-hero.jpg", 79: "/reference/conference.jpg", 80: "/reference/dance.jpg", 78: "/hellocsik-logo.png" };
const imported = [];
try {
  await client.transaction(async tx => {
    await tx.query("SELECT setval(pg_get_serial_sequence('events', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM events), 0), 1), true)");
    for (const event of events) {
      const existing = await tx.query("SELECT id FROM events WHERE title = $1 AND start_date = $2", [event.title, date(event.startDate)]);
      if (existing.rows.length) { imported.push({ sourceId: event.id, localId: existing.rows[0].id, skipped: true }); continue; }
      const category = event.category;
      let categoryId = null;
      if (category) {
        const found = await tx.query("SELECT id FROM categories WHERE slug = $1 OR name = $2 LIMIT 1", [category.slug, category.name]);
        if (found.rows.length) categoryId = found.rows[0].id;
        else categoryId = (await tx.query("INSERT INTO categories (name, slug, color) VALUES ($1, $2, $3) RETURNING id", [category.name, category.slug, category.color])).rows[0].id;
      }
      const taken = await tx.query("SELECT id FROM events WHERE id = $1", [event.id]);
      const id = taken.rows.length ? (await tx.query("SELECT nextval(pg_get_serial_sequence('events', 'id')) AS id")).rows[0].id : event.id;
      await tx.query(`INSERT INTO events (id,title,description,image_url,start_date,end_date,location,location_address,category_id,featured,month_highlight,ticket_url,price,tags,news_links,status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'published')`,
        [id,event.title,event.description,images[event.id] ?? event.imageUrl,date(event.startDate),date(event.endDate),event.location,event.locationAddress ?? null,categoryId,event.featured,event.monthHighlight,event.ticketUrl ?? null,event.price ?? null,event.tags ?? [],event.newsLinks ?? []]);
      await tx.query("SELECT setval(pg_get_serial_sequence('events', 'id'), (SELECT MAX(id) FROM events), true)");
      imported.push({ sourceId: event.id, localId: id, title: event.title });
    }
  });
  await writeFile(path.join(root, ".local/reference-import.json"), JSON.stringify({ importedAt: new Date().toISOString(), events: imported }, null, 2));
  console.log(imported);
} finally { await client.close(); }
