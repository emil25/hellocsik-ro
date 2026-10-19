import { eventDateKey, eventOccursOnDate } from "./event-time.mjs";
import {
  REGION_PLACES,
  regionPlaceForEvent,
  regionAreaForEvent,
  normalizePlaceText,
} from "./region-places.mjs";

export const DISCOVERY_DATES = [
  "all",
  "today",
  "tomorrow",
  "week",
  "weekend",
  "next-week",
  "month",
];
export function discoveryDateRange(filter, now = new Date()) {
  const today = eventDateKey(now),
    from = new Date(today + "T12:00:00"),
    to = new Date(from);
  if (filter === "all") return null;
  if (filter === "tomorrow") {
    from.setDate(from.getDate() + 1);
    to.setTime(from.getTime());
  }
  if (filter === "week") to.setDate(from.getDate() + ((7 - from.getDay()) % 7));
  if (filter === "next-week") {
    from.setDate(from.getDate() + 7 - ((from.getDay() + 6) % 7));
    to.setTime(from.getTime());
    to.setDate(from.getDate() + 6);
  }
  if (filter === "weekend") {
    from.setDate(
      from.getDate() +
        (from.getDay() === 0
          ? -2
          : from.getDay() === 6
            ? -1
            : (5 - from.getDay() + 7) % 7),
    );
    to.setTime(from.getTime());
    to.setDate(from.getDate() + 2);
  }
  if (filter === "month") to.setMonth(to.getMonth() + 1, 0);
  return { from: eventDateKey(from), to: eventDateKey(to) };
}
export function isFreeEvent(event) {
  const price = normalizePlaceText(event.price ?? "");
  return /^(?:ingyenes|ingyenes belepes|belepes ingyenes|gratuit|intrare gratuita|free|free entry|0(?: 0+)?(?: ron| lej| lei| ft)?)$/.test(
    price,
  );
}
export function matchesDiscoveryEvent(event, filters = {}, now = new Date()) {
  const end = Date.parse(event.endDate || event.startDate);
  if (!Number.isFinite(end) || end < now.getTime()) return false;
  const place = regionPlaceForEvent(event),
    area = regionAreaForEvent(event);
  if (filters.area && area?.slug !== filters.area) return false;
  if (filters.city === "other" && place) return false;
  if (filters.city && filters.city !== "other") {
    if (filters.city === "csik-kornyeke") {
      if (area?.slug !== "csik" || place?.slug === "csikszereda") return false;
    } else if (filters.nearby) {
      const selected = REGION_PLACES.find((item) => item.slug === filters.city);
      if (!selected || place?.area !== selected.area) return false;
    } else if (place?.slug !== filters.city) return false;
  }
  if (
    filters.category &&
    (event.category?.slug ?? "program") !== filters.category
  )
    return false;
  if (filters.free && !isFreeEvent(event)) return false;
  const text = normalizePlaceText(
    [
      event.title,
      event.description,
      event.location,
      event.locationAddress,
      event.organizerName,
      event.organizer?.name,
      place?.name,
      area?.name,
      event.category?.name,
      ...(event.tags ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );
  if (
    normalizePlaceText(filters.query ?? "")
      .split(" ")
      .filter(Boolean)
      .some((word) => !text.includes(word))
  )
    return false;
  if (filters.day) return eventOccursOnDate(event, filters.day);
  const range = discoveryDateRange(filters.date ?? "all", now);
  const from = filters.from || range?.from,
    to = filters.to || range?.to;
  const starts = eventDateKey(event.startDate),
    ends =
      event.endDate && Date.parse(event.endDate) > Date.parse(event.startDate)
        ? eventDateKey(new Date(Date.parse(event.endDate) - 1))
        : eventDateKey(event.startDate);
  return (!from || ends >= from) && (!to || starts <= to);
}
export function sortDiscoveryEvents(events, order = "date", now = new Date()) {
  return [...events].sort((a, b) =>
    order === "newest"
      ? Date.parse(b.createdAt || b.updatedAt || b.startDate) -
        Date.parse(a.createdAt || a.updatedAt || a.startDate)
      : Math.max(Date.parse(a.startDate), now.getTime()) -
          Math.max(Date.parse(b.startDate), now.getTime()) ||
        Date.parse(b.startDate) - Date.parse(a.startDate),
  );
}
