import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT ?? "5173";

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "regional-static-shell",
      apply: "build",
      async closeBundle() {
        const output = path.resolve(import.meta.dirname, "dist/public");
        const origin = new URL(process.env.PUBLIC_SITE_URL || process.env.URL || "https://hellocsik-ro.netlify.app").origin;
        const description = "Koncertek, színház, fesztiválok és közösségi programok Székelyföldön. Keress város, időpont és kategória szerint. Ingyenes eseménybeküldés.";
        const html = (await readFile(path.join(output, "index.html"), "utf8"))
          .replace(/<title>[^<]*<\/title>/, "<title>Programtér – Székelyföld programjai</title>")
          .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`)
          .replace(/<meta name="keywords"[^>]*>/, '<meta name="keywords" content="Székelyföld, programok, események, koncertek, színház, fesztiválok" />')
          .replace(/<meta name="author"[^>]*>/, '<meta name="author" content="Programtér" />')
          .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${origin}/szekelyfold/" />`)
          .replace(/<meta (?:property|name)="(?:og:[^"]*|twitter:[^"]*)"[^>]*>/g, "")
          .replace(/href="\/favicon.svg"/, 'href="/programter-mark.svg"')
          .replace("</head>", `<meta property="og:title" content="Programtér – Székelyföld programjai" /><meta property="og:description" content="${description}" /><meta property="og:site_name" content="Programtér" /><meta property="og:url" content="${origin}/szekelyfold/" /><meta property="og:type" content="website" /><meta property="og:locale" content="hu_HU" /></head>`);
        await mkdir(path.join(output, "szekelyfold"), { recursive: true });
        await writeFile(path.join(output, "szekelyfold/index.html"), html);
      },
    },
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.API_URL ?? "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
