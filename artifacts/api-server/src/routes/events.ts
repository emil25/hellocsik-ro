import { Router } from "express";
import { db, eventsTable, categoriesTable } from "@workspace/db";
import { eq, and, gte, lte, desc, asc, ne, or, isNull } from "drizzle-orm";
import { requireAdmin } from "../lib/admin-auth";
import {
  ListEventsQueryParams,
  CreateEventBody,
  GetEventParams,
  ListUpcomingEventsQueryParams,
} from "@workspace/api-zod";

const router = Router();

function eventNotExpired(at = new Date()) {
  return or(
    gte(eventsTable.endDate, at),
    and(isNull(eventsTable.endDate), gte(eventsTable.startDate, at)),
  )!;
}

function formatEvent(event: any, category: any) {
  const { submitterName, submitterEmail, ...publicEvent } = event;
  return {
    ...publicEvent,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    category: category ?? null,
    tags: event.tags ?? [],
    locationAddress: event.locationAddress ?? null,
    ticketUrl: event.ticketUrl ?? null,
    price: event.price ?? null,
  };
}

async function getEventsWithCategories(conditions: any[] = [], orderBy?: any | any[], limit?: number, offset?: number) {
  let query = db
    .select({
      event: eventsTable,
      category: categoriesTable,
    })
    .from(eventsTable)
    .leftJoin(categoriesTable, eq(eventsTable.categoryId, categoriesTable.id))
    .$dynamic();

  if (conditions.length > 0) {
    query = query.where(and(eq(eventsTable.status, "published"), ...conditions));
  } else {
    query = query.where(eq(eventsTable.status, "published"));
  }

  if (orderBy) {
    query = Array.isArray(orderBy) ? query.orderBy(...orderBy) : query.orderBy(orderBy);
  }

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  if (offset !== undefined) {
    query = query.offset(offset);
  }

  return query;
}

router.get("/events", async (req, res) => {
  try {
    const parsed = ListEventsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query params" });
      return;
    }
    const { categoryId, startDate, endDate, featured, limit = 20, offset = 0 } = parsed.data;

    const conditions: any[] = [eventNotExpired()];
    if (categoryId !== undefined) conditions.push(eq(eventsTable.categoryId, categoryId));
    if (startDate) conditions.push(gte(eventsTable.startDate, new Date(startDate)));
    if (endDate) conditions.push(lte(eventsTable.startDate, new Date(endDate)));
    if (featured !== undefined) conditions.push(eq(eventsTable.featured, featured));

    const rows = await getEventsWithCategories(conditions, asc(eventsTable.startDate), limit, offset);
    const total = rows.length;

    res.json({
      events: rows.map((r) => formatEvent(r.event, r.category)),
      total,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/events/submit", async (req, res) => {
  try {
    const body = req.body ?? {};
    const required = ["title", "description", "startDate", "location"];
    for (const f of required) {
      if (typeof body[f] !== "string" || !body[f].trim()) { res.status(400).json({ error: `${f} kötelező` }); return; }
    }
    const start = new Date(body.startDate);
    const end = body.endDate ? new Date(body.endDate) : null;
    if (Number.isNaN(start.getTime()) || (end && (Number.isNaN(end.getTime()) || end < start))) {
      res.status(400).json({ error: "Érvénytelen dátum vagy dátumtartomány." }); return;
    }
    const [event] = await db
      .insert(eventsTable)
      .values({
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl || "/hellocsik-logo.png",
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        location: body.location,
        locationAddress: body.locationAddress ?? null,
        categoryId: body.categoryId ? Number(body.categoryId) : null,
        ticketUrl: body.ticketUrl ?? null,
        price: body.price ?? null,
        tags: [],
        featured: false,
        monthHighlight: false,
        status: "pending",
        submitterName: body.submitterName ?? null,
        submitterEmail: body.submitterEmail ?? null,
      })
      .returning();
    res.status(201).json({ ok: true, id: event.id });
  } catch (err) {
    req.log.error({ err }, "Failed to submit event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/featured", async (req, res) => {
  try {
    const now = new Date();
    const rows = await getEventsWithCategories(
      [eq(eventsTable.featured, true), eventNotExpired(now)],
      [desc(eventsTable.monthHighlight), asc(eventsTable.startDate)]
    );
    res.json({ events: rows.map((r) => formatEvent(r.event, r.category)) });
  } catch (err) {
    req.log.error({ err }, "Failed to list featured events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/this-week", async (req, res) => {
  try {
    const weekOffset = Number(req.query.weekOffset ?? 0);
    if (!Number.isInteger(weekOffset) || weekOffset < -52 || weekOffset > 104) {
      res.status(400).json({ error: "Érvénytelen hét." }); return;
    }
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const hunDayNames = ["V", "H", "K", "Sze", "Cs", "P", "Szo"];

    const rows = await getEventsWithCategories(
      [
        lte(eventsTable.startDate, sunday),
        or(gte(eventsTable.endDate, monday), and(isNull(eventsTable.endDate), gte(eventsTable.startDate, monday)))!,
        eventNotExpired(now),
      ],
      asc(eventsTable.startDate)
    );

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      const dayEvents = rows
        .filter((r) => r.event.startDate < nextDay && (r.event.endDate ?? r.event.startDate) >= day)
        .map((r) => formatEvent(r.event, r.category));

      days.push({
        date: dateStr,
        dayName: hunDayNames[day.getDay()],
        events: dayEvents,
      });
    }

    res.json({ days });
  } catch (err) {
    req.log.error({ err }, "Failed to list this week events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/upcoming", async (req, res) => {
  try {
    const parsed = ListUpcomingEventsQueryParams.safeParse(req.query);
    const limit = parsed.success ? (parsed.data.limit ?? 9) : 9;

    const now = new Date();
    const rows = await getEventsWithCategories(
      [eventNotExpired(now)],
      asc(eventsTable.startDate),
      limit
    );
    res.json({ events: rows.map((r) => formatEvent(r.event, r.category)) });
  } catch (err) {
    req.log.error({ err }, "Failed to list upcoming events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/month-highlight", async (req, res) => {
  try {
    const rows = await getEventsWithCategories(
      [eq(eventsTable.monthHighlight, true), eventNotExpired()],
      asc(eventsTable.startDate),
      1
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "No month highlight found" });
      return;
    }
    res.json(formatEvent(rows[0].event, rows[0].category));
  } catch (err) {
    req.log.error({ err }, "Failed to get month highlight");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/:id/news", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const rows = await getEventsWithCategories([eq(eventsTable.id, id)]);
    if (rows.length === 0) { res.status(404).json({ error: "Not found" }); return; }

    const event = rows[0].event;

    // Strip roman numerals, numbers, punctuation — keep meaningful words only
    const ROMAN = /^(I{1,3}|IV|VI{0,3}|IX|XI{0,3}|XIV|XV|XVI{0,3}|XIX|XX{0,3}I?)\.?$/i;
    // Common generic Hungarian words that don't identify an event
    const GENERIC = new Set([
      "erdélyi", "erdely", "csíki", "csiki", "éves", "eves", "hazai",
      "magyar", "városi", "helyi", "nagy", "kisebb", "közös", "hatodik", "nyílt", "nyilt",
      "tavaszi", "nyári", "oszi", "téli", "teli", "nemze", "neves", "együt", "kultu",
      // generic event-title words
      "hétvégéje", "hetvegeje", "hétvége", "hetvege", "napja", "napok", "napjai",
      "előadás", "eloadás", "előadása", "eloadasa", "találkozója", "talalkozoja",
      "fesztiválja", "fesztival", "fesztivál", "programja", "műsor", "musor",
      "rendezvény", "rendezveny", "hangverseny", "koncert", "kiállítás", "kiallitas",
      "felvonulás", "felvonulas", "ünnepség", "unnepseg", "gálája", "galaja",
      "ünnepe", "unnep", "bemutatója", "bemutatoja", "estje", "estjén",
      "találkozó", "talalkozó", "verseny", "bajnokság", "bajnoksag",
      "összejövetel", "osszejovetel", "vetítés", "vetites", "vetítő", "vetito",
    ]);

    const words = event.title
      .replace(/[–—\-\|()[\].!?]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 4 && !ROMAN.test(w) && !/^\d+$/.test(w) && !GENERIC.has(w.toLowerCase()));

    // Use the 2 most specific words (longest = most unique)
    const keyWords = [...words].sort((a, b) => b.length - a.length).slice(0, 2);
    // If no good words, fall back to first meaningful word
    if (keyWords.length === 0) {
      const fallback = event.title.replace(/[–—\-\|()[\].!?]/g, " ").split(/\s+/).find(w => w.length > 2);
      if (fallback) keyWords.push(fallback);
    }
    const specificQuery = encodeURIComponent(keyWords.join(" "));

    type Article = { title: string; link: string; pubDate: string; description: string; source: string };

    async function fetchNews(q: string, mustMatchAll: string[]): Promise<Article[]> {
      const url = `https://news.google.com/rss/search?q=${q}&hl=hu&gl=RO&ceid=RO:hu`;
      const resp = await fetch(url, {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsReader/1.0)" },
      });
      if (!resp.ok) return [];
      const xml = await resp.text();
      const kws = mustMatchAll.map(w => w.toLowerCase());
      return xml.split("<item>").slice(1).slice(0, 8).map(raw => {
        const item = raw.split("</item>")[0];
        const titleRaw = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] ?? "";
        const title = titleRaw
          .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim()
          .replace(/\s*-\s*[^-]+$/, "").trim();
        const linkMatch = item.match(/<link>(https?:\/\/[^\s<]+)<\/link>/);
        const guidMatch = item.match(/<guid[^>]*>(https?:\/\/[^\s<]+)<\/guid>/);
        const link = (linkMatch?.[1] ?? guidMatch?.[1] ?? "").trim();
        const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "").trim();
        const rawSource = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ?? "";
        const source = rawSource.replace(/&amp;/g, "&").trim() || "Google Hírek";
        // Only keep if the article title contains ALL required keywords
        const at = title.toLowerCase();
        if (!title || !link || !kws.every(kw => at.includes(kw))) return null;
        return { title, link, pubDate, description: "", source };
      }).filter(Boolean) as Article[];
    }

    let articles: Article[] = [];
    try {
      // First try: require ALL keywords to match (strict)
      articles = await fetchNews(specificQuery, keyWords);
      // Fallback: search & filter with only the most specific keyword
      if (articles.length === 0 && keyWords.length > 1) {
        const fallbackQuery = encodeURIComponent(keyWords[0]);
        articles = await fetchNews(fallbackQuery, [keyWords[0]]);
      }
    } catch (fetchErr) {
      req.log.error({ fetchErr }, "news fetch error");
    }

    res.json({ articles: articles.slice(0, 4) });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch news for event");
    res.json({ articles: [] });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const parsed = GetEventParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const rows = await getEventsWithCategories([eq(eventsTable.id, parsed.data.id)]);
    if (rows.length === 0) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json(formatEvent(rows[0].event, rows[0].category));
  } catch (err) {
    req.log.error({ err }, "Failed to get event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/events", requireAdmin, async (req, res) => {
  try {
    const parsed = CreateEventBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error });
      return;
    }

    const data = parsed.data;
    const [event] = await db
      .insert(eventsTable)
      .values({
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location,
        locationAddress: data.locationAddress ?? null,
        categoryId: data.categoryId ?? null,
        featured: data.featured ?? false,
        monthHighlight: data.monthHighlight ?? false,
        ticketUrl: data.ticketUrl ?? null,
        price: data.price ?? null,
        tags: data.tags ?? [],
      })
      .returning();

    const rows = await getEventsWithCategories([eq(eventsTable.id, event.id)]);
    res.status(201).json(formatEvent(rows[0].event, rows[0].category));
  } catch (err) {
    req.log.error({ err }, "Failed to create event");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
