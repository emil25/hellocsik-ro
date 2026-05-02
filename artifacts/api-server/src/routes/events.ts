import { Router } from "express";
import { db, eventsTable, categoriesTable } from "@workspace/db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import {
  ListEventsQueryParams,
  CreateEventBody,
  GetEventParams,
  ListUpcomingEventsQueryParams,
} from "@workspace/api-zod";

const router = Router();

function formatEvent(event: any, category: any) {
  return {
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : null,
    createdAt: event.createdAt.toISOString(),
    category: category ?? null,
    tags: event.tags ?? [],
    locationAddress: event.locationAddress ?? null,
    ticketUrl: event.ticketUrl ?? null,
    price: event.price ?? null,
  };
}

async function getEventsWithCategories(conditions: any[] = [], orderBy?: any, limit?: number, offset?: number) {
  let query = db
    .select({
      event: eventsTable,
      category: categoriesTable,
    })
    .from(eventsTable)
    .leftJoin(categoriesTable, eq(eventsTable.categoryId, categoriesTable.id))
    .$dynamic();

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (orderBy) {
    query = query.orderBy(orderBy);
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

    const conditions: any[] = [];
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

router.get("/events/featured", async (req, res) => {
  try {
    const rows = await getEventsWithCategories(
      [eq(eventsTable.featured, true)],
      asc(eventsTable.startDate)
    );
    res.json({ events: rows.map((r) => formatEvent(r.event, r.category)) });
  } catch (err) {
    req.log.error({ err }, "Failed to list featured events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/this-week", async (req, res) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const hunDayNames = ["V", "H", "K", "Sze", "Cs", "P", "Szo"];

    const rows = await getEventsWithCategories(
      [gte(eventsTable.startDate, monday), lte(eventsTable.startDate, sunday)],
      asc(eventsTable.startDate)
    );

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dateStr = day.toISOString().slice(0, 10);
      const dayEvents = rows
        .filter((r) => r.event.startDate.toISOString().slice(0, 10) === dateStr)
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

    const rows = await getEventsWithCategories(
      [gte(eventsTable.startDate, new Date())],
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
      [eq(eventsTable.monthHighlight, true)],
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

router.post("/events", async (req, res) => {
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
