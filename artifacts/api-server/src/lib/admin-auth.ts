import type { RequestHandler } from "express";

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!ADMIN_PASSWORD) {
    res.status(503).json({ error: "Az adminjelszó nincs beállítva." });
    return;
  }
  if (req.headers.authorization !== `Bearer ${ADMIN_PASSWORD}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};
