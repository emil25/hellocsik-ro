import type { RequestHandler } from "express";
import { assertEventRange, parseEventDate } from "../../../../shared/event-time.mjs";

/** Normalize before schema coercion so unzoned input is independent of server TZ. */
export const normalizeEventDates: RequestHandler = (req, res, next) => {
  try {
    const body = req.body ?? {};
    if (Object.hasOwn(body, "startDate")) body.startDate = parseEventDate(body.startDate).toISOString();
    if (Object.hasOwn(body, "endDate")) body.endDate = body.endDate == null || body.endDate === "" ? null : parseEventDate(body.endDate).toISOString();
    if (body.startDate) assertEventRange(body.startDate, body.endDate);
    next();
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Érvénytelen időpont." });
  }
};
