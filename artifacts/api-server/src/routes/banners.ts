import { Router } from "express";
import { db, bannersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../lib/admin-auth";

const router = Router();


function serializeBanner(b: typeof bannersTable.$inferSelect) {
  return { ...b, createdAt: b.createdAt.toISOString() };
}

router.get("/banners", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(bannersTable)
      .where(eq(bannersTable.active, true))
      .orderBy(bannersTable.position);
    res.json({ banners: rows.map(serializeBanner) });
  } catch (err) {
    req.log.error({ err }, "Failed to list banners");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/banners", requireAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(bannersTable).orderBy(desc(bannersTable.createdAt));
    res.json({ banners: rows.map(serializeBanner) });
  } catch (err) {
    req.log.error({ err }, "Admin: failed to list banners");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/banners", requireAdmin, async (req, res) => {
  try {
    const body = req.body ?? {};
    if (!body.title?.trim()) { res.status(400).json({ error: "A cím kötelező" }); return; }
    if (!body.imageUrl?.trim()) { res.status(400).json({ error: "A kép URL kötelező" }); return; }

    const [created] = await db.insert(bannersTable).values({
      title: body.title.trim(),
      imageUrl: body.imageUrl.trim(),
      linkUrl: body.linkUrl?.trim() || null,
      displayType: body.displayType === "card" ? "card" : "full",
      active: body.active !== false,
      position: typeof body.position === "number" ? body.position : 6,
    }).returning();

    res.status(201).json(serializeBanner(created));
  } catch (err) {
    req.log.error({ err }, "Admin: failed to create banner");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/banners/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const body = req.body ?? {};
    const patch: Record<string, unknown> = {};
    if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
    if (typeof body.imageUrl === "string" && body.imageUrl.trim()) patch.imageUrl = body.imageUrl.trim();
    if ("linkUrl" in body) patch.linkUrl = body.linkUrl?.trim() || null;
    if (body.displayType === "card" || body.displayType === "full") patch.displayType = body.displayType;
    if (typeof body.active === "boolean") patch.active = body.active;
    if (typeof body.position === "number") patch.position = body.position;

    if (Object.keys(patch).length === 0) { res.status(400).json({ error: "No valid fields" }); return; }

    const [updated] = await db.update(bannersTable).set(patch).where(eq(bannersTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }

    res.json(serializeBanner(updated));
  } catch (err) {
    req.log.error({ err }, "Admin: failed to update banner");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/banners/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    await db.delete(bannersTable).where(eq(bannersTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Admin: failed to delete banner");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
