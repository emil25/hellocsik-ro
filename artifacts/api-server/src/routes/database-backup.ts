import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";
import { DATABASE_BACKUP_SQL } from "../../../../shared/database-backup.mjs";

const router = Router();

router.get("/admin/database-backup", requireAdmin, async (req, res) => {
  res.set({ "Cache-Control": "no-store", "Vary": "Authorization", "X-Content-Type-Options": "nosniff" });
  if (!pool) {
    res.status(503).json({ error: "Ez a mentés a külső PostgreSQL-adatbázishoz használható." });
    return;
  }
  try {
    const result = await pool.query(DATABASE_BACKUP_SQL);
    const filename = `hellocsik-database-${new Date().toISOString().slice(0, 10)}.json`;
    res.attachment(filename).type("application/json").send(JSON.stringify(result.rows[0].backup));
  } catch (err) {
    req.log.error({ err }, "Admin: database backup failed");
    res.status(500).json({ error: "Az adatbázismentés nem sikerült." });
  }
});

export default router;
