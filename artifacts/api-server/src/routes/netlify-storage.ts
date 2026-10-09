import express, { Router } from "express";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { ADMIN_PASSWORD, requireAdmin } from "../lib/admin-auth";

const router = Router();
const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const maxBytes = 3 * 1024 * 1024; // Leave room for base64 expansion in the function request.
const filenamePattern = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;
const store = () => getStore({ name: "hellocsik-uploads", consistency: "strong" });
const sign = (value: string) => createHmac("sha256", ADMIN_PASSWORD!).update(`image-upload:${value}`).digest("base64url");

router.post("/storage/uploads/request-url", requireAdmin, (req, res) => {
  const { name, size, contentType } = req.body ?? {};
  if (typeof name !== "string" || !extensions[contentType] || !Number.isInteger(size) || size < 1 || size > maxBytes) {
    res.status(400).json({ error: "JPG, PNG vagy WebP képet válassz, legfeljebb 3 MB méretben." }); return;
  }
  const filename = `${randomUUID()}.${extensions[contentType]}`;
  const payload = Buffer.from(JSON.stringify({ filename, size, contentType, expires: Date.now() + 600_000 })).toString("base64url");
  res.json({
    uploadURL: `/api/storage/netlify-upload/${filename}?ticket=${payload}.${sign(payload)}`,
    objectPath: `/objects/netlify/${filename}`,
    metadata: { name, size, contentType },
  });
});

router.put("/storage/netlify-upload/:filename", express.raw({ type: Object.keys(extensions), limit: maxBytes }), async (req, res) => {
  const filename = String(req.params.filename);
  const [payload, signature] = typeof req.query.ticket === "string" ? req.query.ticket.split(".") : [];
  if (!ADMIN_PASSWORD || !filenamePattern.test(filename) || !payload || !signature || payload.length > 1024) {
    res.sendStatus(403); return;
  }
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) { res.sendStatus(403); return; }
  let ticket;
  try { ticket = JSON.parse(Buffer.from(payload, "base64url").toString()); }
  catch { res.sendStatus(403); return; }
  if (ticket.filename !== filename || !Number.isFinite(ticket.expires) || ticket.expires < Date.now()) { res.sendStatus(403); return; }
  const bytes = req.body;
  if (!Buffer.isBuffer(bytes) || bytes.length !== ticket.size || req.get("content-type") !== ticket.contentType) {
    res.status(400).json({ error: "Hibás képfájl." }); return;
  }
  const valid = ticket.contentType === "image/png" ? bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a"
    : ticket.contentType === "image/jpeg" ? bytes.subarray(0, 3).toString("hex") === "ffd8ff"
    : bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if (!valid) { res.status(400).json({ error: "A fájl nem a megadott képformátum." }); return; }
  const result = await store().set(filename, new Uint8Array(bytes).buffer, {
    metadata: { contentType: ticket.contentType }, onlyIfNew: true,
  });
  if (!result.modified) { res.status(409).json({ error: "Ez a kép már fel lett töltve." }); return; }
  res.sendStatus(204);
});

router.get("/storage/objects/netlify/:filename", async (req, res) => {
  const filename = String(req.params.filename);
  if (!filenamePattern.test(filename)) { res.sendStatus(404); return; }
  const result = await store().getWithMetadata(filename, { type: "arrayBuffer" });
  if (!result || typeof result.metadata.contentType !== "string" || !extensions[result.metadata.contentType]) {
    res.sendStatus(404); return;
  }
  res.set({ "Content-Type": result.metadata.contentType, "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=31536000, immutable" });
  res.send(Buffer.from(result.data));
});

export default router;
