import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const localDir = path.join(root, ".local");
mkdirSync(localDir, { recursive: true });
const envFile = path.join(root, ".env.local");
if (!existsSync(envFile)) writeFileSync(envFile, `ADMIN_PASSWORD=${randomBytes(24).toString("base64url")}\n`);
process.loadEnvFile(envFile);
const env = {
  ...process.env, NODE_ENV: "development", HOST: "127.0.0.1", TZ: "Europe/Bucharest",
  PGLITE_DATA_DIR: process.env.PGLITE_DATA_DIR ?? path.join(localDir, "pgdata"),
};
const apiDir = path.join(root, "artifacts/api-server");
const webDir = path.join(root, "artifacts/csikszereda-programajanlat");
const children = [];
const launch = (args, cwd, extra = {}) => {
  const child = spawn(process.execPath, args, { cwd, env: { ...env, ...extra }, stdio: "inherit", windowsHide: true });
  children.push(child);
  return child;
};
const shutdown = () => { for (const child of children) if (!child.killed) child.kill(); };
process.on("SIGINT", () => { shutdown(); process.exit(0); });
process.on("SIGTERM", () => { shutdown(); process.exit(0); });
process.on("exit", shutdown);
const build = launch(["build.mjs"], apiDir);
build.on("error", error => { console.error(error.message); process.exit(1); });
build.on("exit", code => {
  if (code !== 0) process.exit(code ?? 1);
  const api = launch(["--enable-source-maps", "dist/index.mjs"], apiDir, { PORT: "8080" });
  const requireWeb = createRequire(path.join(webDir, "package.json"));
  const vite = path.join(path.dirname(requireWeb.resolve("vite/package.json")), "bin/vite.js");
  const web = launch([vite, "--host", "127.0.0.1"], webDir, { PORT: "5173", BASE_PATH: "/" });
  for (const child of [api, web]) {
    child.on("error", error => { console.error(error.message); process.exit(1); });
    child.on("exit", code => { shutdown(); process.exit(code ?? 0); });
  }
  console.log("HelloCsík: http://localhost:5173/ | Admin: http://localhost:5173/admin");
  console.log("A helyi adminjelszó a projekt .env.local fájljában található.");
});
