import { db, eventsTable, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { extractEventListing, isFirecrawlConfigured, type ExtractedEvent } from "./firecrawl";

const VISIT_HARGHITA_EVENTS = "https://visitharghita.com/hu/events";
// Keep automatic imports inside the three-county Székelyföld region.
// The source sites mix Hungarian and Romanian place names, so both forms are included.
const REGION_PLACE = /(?:székelyföld|secuime|hargita|harghita|kovászna|covasna|maros|mureș|mures|csíkszereda|miercurea\s+ciuc|csíksomlyó|șumuleu|székelyudvarhely|odorheiu\s+secuiesc|gyergyószentmiklós|gheorgheni|toplița|toplita|székelykeresztúr|cristuru\s+secuiesc|balánbánya|bălan|szováta|sovata|sepsiszentgyörgy|sfântu\s+gheorghe|sfantu\s+gheorghe|kézdivásárhely|târgu\s+secuiesc|targu\s+secuiesc|barót|baraolt|bodzaforduló|întorsura\s+buzăului|marosvásárhely|târgu\s+mureș|targu\s+mures|szászrégen|reghin|erdőszentgyörgy|sângeorgiu\s+de\s+pădure|nyárádszereda|măgherani|madéfalva|siculeni|ciceu|szépvíz|frumoasa|sântimbru|sintimbru)/i;
const MONTHS: Record<string, number> = {
  januar: 0, "január": 0, februar: 1, "február": 1, marcius: 2, "március": 2,
  aprilis: 3, "április": 3, majus: 4, "május": 4, junius: 5, "június": 5,
  julius: 6, "július": 6, augusztus: 7, szeptember: 8, oktober: 9, "október": 9,
  november: 10, december: 11,
};

type SourceCard = { path: string; category: string; location: string };
type SyncResult = { source: string; examined: number; local: number; imported: number; skipped: number; failed: number; ranAt: string };

type FirecrawlSource = { name: string; url: string };

const DEFAULT_FIRECRAWL_SOURCES: FirecrawlSource[] = [
  { name: "szereda.ro", url: "https://szereda.ro/esemenyek" },
  { name: "ProKult", url: "https://prokult.ro/szakszervezetek-muvelodesi-haza-csikszereda" },
];

let running: Promise<SyncResult> | null = null;
let firecrawlRunning: Promise<SyncResult> | null = null;
let lastResult: SyncResult | null = null;

function decodeHtml(value: string) {
  const named: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, key: string) => {
    if (/^#x/i.test(key)) return String.fromCodePoint(parseInt(key.slice(2), 16));
    if (key.startsWith("#")) return String.fromCodePoint(parseInt(key.slice(1), 10));
    return named[key.toLowerCase()] ?? entity;
  });
}

function plainText(html: string) {
  return decodeHtml(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:div|p|li|h\d)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function readMeta(html: string, property: string) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const forward = new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i");
  const reverse = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["']`, "i");
  return decodeHtml(html.match(forward)?.[1] ?? html.match(reverse)?.[1] ?? "").trim();
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function localDateKey(date: Date) {
  return date.toLocaleDateString("sv-SE", { timeZone: "Europe/Bucharest" });
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; HelloCsik source sync)", "accept-language": "hu-HU,hu;q=0.9" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${new URL(url).hostname}: HTTP ${response.status}`);
  return response.text();
}

function parseCards(html: string): SourceCard[] {
  return html.split('<div class="event-box').slice(1).map(block => {
    const path = block.match(/href=["'](\/hu\/events\/[^"'?]+)["']/i)?.[1] ?? "";
    const category = plainText(block.match(/class=["']category_tag[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "");
    const info = block.match(/class=["']date_and_address[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? "";
    return { path, category, location: plainText(info).replace(/^Kezdődik\s+\d{1,2}:\d{2}\s*\|?\s*/i, "") };
  }).filter(card => card.path);
}

function parseDate(html: string) {
  const match = html.match(/(?:hétfő|kedd|szerda|csütörtök|péntek|szombat|vasárnap)\s*,\s*(\d{1,2})\s+([\p{L}]+)\s+(\d{4})[\s\S]{0,350}?(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?/iu);
  if (!match) return null;
  const month = MONTHS[normalize(match[2]).replace(/ /g, "")] ?? MONTHS[match[2].toLowerCase()];
  if (month === undefined) return null;
  const [hour, minute] = match[4].split(":").map(Number);
  const startDate = new Date(Number(match[3]), month, Number(match[1]), hour, minute);
  let endDate: Date | null = null;
  if (match[5]) {
    const [endHour, endMinute] = match[5].split(":").map(Number);
    endDate = new Date(Number(match[3]), month, Number(match[1]), endHour, endMinute);
    if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
  }
  return { startDate, endDate };
}

function parseDescription(html: string) {
  const start = html.indexOf('<div class="description');
  if (start < 0) return "";
  const end = html.indexOf('<div class="similar_container', start);
  return plainText(html.slice(start, end > start ? end : start + 12_000)).slice(0, 12_000);
}

function parseLocation(html: string, fallback: string) {
  const address = plainText(html.match(/<p class=["']text-gray-700 line-clamp-1["']>([\s\S]*?)<\/p>/i)?.[1] ?? "");
  const organizer = plainText(html.match(/class=["'][^"']*link-underline-animation[^"']*["'][^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "");
  return { location: organizer || fallback || address || "Székelyföld", address: address || fallback || null };
}

function categoryCandidates(sourceCategory: string) {
  const value = normalize(sourceCategory);
  if (value.includes("szinhaz") || value.includes("eloadas")) return ["Színház", "Közösség"];
  if (value.includes("koncert") || value.includes("zene")) return ["Koncert", "Közösség"];
  if (value.includes("sport")) return ["Sport", "Közösség"];
  if (value.includes("fesztival")) return ["Fesztivál", "Közösség"];
  if (value.includes("kiallitas")) return ["Kiállítás", "Közösség"];
  if (value.includes("tanc")) return ["Tánc", "Közösség"];
  if (value.includes("family") || value.includes("csaladi")) return ["Családi program", "Közösség"];
  return ["Közösség"];
}

function parseFirecrawlSources(): FirecrawlSource[] {
  const configured = process.env.FIRECRAWL_EVENT_SOURCES?.trim();
  if (!configured) return DEFAULT_FIRECRAWL_SOURCES;
  return configured.split(",").map((entry, index) => {
    const [name, ...urlParts] = entry.trim().split("|");
    const url = urlParts.join("|").trim() || name;
    return { name: urlParts.length ? name.trim() : `Forrás ${index + 1}`, url };
  }).filter(source => /^https?:\/\//i.test(source.url));
}

function absoluteUrl(value: string | null | undefined, base: string) {
  if (!value) return null;
  try { return new URL(value, base).toString(); }
  catch { return null; }
}

function validExtractedEvent(event: ExtractedEvent) {
  const startDate = new Date(event.startDate);
  if (!event.title?.trim() || !event.location?.trim() || Number.isNaN(startDate.getTime())) return null;
  const endDate = event.endDate ? new Date(event.endDate) : null;
  if (endDate && Number.isNaN(endDate.getTime())) return null;
  const expiry = endDate ?? startDate;
  if (expiry.getTime() < Date.now() - 86_400_000) return null;
  return { startDate, endDate: endDate && endDate >= startDate ? endDate : null };
}

async function runFirecrawlSync(): Promise<SyncResult> {
  const sources = parseFirecrawlSources();
  const [existing, categories] = await Promise.all([
    db.select({ title: eventsTable.title, startDate: eventsTable.startDate, newsLinks: eventsTable.newsLinks }).from(eventsTable),
    db.select().from(categoriesTable),
  ]);
  const knownUrls = new Set<string>();
  const knownTitleDates = new Set(existing.map(event => `${normalize(event.title)}|${localDateKey(event.startDate)}`));
  for (const event of existing) for (const raw of event.newsLinks ?? []) {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.url === "string") knownUrls.add(parsed.url);
    } catch {
      if (/^https?:\/\//.test(raw)) knownUrls.add(raw);
    }
  }

  let examined = 0;
  let local = 0;
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const source of sources) {
    let extracted: ExtractedEvent[];
    try { extracted = await extractEventListing(source.url); }
    catch { failed++; continue; }
    examined += extracted.length;

    for (const event of extracted) {
      const dates = validExtractedEvent(event);
      if (!dates) { skipped++; continue; }
      if (!REGION_PLACE.test(`${event.title} ${event.location} ${event.address ?? ""}`)) { skipped++; continue; }
      local++;

      const eventUrl = absoluteUrl(event.eventUrl, source.url) ?? source.url;
      const key = `${normalize(event.title)}|${localDateKey(dates.startDate)}`;
      if (knownUrls.has(eventUrl) || knownTitleDates.has(key)) { skipped++; continue; }

      const sourceNames = categoryCandidates(event.category ?? "").map(normalize);
      const category = categories.find(item => sourceNames.includes(normalize(item.name))) ?? null;
      const imageUrl = absoluteUrl(event.imageUrl, source.url) ?? "/hellocsik-logo.png";
      await db.insert(eventsTable).values({
        title: event.title.trim(),
        description: event.description?.trim() || "Részletek a forrásoldalon.",
        imageUrl,
        startDate: dates.startDate,
        endDate: dates.endDate,
        location: event.location.trim(),
        locationAddress: event.address?.trim() || null,
        categoryId: category?.id ?? null,
        featured: false,
        monthHighlight: false,
        ticketUrl: eventUrl,
        price: event.price?.trim() || null,
        tags: ["automatikus-import", "Firecrawl", source.name],
        newsLinks: [JSON.stringify({ title: source.name, url: eventUrl })],
        status: "pending",
      });
      knownUrls.add(eventUrl);
      knownTitleDates.add(key);
      imported++;
    }
  }

  return { source: "Firecrawl", examined, local, imported, skipped, failed, ranAt: new Date().toISOString() };
}

function syncFirecrawlEvents() {
  if (!firecrawlRunning) firecrawlRunning = runFirecrawlSync().finally(() => { firecrawlRunning = null; });
  return firecrawlRunning;
}

async function runVisitHarghitaSync(): Promise<SyncResult> {
  const listing = await fetchHtml(VISIT_HARGHITA_EVENTS);
  const cards = parseCards(listing).slice(0, 40);
  const [existing, categories] = await Promise.all([
    db.select({ id: eventsTable.id, title: eventsTable.title, startDate: eventsTable.startDate, newsLinks: eventsTable.newsLinks }).from(eventsTable),
    db.select().from(categoriesTable),
  ]);
  const knownUrls = new Set<string>();
  const knownUrlEventIds = new Map<string, number>();
  const knownTitleDates = new Set(existing.map(event => `${normalize(event.title)}|${localDateKey(event.startDate)}`));
  for (const event of existing) for (const raw of event.newsLinks ?? []) {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.url === "string") {
        knownUrls.add(parsed.url);
        knownUrlEventIds.set(parsed.url, event.id);
      }
    }
    catch {
      if (/^https?:\/\//.test(raw)) {
        knownUrls.add(raw);
        knownUrlEventIds.set(raw, event.id);
      }
    }
  }

  let imported = 0;
  let skipped = 0;
  let failed = 0;
  let local = 0;
  const candidates: Array<{ card: SourceCard; sourceUrl: string }> = [];
  for (const card of cards) {
    const sourceUrl = new URL(card.path, VISIT_HARGHITA_EVENTS).toString();
    if (knownUrls.has(sourceUrl)) {
      const existingId = knownUrlEventIds.get(sourceUrl);
      if (existingId) await db.update(eventsTable).set({ updatedAt: new Date() }).where(eq(eventsTable.id, existingId));
      skipped++;
    }
    else candidates.push({ card, sourceUrl });
  }
  for (let index = 0; index < candidates.length; index += 5) {
    const batch = candidates.slice(index, index + 5);
    const details = await Promise.allSettled(batch.map(async candidate => ({ ...candidate, html: await fetchHtml(candidate.sourceUrl) })));
    for (const detail of details) {
      if (detail.status === "rejected") { failed++; continue; }
      const { card, sourceUrl, html } = detail.value;
      const title = readMeta(html, "og:title");
      const dates = parseDate(html);
      if (!title || !dates || dates.startDate < new Date(Date.now() - 86_400_000)) { skipped++; continue; }
      const place = parseLocation(html, card.location);
      if (!REGION_PLACE.test(`${title} ${card.location} ${place.location} ${place.address ?? ""}`)) { skipped++; continue; }
      local++;
      const key = `${normalize(title)}|${localDateKey(dates.startDate)}`;
      if (knownTitleDates.has(key)) { skipped++; continue; }
      const sourceNames = categoryCandidates(card.category).map(normalize);
      const category = categories.find(item => sourceNames.includes(normalize(item.name))) ?? null;
      const ticketUrl = decodeHtml(html.match(/href=["']([^"']+)["'][^>]*>\s*Jegyek\s*<\/a>/i)?.[1] ?? "");
      const imageUrl = readMeta(html, "og:image") || "/hellocsik-logo.png";
      await db.insert(eventsTable).values({
        title,
        description: parseDescription(html),
        imageUrl,
        startDate: dates.startDate,
        endDate: dates.endDate,
        location: place.location,
        locationAddress: place.address,
        categoryId: category?.id ?? null,
        featured: false,
        monthHighlight: false,
        ticketUrl: ticketUrl ? new URL(ticketUrl, sourceUrl).toString() : sourceUrl,
        price: null,
        tags: ["automatikus-import", "Visit Harghita"],
        newsLinks: [JSON.stringify({ title: "Visit Harghita", url: sourceUrl })],
        status: "pending",
      });
      knownUrls.add(sourceUrl);
      knownTitleDates.add(key);
      imported++;
    }
  }

  lastResult = { source: "Visit Harghita", examined: cards.length, local, imported, skipped, failed, ranAt: new Date().toISOString() };
  return lastResult;
}

export function syncVisitHarghitaEvents() {
  if (!running) running = runVisitHarghitaSync().finally(() => { running = null; });
  return running;
}

export async function syncEventSources() {
  const visit = await syncVisitHarghitaEvents();
  if (!isFirecrawlConfigured()) return { ...visit, firecrawlConfigured: false };
  const firecrawl = await syncFirecrawlEvents();
  lastResult = {
    source: "Visit Harghita + Firecrawl",
    examined: visit.examined + firecrawl.examined,
    local: visit.local + firecrawl.local,
    imported: visit.imported + firecrawl.imported,
    skipped: visit.skipped + firecrawl.skipped,
    failed: visit.failed + firecrawl.failed,
    ranAt: new Date().toISOString(),
  };
  return { ...lastResult, firecrawlConfigured: true };
}

export function getLastSourceSync() { return lastResult; }

export function startSourceSyncScheduler(log: { info: (data: unknown, message: string) => void; warn: (data: unknown, message: string) => void }) {
  const sync = () => syncVisitHarghitaEvents()
    .then(result => log.info({ result }, "Automatic event source sync completed"))
    .catch(err => log.warn({ err }, "Automatic event source sync failed"));
  const first = setTimeout(sync, 30_000);
  const recurring = setInterval(sync, 6 * 60 * 60 * 1000);
  first.unref(); recurring.unref();

  if (isFirecrawlConfigured()) {
    const firecrawlSync = () => syncFirecrawlEvents()
      .then(result => log.info({ result }, "Firecrawl event source sync completed"))
      .catch(err => log.warn({ err }, "Firecrawl event source sync failed"));
    const firecrawlFirst = setTimeout(firecrawlSync, 2 * 60_000);
    const firecrawlRecurring = setInterval(firecrawlSync, 24 * 60 * 60 * 1000);
    firecrawlFirst.unref(); firecrawlRecurring.unref();
  }
}
