import { normalizeSourceUrl } from "./event-source-url.mjs";
import { regionPlaceForEvent, normalizePlaceText } from "./region-places.mjs";
import { eventDateKey } from "./event-time.mjs";
const generic = new Set([
  "csikszereda",
  "csikszeredaban",
  "miercurea",
  "ciuc",
  "esemeny",
  "rendezveny",
  "program",
  "eloadas",
  "koncert",
  "oktober",
  "november",
  "december",
  "2026",
]);
const tokens = (value) =>
  new Set(
    normalizePlaceText(value)
      .split(" ")
      .filter((word) => word.length >= 4 && !generic.has(word)),
  );
export function similarEventTitle(left, right) {
  if (normalizePlaceText(left) === normalizePlaceText(right)) return true;
  const firstLeft=normalizePlaceText(left.split("|")[0]), firstRight=normalizePlaceText(right.split("|")[0]);
  if(firstLeft.length>=5 && firstLeft===firstRight)return true;
  const a = tokens(left),
    b = tokens(right);
  if (Math.min(a.size, b.size) < 2) return false;
  const shared = [...a].filter((word) => b.has(word)).length;
  return shared >= 2 && shared / Math.min(a.size, b.size) >= 0.75;
}
export function importSourceUrls(event) {
  const urls = (event.newsLinks ?? []).flatMap((raw) => {
    try {
      const v = JSON.parse(raw);
      return typeof v.url === "string" && v.url.trim()
        ? [normalizeSourceUrl(v.url)]
        : [];
    } catch {
      return /^https?:/.test(raw) ? [normalizeSourceUrl(raw)] : [];
    }
  });
  if (event.ticketUrl) urls.push(normalizeSourceUrl(event.ticketUrl));
  return urls;
}
export function findImportedEvent(events, candidate) {
  const urls = new Set(candidate.urls ?? importSourceUrls(candidate));
  return events.find((event) => {
    if (urls.size && importSourceUrls(event).some((url) => urls.has(url)))
      return true;
    if (
      eventDateKey(event.startDate) !== eventDateKey(candidate.startDate) ||
      !similarEventTitle(event.title, candidate.title)
    )
      return false;
    if(Math.abs(new Date(event.startDate).getTime()-new Date(candidate.startDate).getTime())>300000)return false;
    const left = regionPlaceForEvent(event),
      right = regionPlaceForEvent(candidate);
    if (left && right) return left.slug === right.slug;
    const a = normalizePlaceText(event.location),
      b = normalizePlaceText(candidate.location);
    return Boolean(a && b && a === b);
  });
}
