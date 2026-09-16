import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { db, organizersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const AUTH_SECRET = process.env.ORGANIZER_AUTH_SECRET ?? process.env.ADMIN_PASSWORD ?? "hellocsik-organizer-local-secret";

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function slugify(value: string) {
  const slug = value.toLocaleLowerCase("hu-HU").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || `szervezo-${randomBytes(3).toString("hex")}`;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export function createOrganizerToken(id: number) {
  const payload = `${id}.${Date.now()}`;
  const signature = createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export async function organizerFromToken(token: string | undefined) {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [idText, issuedAtText, signature] = raw.split(".");
    const id = Number(idText);
    const issuedAt = Number(issuedAtText);
    if (!Number.isInteger(id) || !Number.isFinite(issuedAt) || !signature || Date.now() - issuedAt > 1000 * 60 * 60 * 24 * 30) return null;
    const payload = `${id}.${issuedAt}`;
    const expected = createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const rows = await db.select().from(organizersTable).where(eq(organizersTable.id, id)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export const requireOrganizer: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const organizer = await organizerFromToken(token);
  if (!organizer) {
    res.status(401).json({ error: "Jelentkezz be szervezőként a folytatáshoz." });
    return;
  }
  res.locals.organizer = organizer;
  next();
};

