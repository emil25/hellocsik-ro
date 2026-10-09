import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
await build({
  entryPoints: ["api", "events-schedule", "events-sync-background"].map(name => path.join(directory, `src/netlify/${name}.ts`)),
  outdir: path.join(directory, "dist/netlify"),
  outExtension: { ".js": ".mjs" },
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  external: ["@electric-sql/pglite", "drizzle-orm/pglite", "pg-native", "pino-pretty"],
  banner: { js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);" },
  logLevel: "info",
});
