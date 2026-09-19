import { Router } from "express";
import { and, asc, eq, gte, or, isNull } from "drizzle-orm";
import { db, eventsTable, categoriesTable, organizersTable } from "@workspace/db";
import { CreateEventBody } from "@workspace/api-zod";
import { createOrganizerToken, hashPassword, normalizeEmail, requireOrganizer, slugify, verifyPassword } from "../lib/organizer-auth";

const router = Router();

function publicOrganizer(organizer: any) {
  return {
    id: organizer.id,
    slug: organizer.slug,
    name: organizer.name,
    bio: organizer.bio ?? "",
    city: organizer.city ?? "Székelyföld",
    website: organizer.website ?? null,
    logoUrl: organizer.logoUrl ?? null,
    createdAt: organizer.createdAt?.toISOString?.() ?? organizer.createdAt,
  };
}

function publicEvent(event: any, category: any) {
  const { submitterName: _submitterName, submitterEmail: _submitterEmail, organizerId: _organizerId, ...safeEvent } = event;
  return {
    ...safeEvent,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString?.() ?? null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    category: category ?? null,
    tags: event.tags ?? [],
    newsLinks: event.newsLinks ?? [],
    locationAddress: event.locationAddress ?? null,
    ticketUrl: event.ticketUrl ?? null,
    price: event.price ?? null,
  };
}

function uniqueSlug(base: string, existing: string[]) {
  const clean = slugify(base);
  if (!existing.includes(clean)) return clean;
  let i = 2;
  while (existing.includes(`${clean}-${i}`)) i += 1;
  return `${clean}-${i}`;
}

function withFacebookLink(newsLinks: unknown, facebookUrl: string) {
  const kept = Array.isArray(newsLinks) ? newsLinks.filter((raw) => {
    if (typeof raw !== "string") return false;
    try {
      const parsed = JSON.parse(raw) as { title?: unknown; url?: unknown };
      return !(/facebook/i.test(String(parsed.title ?? "")) || /facebook\.com/i.test(String(parsed.url ?? "")));
    } catch {
      return !/facebook\.com/i.test(raw);
    }
  }) : [];
  return facebookUrl ? [...kept, JSON.stringify({ title: "Facebook-esemény", url: facebookUrl })] : kept;
}

router.post("/organizers/register", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = normalizeEmail(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const city = typeof req.body?.city === "string" && req.body.city.trim() ? req.body.city.trim() : "Székelyföld";
  const bio = typeof req.body?.bio === "string" ? req.body.bio.trim() : "";
  const website = typeof req.body?.website === "string" && req.body.website.trim() ? req.body.website.trim() : null;
  if (name.length < 2 || name.length > 120) { res.status(400).json({ error: "A szervező neve 2–120 karakter legyen." }); return; }
  if (!/^\S+@\S+\.\S+$/.test(email)) { res.status(400).json({ error: "Adj meg érvényes e-mail-címet." }); return; }
  if (password.length < 8) { res.status(400).json({ error: "A jelszó legalább 8 karakter legyen." }); return; }
  try {
    const existing = await db.select({ id: organizersTable.id }).from(organizersTable).where(eq(organizersTable.email, email)).limit(1);
    if (existing.length > 0) { res.status(409).json({ error: "Ezzel az e-mail-címmel már létezik szervezői fiók." }); return; }
    const allSlugs = await db.select({ slug: organizersTable.slug }).from(organizersTable);
    const [organizer] = await db.insert(organizersTable).values({ slug: uniqueSlug(name, allSlugs.map((row) => row.slug)), name, email, passwordHash: hashPassword(password), bio, city, website }).returning();
    res.status(201).json({ organizer: publicOrganizer(organizer), token: createOrganizerToken(organizer.id) });
  } catch (error) {
    req.log.error({ error }, "Organizer registration failed");
    res.status(500).json({ error: "A regisztráció nem sikerült." });
  }
});

router.post("/organizers/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  try {
    const rows = await db.select().from(organizersTable).where(eq(organizersTable.email, email)).limit(1);
    const organizer = rows[0];
    if (!organizer || !verifyPassword(password, organizer.passwordHash)) { res.status(401).json({ error: "Helytelen e-mail-cím vagy jelszó." }); return; }
    res.json({ organizer: publicOrganizer(organizer), token: createOrganizerToken(organizer.id) });
  } catch (error) {
    req.log.error({ error }, "Organizer login failed");
    res.status(500).json({ error: "A belépés nem sikerült." });
  }
});

router.get("/organizers/me", requireOrganizer, (req, res) => {
  res.json({ organizer: publicOrganizer(res.locals.organizer) });
});

router.get("/organizers/me/events", requireOrganizer, async (req, res) => {
  const organizer = res.locals.organizer;
  const rows = await db.select({ event: eventsTable, category: categoriesTable }).from(eventsTable).leftJoin(categoriesTable, eq(eventsTable.categoryId, categoriesTable.id)).where(eq(eventsTable.organizerId, organizer.id)).orderBy(asc(eventsTable.startDate));
  res.json({ events: rows.map((row) => publicEvent(row.event, row.category)) });
});

router.post("/organizers/me/events", requireOrganizer, async (req, res) => {
  // Organizer forms may leave the poster empty; use the same neutral fallback
  // as the public submission route so the event can still be reviewed.
  const parsed = CreateEventBody.safeParse({ ...req.body, imageUrl: req.body?.imageUrl || "/hellocsik-logo.png" });
  if (!parsed.success) { res.status(400).json({ error: "Hiányzó vagy hibás eseményadatok.", details: parsed.error }); return; }
  const data = parsed.data;
  const requestedPlan = ["free", "featured", "homepage"].includes(req.body?.promotionPlan) ? req.body.promotionPlan : "free";
  const facebookUrl = typeof req.body?.facebookUrl === "string" ? req.body.facebookUrl.trim() : "";
  try {
    const [event] = await db.insert(eventsTable).values({ title: data.title, description: data.description, imageUrl: data.imageUrl, startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : null, location: data.location, locationAddress: data.locationAddress ?? null, categoryId: data.categoryId ?? null, organizerId: res.locals.organizer.id, promotionPlan: requestedPlan, promotionStatus: requestedPlan === "free" ? "none" : "requested", featured: false, monthHighlight: false, ticketUrl: data.ticketUrl ?? null, price: data.price ?? null, tags: data.tags ?? [], newsLinks: withFacebookLink([], facebookUrl), status: "pending", submitterName: res.locals.organizer.name, submitterEmail: res.locals.organizer.email }).returning();
    res.status(201).json({ ok: true, id: event.id, status: event.status });
  } catch (error) {
    req.log.error({ error }, "Organizer event submission failed");
    res.status(500).json({ error: "Az esemény beküldése nem sikerült." });
  }
});

router.patch("/organizers/me/events/:id", requireOrganizer, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "Érvénytelen eseményazonosító." }); return; }
  try {
    const existing = await db.select().from(eventsTable).where(and(eq(eventsTable.id, id), eq(eventsTable.organizerId, res.locals.organizer.id))).limit(1);
    if (!existing[0]) { res.status(404).json({ error: "Az esemény nem található a fiókodban." }); return; }
    const body = req.body ?? {};
    const patch: Record<string, unknown> = {};
    for (const field of ["title", "description", "location", "locationAddress", "imageUrl", "ticketUrl", "price"] as const) {
      if (typeof body[field] !== "string") continue;
      const value = body[field].trim();
      if (["title", "description", "location"].includes(field) && !value) { res.status(400).json({ error: "A cím, leírás és helyszín nem lehet üres." }); return; }
      patch[field] = value || (field === "imageUrl" ? "/hellocsik-logo.png" : null);
    }
    if (Object.prototype.hasOwnProperty.call(body, "facebookUrl")) {
      const facebookUrl = typeof body.facebookUrl === "string" ? body.facebookUrl.trim() : "";
      patch.newsLinks = withFacebookLink(existing[0].newsLinks, facebookUrl);
    }
    if (typeof body.startDate === "string") {
      const start = new Date(body.startDate);
      if (Number.isNaN(start.getTime())) { res.status(400).json({ error: "Érvénytelen kezdési dátum." }); return; }
      patch.startDate = start;
    }
    if (typeof body.endDate === "string" || body.endDate === null) {
      if (body.endDate === null || body.endDate === "") patch.endDate = null;
      else {
        const end = new Date(body.endDate);
        if (Number.isNaN(end.getTime())) { res.status(400).json({ error: "Érvénytelen befejezési dátum." }); return; }
        patch.endDate = end;
      }
    }
    if (body.categoryId === null) patch.categoryId = null;
    else if (typeof body.categoryId === "number" && Number.isInteger(body.categoryId)) patch.categoryId = body.categoryId;
    if (["free", "featured", "homepage"].includes(body.promotionPlan)) {
      patch.promotionPlan = body.promotionPlan;
      patch.promotionStatus = body.promotionPlan === "free" ? "none" : "requested";
    }
    if (Object.keys(patch).length === 0) { res.status(400).json({ error: "Nincs módosítható adat." }); return; }
    patch.status = "pending";
    patch.updatedAt = new Date();
    const [updated] = await db.update(eventsTable).set(patch).where(eq(eventsTable.id, id)).returning();
    res.json({ ok: true, id: updated.id, status: updated.status });
  } catch (error) {
    req.log.error({ error }, "Organizer event update failed");
    res.status(500).json({ error: "Az esemény módosítása nem sikerült." });
  }
});

router.get("/organizers/:slug", async (req, res) => {
  try {
    const rows = await db.select().from(organizersTable).where(eq(organizersTable.slug, req.params.slug)).limit(1);
    if (rows.length === 0) { res.status(404).json({ error: "Szervező nem található." }); return; }
    const organizer = rows[0];
    const eventRows = await db.select({ event: eventsTable, category: categoriesTable }).from(eventsTable).leftJoin(categoriesTable, eq(eventsTable.categoryId, categoriesTable.id)).where(and(eq(eventsTable.organizerId, organizer.id), eq(eventsTable.status, "published"), or(gte(eventsTable.endDate, new Date()), and(isNull(eventsTable.endDate), gte(eventsTable.startDate, new Date())))!)).orderBy(asc(eventsTable.startDate));
    res.json({ organizer: publicOrganizer(organizer), events: eventRows.map((row) => publicEvent(row.event, row.category)) });
  } catch (error) {
    req.log.error({ error }, "Organizer profile lookup failed");
    res.status(500).json({ error: "A szervezői profil nem tölthető be." });
  }
});

export default router;
