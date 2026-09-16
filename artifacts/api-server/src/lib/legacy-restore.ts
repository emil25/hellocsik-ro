import { db, eventsTable, categoriesTable } from "@workspace/db";
import { LEGACY_EVENTS } from "../data/legacy-events";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sourceUrl(value: string) {
  try {
    const parsed = new URL(value);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return value.trim().toLowerCase().replace(/\/$/, "");
  }
}

function readSourceUrls(values: string[]) {
  return values.flatMap((value) => {
    try {
      const parsed = JSON.parse(value) as { url?: unknown };
      return typeof parsed.url === "string" ? [sourceUrl(parsed.url)] : [];
    } catch {
      return /^https?:\/\//i.test(value) ? [sourceUrl(value)] : [];
    }
  });
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function categoryName(value: string | null) {
  if (!value) return null;
  const normalized = normalize(value);
  if (normalized === "zene" || normalized === "koncert") return "Koncert";
  if (normalized === "tanc") return "Közösség";
  return value;
}

/**
 * The original local database contained manually curated public events. Render
 * was connected to a fresh database, so restore those records once at startup.
 * The title/date and source checks make this safe on every subsequent restart.
 */
export async function restoreLegacyEvents() {
  const [existing, categories] = await Promise.all([
    db.select({ title: eventsTable.title, startDate: eventsTable.startDate, newsLinks: eventsTable.newsLinks }).from(eventsTable),
    db.select({ id: categoriesTable.id, name: categoriesTable.name }).from(categoriesTable),
  ]);

  const knownTitleDates = new Set(existing.map((event) => `${normalize(event.title)}|${dateKey(event.startDate)}`));
  const knownSources = new Set(existing.flatMap((event) => readSourceUrls(event.newsLinks ?? [])));
  const categoryIds = new Map(categories.map((category) => [normalize(category.name), category.id]));
  let restored = 0;

  for (const event of LEGACY_EVENTS) {
    const startDate = new Date(event.startDate);
    if (!event.title.trim() || Number.isNaN(startDate.getTime())) continue;

    const key = `${normalize(event.title)}|${dateKey(startDate)}`;
    const urls = readSourceUrls(event.newsLinks);
    if (knownTitleDates.has(key) || urls.some((url) => knownSources.has(url))) continue;

    const mappedCategory = categoryName(event.category);
    const categoryId = mappedCategory ? categoryIds.get(normalize(mappedCategory)) ?? null : null;
    await db.insert(eventsTable).values({
      title: event.title.trim(),
      description: event.description?.trim() || "Részletek a forrásoldalon.",
      imageUrl: event.imageUrl?.trim() || "/hellocsik-logo.png",
      startDate,
      endDate: event.endDate ? new Date(event.endDate) : null,
      location: event.location.trim() || "Székelyföld",
      locationAddress: event.locationAddress?.trim() || null,
      categoryId,
      featured: event.featured,
      monthHighlight: event.monthHighlight,
      ticketUrl: event.ticketUrl?.trim() || null,
      price: event.price?.trim() || null,
      tags: event.tags ?? [],
      newsLinks: event.newsLinks ?? [],
      status: "published",
    });

    knownTitleDates.add(key);
    for (const url of urls) knownSources.add(url);
    restored++;
  }

  return restored;
}
