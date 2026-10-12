import { and, desc, eq } from "drizzle-orm";
import { Router } from "express";
import { db, eventReportsTable, eventsTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router = Router();
const reportReasons = new Set(["wrong_time", "wrong_place", "cancelled", "ticket_link", "other"]);

router.post("/events/:id/report", async (req, res) => {
  const eventId = Number(req.params.id);
  if (!Number.isSafeInteger(eventId) || eventId < 1) {
    res.status(400).json({ error: "Érvénytelen esemény." });
    return;
  }

  const body = req.body ?? {};
  // Quietly accept the request without storing it if a bot fills the trap field.
  if (typeof body.website === "string" && body.website.trim()) {
    res.status(202).json({ ok: true });
    return;
  }
  const reason = typeof body.reason === "string" ? body.reason : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!reportReasons.has(reason)) {
    res.status(400).json({ error: "Válassz egy hibajelzési típust." });
    return;
  }
  if (message.length > 1200) {
    res.status(400).json({ error: "A megjegyzés legfeljebb 1200 karakter lehet." });
    return;
  }

  try {
    const [event] = await db.select({ id: eventsTable.id, title: eventsTable.title })
      .from(eventsTable)
      .where(and(eq(eventsTable.id, eventId), eq(eventsTable.status, "published")))
      .limit(1);
    if (!event) {
      res.status(404).json({ error: "Ez az esemény nem található." });
      return;
    }

    const openReport = await db.select({ id: eventReportsTable.id })
      .from(eventReportsTable)
      .where(and(eq(eventReportsTable.eventId, eventId), eq(eventReportsTable.reason, reason), eq(eventReportsTable.status, "open")))
      .limit(1);
    if (openReport.length === 0) {
      await db.insert(eventReportsTable).values({
        eventId,
        eventTitle: event.title,
        reason,
        message: message || null,
      });
    }
    res.status(201).json({ ok: true });
  } catch (error) {
    req.log.error({ error }, "Failed to create event report");
    res.status(500).json({ error: "A jelzést most nem sikerült elküldeni." });
  }
});

router.get("/admin/event-reports", requireAdmin, async (req, res) => {
  try {
    const status = req.query.status === "resolved" ? "resolved" : "open";
    const reports = await db.select().from(eventReportsTable)
      .where(eq(eventReportsTable.status, status))
      .orderBy(desc(eventReportsTable.createdAt));
    res.json({ reports: reports.map((report) => ({
      ...report,
      createdAt: report.createdAt.toISOString(),
      resolvedAt: report.resolvedAt?.toISOString() ?? null,
    })) });
  } catch (error) {
    req.log.error({ error }, "Admin: failed to list event reports");
    res.status(500).json({ error: "A jelzések nem tölthetők be." });
  }
});

router.patch("/admin/event-reports/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const status = req.body?.status;
  if (!Number.isSafeInteger(id) || id < 1 || !["open", "resolved"].includes(status)) {
    res.status(400).json({ error: "Érvénytelen jelzés vagy állapot." });
    return;
  }
  try {
    const [report] = await db.update(eventReportsTable)
      .set({ status, resolvedAt: status === "resolved" ? new Date() : null })
      .where(eq(eventReportsTable.id, id))
      .returning();
    if (!report) {
      res.status(404).json({ error: "A jelzés nem található." });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    req.log.error({ error }, "Admin: failed to update event report");
    res.status(500).json({ error: "A jelzés állapotát nem sikerült menteni." });
  }
});

export default router;
