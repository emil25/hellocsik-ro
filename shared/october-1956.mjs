export const OCTOBER_1956_END = Date.parse("2026-10-24T00:00:00+03:00");
const firstDay = Date.parse("2026-10-19T00:00:00+03:00");
const curatedIds = new Set([121, 133]);

/** Curated existing programs plus explicitly related, current 2026 events. */
export function october1956Programs(events, now = Date.now()) {
  if (now >= OCTOBER_1956_END) return [];
  return events.filter(event => {
    const start = Date.parse(event.startDate);
    const end = Date.parse(event.endDate || event.startDate);
    if (!Number.isFinite(start) || start < firstDay || start >= OCTOBER_1956_END || end < now) return false;
    return curatedIds.has(Number(event.id)) || /1956|[’']56-os|magyar orpheusz/i.test(`${event.title} ${event.description ?? ""}`);
  }).sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
}
