export const EVENT_TIME_ZONE = "Europe/Bucharest";

const formatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: EVENT_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

function localParts(value) {
  const parts = Object.fromEntries(formatter.formatToParts(value).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

/** Interpret unzoned form values in the event's timezone, never the machine's. */
export function parseEventDate(value) {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) throw new RangeError("Érvénytelen időpont.");
    return new Date(value);
  }
  if (typeof value !== "string") throw new RangeError("Érvénytelen időpont.");
  const input = value.trim();
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/i.exec(input);
  if (!match) throw new RangeError("Érvénytelen időpont.");
  const wallTime = `${match[1]}T${match[2]}:${match[3] ?? "00"}`;
  const utc = new Date(`${wallTime}.${(match[4] ?? "0").padEnd(3, "0")}Z`);
  // Date normalizes impossible days such as February 30; reject those explicitly.
  if (!Number.isFinite(utc.getTime()) || utc.toISOString().slice(0, 19) !== wallTime) {
    throw new RangeError("Érvénytelen időpont.");
  }
  if (match[5]) {
    const instant = new Date(input);
    if (!Number.isFinite(instant.getTime())) throw new RangeError("Érvénytelen időpont.");
    return instant;
  }
  // Derive both offsets around the date, including a possible DST transition.
  const offsets = new Set([-2, 0, 2].map(days => {
    const sample = new Date(utc.getTime() + days * 86400000);
    return new Date(`${localParts(sample)}Z`).getTime() - Math.floor(sample.getTime() / 1000) * 1000;
  }));
  const candidates = [...offsets].map(offset => new Date(utc.getTime() - offset))
    .filter(candidate => localParts(candidate) === wallTime)
    .sort((a, b) => a - b);
  if (!candidates.length) throw new RangeError("Ez az időpont az óraátállítás miatt nem létezik. Válassz másik időpontot.");
  // The earlier occurrence is the default during the repeated autumn hour.
  return candidates[0];
}

export function eventDateKey(value) {
  return localParts(parseEventDate(value)).slice(0, 10);
}

export function toEventInput(value) {
  return value ? localParts(parseEventDate(value)).slice(0, 16) : "";
}

export function eventInputToISO(value, original) {
  // Keep seconds and the original DST occurrence when an input is unchanged.
  if (original && toEventInput(original) === value) return parseEventDate(original).toISOString();
  return parseEventDate(value).toISOString();
}

export function eventOccursOnDate(event, day) {
  const start = parseEventDate(event.startDate);
  if (!event.endDate) return eventDateKey(start) === day;
  const end = parseEventDate(event.endDate);
  if (end <= start) return eventDateKey(start) === day;
  // The ending instant is exclusive: ending at midnight doesn't occupy the next day.
  return eventDateKey(start) <= day && eventDateKey(new Date(end.getTime() - 1)) >= day;
}

export function assertEventRange(start, end) {
  if (end && parseEventDate(end) < parseEventDate(start)) {
    throw new RangeError("A befejezés nem lehet korábbi a kezdésnél.");
  }
}
