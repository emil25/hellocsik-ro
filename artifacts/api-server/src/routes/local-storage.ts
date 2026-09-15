import express, { Router } from "express";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "../lib/admin-auth";

const router = Router();
const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const tickets = new Map<string, { type: string; size: number; expires: number; filename: string }>();
const directory = process.env.PGLITE_DATA_DIR ? path.resolve(process.env.PGLITE_DATA_DIR, "../uploads") : null;
router.use((req, res, next) => {
  if (!directory || process.env.PRIVATE_OBJECT_DIR) { next("router"); return; }
  next();
});
router.post("/storage/uploads/request-url", requireAdmin, (req, res) => {
  for (const [id, ticket] of tickets) if (ticket.expires < Date.now()) tickets.delete(id);
  const { name, size, contentType } = req.body ?? {};
  if (typeof name !== "string" || !types[contentType] || !Number.isInteger(size) || size < 1 || size > 10 * 1024 * 1024) {
    res.status(400).json({ error: "JPG, PNG vagy WebP képet válassz, legfeljebb 10 MB méretben." }); return;
  }
  if (tickets.size >= 128) { res.status(429).json({ error: "Túl sok folyamatban lévő feltöltés." }); return; }
  const id = randomUUID();
  const filename = `${id}.${types[contentType]}`;
  tickets.set(id, { type: contentType, size, filename, expires: Date.now() + 600_000 });
  res.json({ uploadURL: `http://localhost:5173/api/storage/local-upload/${id}`, objectPath: `/objects/local/${filename}`, metadata: { name, size, contentType } });
});
router.put("/storage/local-upload/:id", express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "10mb" }), async (req, res) => {
  const ticket = tickets.get(String(req.params.id));
  if (!ticket || ticket.expires < Date.now()) { res.status(403).json({ error: "A feltöltési engedély lejárt." }); return; }
  const bytes = req.body;
  if (!Buffer.isBuffer(bytes) || bytes.length !== ticket.size || req.get("content-type") !== ticket.type) {
    res.status(400).json({ error: "Hibás képfájl." }); return;
  }
  const valid = ticket.type === "image/png" ? bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a"
    : ticket.type === "image/jpeg" ? bytes.subarray(0, 3).toString("hex") === "ffd8ff"
    : bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if (!valid) { res.status(400).json({ error: "A fájl nem a megadott képformátum." }); return; }
  tickets.delete(String(req.params.id));
  await mkdir(directory!, { recursive: true });
  await writeFile(path.join(directory!, ticket.filename), bytes, { flag: "wx" });
  res.sendStatus(204);
});
router.get("/storage/objects/local/:filename", (req, res) => {
  const filename = String(req.params.filename);
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(filename)) { res.sendStatus(404); return; }
  res.set("X-Content-Type-Options", "nosniff");
  res.sendFile(filename, { root: directory!, dotfiles: "deny" });
});
export default router;
