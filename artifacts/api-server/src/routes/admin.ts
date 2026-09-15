import { Router } from "express";
import { db, eventsTable, categoriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ADMIN_PASSWORD, requireAdmin } from "../lib/admin-auth";
import { getLastSourceSync, syncEventSources } from "../lib/source-sync";
import { extractFacebookEvent, isFirecrawlConfigured } from "../lib/firecrawl";

const router = Router();

const htmlEntities: Record<string, string> = {
  amp: "&", apos: "'", quot: '"', lt: "<", gt: ">", nbsp: " ",
  aacute: "á", Aacute: "Á", eacute: "é", Eacute: "É", iacute: "í", Iacute: "Í",
  oacute: "ó", Oacute: "Ó", odblac: "ő", Odblac: "Ő", uacute: "ú", Uacute: "Ú",
  udblac: "ű", Udblac: "Ű", acirc: "â", Acirc: "Â", icirc: "î", Icirc: "Î",
  scirc: "ș", Scirc: "Ș", tcedil: "ț", Tcedil: "Ț",
};

function decodeHtml(value: string) {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, key: string) => {
    if (key.startsWith("#x") || key.startsWith("#X")) return String.fromCodePoint(parseInt(key.slice(2), 16));
    if (key.startsWith("#")) return String.fromCodePoint(parseInt(key.slice(1), 10));
    return htmlEntities[key] ?? htmlEntities[key.toLowerCase()] ?? entity;
  });
}

function readMeta(html: string, attribute: "property" | "name", value: string) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = new RegExp(`<meta[^>]+${attribute}=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const reverse = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${escaped}["'][^>]*>`, "i");
  return decodeHtml(html.match(tag)?.[1] ?? html.match(reverse)?.[1] ?? "");
}

function readFacebookEventDescription(html: string) {
  const match = html.match(/"event_description"\s*:\s*\{"text"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (!match) return "";
  try {
    return JSON.parse(`"${match[1]}"`).trim();
  } catch {
    return "";
  }
}

function isFacebookGeneratedSummary(description: string) {
  return /(?:és\s+további\s+\d+\s+ember|and\s+\d+\s+others|\beveniment\s+în\b|\bevent\s+in\b)/i.test(description);
}

router.get("/facebook-events/:eventId/image", async (req, res) => {
  const eventId = String(req.params.eventId);
  if (!/^\d{8,}$/.test(eventId)) { res.sendStatus(404); return; }

  try {
    const response = await fetch(`https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=${eventId}`, {
      headers: { "user-agent": "facebookexternalhit/1.1" },
      signal: AbortSignal.timeout(15_000),
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.startsWith("image/")) { res.sendStatus(404); return; }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 256 || bytes.length > 10 * 1024 * 1024) { res.sendStatus(422); return; }
    res.set({ "Content-Type": contentType, "Cache-Control": "public, max-age=86400" }).send(bytes);
  } catch (err) {
    req.log.warn({ err, eventId }, "Could not proxy Facebook event image");
    res.sendStatus(502);
  }
});

router.post("/admin/events/preview-facebook", requireAdmin, async (req, res) => {
  const sourceUrl = typeof req.body?.url === "string" ? req.body.url.trim() : "";
  const match = sourceUrl.match(/^https?:\/\/(?:www\.)?facebook\.com\/events\/(\d+)/i);
  if (!match) { res.status(400).json({ error: "Csak Facebook-esemény linket lehet feldolgozni." }); return; }

  try {
    const canonicalUrl = `https://www.facebook.com/events/${match[1]}/`;
    const [facebookResult, firecrawlResult] = await Promise.allSettled([
      fetch(canonicalUrl, {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; HelloCsik event preview)",
          "accept-language": "hu-HU,hu;q=0.9,en;q=0.7,ro;q=0.5",
        },
        signal: AbortSignal.timeout(12_000),
      }).then(response => response.ok ? response.text() : ""),
      isFirecrawlConfigured() ? extractFacebookEvent(canonicalUrl) : Promise.resolve(null),
    ]);
    const html = facebookResult.status === "fulfilled" ? facebookResult.value : "";
    const firecrawlEvent = firecrawlResult.status === "fulfilled" ? firecrawlResult.value : null;
    if (firecrawlResult.status === "rejected") req.log.warn({ err: firecrawlResult.reason, eventId: match[1] }, "Firecrawl Facebook fallback failed");
    const rawTitle = readMeta(html, "property", "og:title").replace(/\s*\|\s*Facebook$/i, "");
    const eventDescription = readFacebookEventDescription(html);
    const metaDescription = readMeta(html, "name", "description");
    const descriptionNeedsManualEntry = !eventDescription && isFacebookGeneratedSummary(metaDescription);
    let description = eventDescription || (descriptionNeedsManualEntry ? "" : metaDescription);
    let imageUrl = readMeta(html, "property", "og:image") ? `/api/facebook-events/${match[1]}/image` : "";
    description = description || firecrawlEvent?.description?.trim() || "";
    if (!imageUrl && firecrawlEvent?.imageUrl?.trim()) imageUrl = `/api/facebook-events/${match[1]}/image`;
    const title = rawTitle || firecrawlEvent?.title?.trim() || "";
    if (!title) { res.status(422).json({ error: "A Facebook-eseményből nem olvasható ki a cím." }); return; }
    res.json({
      title,
      description,
      imageUrl,
      sourceUrl: canonicalUrl,
      startDate: firecrawlEvent?.startDate,
      endDate: firecrawlEvent?.endDate,
      location: firecrawlEvent?.location,
      descriptionNeedsManualEntry: !description,
    });
  } catch (err) {
    req.log.warn({ err }, "Could not preview Facebook event");
    res.status(502).json({ error: "A Facebook-esemény előnézete most nem tölthető be." });
  }
});

router.post("/admin/login", (req, res) => {
  const { password } = req.body ?? {};
  if (ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
    res.json({ token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: "Helytelen jelszó" });
  }
});

router.get("/admin/source-sync", requireAdmin, (_req, res) => {
  res.json({ lastResult: getLastSourceSync() });
});

router.post("/admin/source-sync", requireAdmin, async (req, res) => {
  try {
    res.json(await syncEventSources());
  } catch (err) {
    req.log.warn({ err }, "Admin: event source sync failed");
    res.status(502).json({ error: "A külső eseményforrás most nem érhető el." });
  }
});

router.get("/admin/events", requireAdmin, async (req, res) => {
  try {
    const status = (req.query.status as string) ?? "all";
    const rows = await db
      .select({ event: eventsTable, category: categoriesTable })
      .from(eventsTable)
      .leftJoin(categoriesTable, eq(eventsTable.categoryId, categoriesTable.id))
      .where(status !== "all" ? eq(eventsTable.status, status) : undefined)
      .orderBy(desc(eventsTable.createdAt));

    res.json({
      events: rows.map((r) => ({
        ...r.event,
        startDate: r.event.startDate.toISOString(),
        endDate: r.event.endDate ? r.event.endDate.toISOString() : null,
        createdAt: r.event.createdAt.toISOString(),
        updatedAt: r.event.updatedAt.toISOString(),
        category: r.category ?? null,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Admin: failed to list events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/events", requireAdmin, async (req, res) => {
  try {
    const body = req.body ?? {};
    if (!body.title?.trim()) { res.status(400).json({ error: "A cím kötelező" }); return; }
    if (!body.startDate) { res.status(400).json({ error: "A kezdési dátum kötelező" }); return; }
    if (!body.location?.trim()) { res.status(400).json({ error: "A helyszín kötelező" }); return; }

    const startDate = new Date(body.startDate);
    if (isNaN(startDate.getTime())) { res.status(400).json({ error: "Érvénytelen dátum" }); return; }

    const endDate = body.endDate ? new Date(body.endDate) : null;

    const newsLinks = Array.isArray(body.newsLinks) ? body.newsLinks.filter((s: unknown) => typeof s === "string") : [];

    const [created] = await db.insert(eventsTable).values({
      title: body.title.trim(),
      description: (body.description ?? "").trim(),
      location: body.location.trim(),
      locationAddress: body.locationAddress?.trim() || null,
      imageUrl: body.imageUrl?.trim() || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      startDate,
      endDate,
      price: body.price?.trim() || null,
      ticketUrl: body.ticketUrl?.trim() || null,
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      status: "published",
      featured: body.featured === true,
      monthHighlight: body.monthHighlight === true,
      newsLinks,
    }).returning();

    res.status(201).json({ ...created, startDate: created.startDate.toISOString(), createdAt: created.createdAt.toISOString(), updatedAt: created.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Admin: failed to create event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/events/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const body = req.body ?? {};
    const patch: Record<string, unknown> = {};
    if (typeof body.featured === "boolean") patch.featured = body.featured;
    if (typeof body.monthHighlight === "boolean") patch.monthHighlight = body.monthHighlight;
    if (["published", "pending", "rejected"].includes(body.status)) patch.status = body.status;
    if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
    if (typeof body.description === "string") patch.description = body.description.trim();
    if (typeof body.location === "string" && body.location.trim()) patch.location = body.location.trim();
    if (typeof body.locationAddress === "string") patch.locationAddress = body.locationAddress.trim() || null;
    if (typeof body.imageUrl === "string" && body.imageUrl.trim()) patch.imageUrl = body.imageUrl.trim();
    if (body.ticketUrl === null) patch.ticketUrl = null;
    else if (typeof body.ticketUrl === "string") patch.ticketUrl = body.ticketUrl.trim() || null;
    if (typeof body.price === "string") patch.price = body.price.trim() || null;
    if (Array.isArray(body.newsLinks)) patch.newsLinks = body.newsLinks.filter((s: unknown) => typeof s === "string");
    if (body.startDate) { const d = new Date(body.startDate); if (!isNaN(d.getTime())) patch.startDate = d; }
    if (body.endDate) { const d = new Date(body.endDate); if (!isNaN(d.getTime())) patch.endDate = d; }
    if (body.endDate === null) patch.endDate = null;
    if (body.categoryId === null) patch.categoryId = null;
    else if (typeof body.categoryId === "number") patch.categoryId = body.categoryId;
    if (Object.keys(patch).length === 0) { res.status(400).json({ error: "No valid fields" }); return; }
    patch.updatedAt = new Date();

    const [updated] = await db
      .update(eventsTable)
      .set(patch)
      .where(eq(eventsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Not found" }); return; }

    res.json({ ...updated, startDate: updated.startDate.toISOString(), createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Admin: failed to patch event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/events/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    await db.delete(eventsTable).where(eq(eventsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Admin: failed to delete event");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
