import { Router } from "express";
import { db, eventsTable, categoriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "csikadmin2024";

function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.post("/admin/login", (req, res) => {
  const { password } = req.body ?? {};
  if (password === ADMIN_PASSWORD) {
    res.json({ token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: "Helytelen jelszó" });
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
        category: r.category ?? null,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Admin: failed to list events");
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
    if (typeof body.ticketUrl === "string") patch.ticketUrl = body.ticketUrl.trim() || null;
    if (typeof body.price === "string") patch.price = body.price.trim() || null;
    if (body.startDate) { const d = new Date(body.startDate); if (!isNaN(d.getTime())) patch.startDate = d; }
    if (body.endDate) { const d = new Date(body.endDate); if (!isNaN(d.getTime())) patch.endDate = d; }
    if (body.endDate === null) patch.endDate = null;
    if (body.categoryId === null) patch.categoryId = null;
    else if (typeof body.categoryId === "number") patch.categoryId = body.categoryId;
    if (Object.keys(patch).length === 0) { res.status(400).json({ error: "No valid fields" }); return; }

    const [updated] = await db
      .update(eventsTable)
      .set(patch)
      .where(eq(eventsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Not found" }); return; }

    res.json({ ...updated, startDate: updated.startDate.toISOString(), createdAt: updated.createdAt.toISOString() });
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
