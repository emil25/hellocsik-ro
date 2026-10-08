import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateDatabaseBackup } from "../shared/database-backup.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const envFile = path.join(root, ".env.local");
if (existsSync(envFile)) process.loadEnvFile(envFile);

try {
  if (!process.env.ADMIN_PASSWORD) throw new Error();
  const base = new URL(process.env.HELLOCSIK_SITE_URL || "https://hellocsik-ro.onrender.com");
  if (base.protocol !== "https:" && !["127.0.0.1", "localhost"].includes(base.hostname)) throw new Error();
  const response = await fetch(new URL("/api/admin/database-backup", base), {
    headers: { Authorization: `Bearer ${process.env.ADMIN_PASSWORD}` },
    redirect: "error",
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) throw new Error();
  const content = await response.text();
  const backup = validateDatabaseBackup(JSON.parse(content));
  const directory = path.join(root, ".local/backups");
  const filename = `hellocsik-database-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const file = path.join(directory, filename);
  const sha256 = createHash("sha256").update(content).digest("hex");
  await mkdir(directory, { recursive: true });
  await writeFile(file, content, { flag: "wx", mode: 0o600 });
  await writeFile(`${file}.sha256`, `${sha256}  ${filename}\n`, { flag: "wx", mode: 0o600 });
  console.log(JSON.stringify({ file, sha256, databaseBytes: backup.databaseBytes,
    tables: Object.fromEntries(Object.entries(backup.tables).map(([name, rows]) => [name, rows.length])),
  }));
} catch {
  console.error("Backup failed. No verified backup was created. Check the server and admin access.");
  process.exitCode = 1;
}
