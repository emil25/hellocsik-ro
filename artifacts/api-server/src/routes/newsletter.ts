import { Router } from "express";
import { db, newsletterTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router = Router();
router.post("/newsletter/subscribe", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Adj meg egy érvényes e-mail-címet." }); return;
  }
  await db.insert(newsletterTable).values({ email }).onConflictDoNothing();
  res.json({ ok: true });
});
router.get("/admin/newsletter", requireAdmin, async (req, res) => {
  res.json({ subscribers: await db.select().from(newsletterTable) });
});
export default router;
