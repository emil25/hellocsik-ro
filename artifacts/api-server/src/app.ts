import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { db, eventsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { renderEventPageMeta } from "./lib/event-page-meta";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const staticDir = process.env.STATIC_DIR ?? path.resolve(process.cwd(), "artifacts/csikszereda-programajanlat/dist/public");
  if (existsSync(staticDir)) {
    const indexHtml = readFileSync(path.join(staticDir, "index.html"), "utf8");
    const siteOrigin = new URL(process.env.PUBLIC_SITE_URL || process.env.RENDER_EXTERNAL_URL || "https://hellocsik-ro.onrender.com").origin;
    app.use(express.static(staticDir));
    app.get("/esemeny/:id", async (req, res) => {
      const id = Number(req.params.id);
      const [event] = Number.isSafeInteger(id) && id > 0 ? await db.select({
        id: eventsTable.id, title: eventsTable.title, description: eventsTable.description,
        imageUrl: eventsTable.imageUrl, location: eventsTable.location,
      }).from(eventsTable).where(and(eq(eventsTable.id, id), eq(eventsTable.status, "published"))).limit(1) : [];
      res.status(event ? 200 : 404).set("Cache-Control", "no-cache").type("html")
        .send(renderEventPageMeta(indexHtml, event ?? null, siteOrigin));
    });
    app.get("/{*path}", (_req, res) => res.sendFile(path.join(staticDir, "index.html")));
  } else {
    logger.warn({ staticDir }, "Production frontend directory does not exist");
  }
}

export default app;
