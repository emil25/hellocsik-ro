import { db, eventsTable, categoriesTable } from "@workspace/db";
import { findImportedEvent } from "../../../../shared/event-import-match.mjs";
import {
  harghitaEventDates,
  covasnaVenueReferences,
  covasnaVenueAddress,
  covasnaCards,
  covasnaFramePath,
  covasnaMonthPaths,
  muresCards,
  parseRegionalSource,
} from "../../../../shared/regional-source-parser.mjs";
import { eq } from "drizzle-orm";
import { normalizeSourceUrl } from "../../../../shared/event-source-url.mjs";
import {
  extractEventListing,
  isFirecrawlConfigured,
  type ExtractedEvent,
} from "./firecrawl";

const VISIT_HARGHITA_EVENTS = "https://visitharghita.com/hu/events";
// Keep automatic imports inside the three-county Székelyföld region.
// The source sites mix Hungarian and Romanian place names, so both forms are included.
const REGION_PLACE =
  /(?:székelyföld|secuime|hargita|harghita|kovászna|covasna|maros|mureș|mures|csíkszereda|miercurea\s+ciuc|csíksomlyó|șumuleu|székelyudvarhely|odorheiu\s+secuiesc|gyergyószentmiklós|gheorgheni|toplița|toplita|székelykeresztúr|cristuru\s+secuiesc|balánbánya|bălan|szováta|sovata|sepsiszentgyörgy|sfântu\s+gheorghe|sfantu\s+gheorghe|kézdivásárhely|târgu\s+secuiesc|targu\s+secuiesc|barót|baraolt|bodzaforduló|întorsura\s+buzăului|marosvásárhely|târgu\s+mureș|targu\s+mures|szászrégen|reghin|erdőszentgyörgy|sângeorgiu\s+de\s+pădure|nyárádszereda|măgherani|madéfalva|siculeni|ciceu|szépvíz|frumoasa|sântimbru|sintimbru)/i;
const MONTHS: Record<string, number> = {
  januar: 0,
  január: 0,
  februar: 1,
  február: 1,
  marcius: 2,
  március: 2,
  aprilis: 3,
  április: 3,
  majus: 4,
  május: 4,
  junius: 5,
  június: 5,
  julius: 6,
  július: 6,
  augusztus: 7,
  szeptember: 8,
  oktober: 9,
  október: 9,
  november: 10,
  december: 11,
};

type SourceCard = { path: string; category: string; location: string };
type SyncResult = {
  source: string;
  examined: number;
  local: number;
  imported: number;
  skipped: number;
  failed: number;
  ranAt: string;
};

type FirecrawlSource = { name: string; url: string };

const DEFAULT_FIRECRAWL_SOURCES: FirecrawlSource[] = [
  { name: "szereda.ro", url: "https://szereda.ro/esemenyek" },
  {
    name: "ProKult",
    url: "https://prokult.ro/szakszervezetek-muvelodesi-haza-csikszereda",
  },
];

let running: Promise<SyncResult> | null = null;
let firecrawlRunning: Promise<SyncResult> | null = null;
let lastResult: SyncResult | null = null;

function decodeHtml(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
  };
  return value.replace(
    /&(#x[\da-f]+|#\d+|[a-z]+);/gi,
    (entity, key: string) => {
      if (/^#x/i.test(key))
        return String.fromCodePoint(parseInt(key.slice(2), 16));
      if (key.startsWith("#"))
        return String.fromCodePoint(parseInt(key.slice(1), 10));
      return named[key.toLowerCase()] ?? entity;
    },
  );
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
  const forward = new RegExp(
    `<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const reverse = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["']`,
    "i",
  );
  return decodeHtml(
    html.match(forward)?.[1] ?? html.match(reverse)?.[1] ?? "",
  ).trim();
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const GENERIC_TITLE_WORDS = new Set([
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

function titleTokens(value: string) {
  return new Set(
    normalize(value)
      .split(" ")
      .filter((token) => token.length >= 4 && !GENERIC_TITLE_WORDS.has(token)),
  );
}

function likelySameEventTitle(left: string, right: string) {
  if (normalize(left) === normalize(right)) return true;
  const a = titleTokens(left);
  const b = titleTokens(right);
  if (Math.min(a.size, b.size) < 2) return false;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared++;
  return shared >= 2 && shared / Math.min(a.size, b.size) >= 0.75;
}

function eventSourceUrls(
  newsLinks: string[] | null | undefined,
  ticketUrl?: string | null,
) {
  const urls = (newsLinks ?? []).flatMap((raw) => {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed?.url === "string" && parsed.url.trim()
        ? [normalizeSourceUrl(parsed.url)]
        : [];
    } catch {
      return /^https?:\/\//i.test(raw) ? [normalizeSourceUrl(raw)] : [];
    }
  });
  if (ticketUrl?.trim()) urls.push(normalizeSourceUrl(ticketUrl));
  return urls;
}

type ExistingEvent = {
  id: number;
  title: string;
  startDate: Date;
  newsLinks: string[] | null;
  ticketUrl: string | null;
  location: string;
  locationAddress: string | null;
};

function findMatchingEvent(
  events: ExistingEvent[],
  title: string,
  startDate: Date,
  sourceUrls: Set<string>,
  place?: { location: string; locationAddress?: string | null },
) {
  return findImportedEvent(events, {
    title,
    startDate,
    urls: sourceUrls,
    ...place,
  });
}

async function rememberSource(
  event: ExistingEvent,
  sourceName: string,
  sourceUrl: string,
) {
  const canonicalUrl = normalizeSourceUrl(sourceUrl);
  const links = [...(event.newsLinks ?? [])];
  if (eventSourceUrls(links).includes(canonicalUrl)) return;
  links.push(JSON.stringify({ title: sourceName, url: sourceUrl }));
  await db
    .update(eventsTable)
    .set({ newsLinks: links, updatedAt: new Date() })
    .where(eq(eventsTable.id, event.id));
  event.newsLinks = links;
}

function localDateKey(date: Date) {
  return date.toLocaleDateString("sv-SE", { timeZone: "Europe/Bucharest" });
}

async function fetchHtml(url: string, turboFrame = false) {
  const response = await fetch(url, {
    headers: {
      ...(turboFrame ? { "Turbo-Frame": "page_content" } : {}),
      "user-agent": "Mozilla/5.0 (compatible; HelloCsik source sync)",
      "accept-language": "hu-HU,hu;q=0.9",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok)
    throw new Error(`${new URL(url).hostname}: HTTP ${response.status}`);
  return response.text();
}

function parseCards(html: string): SourceCard[] {
  return html
    .split('<div class="event-box')
    .slice(1)
    .map((block) => {
      const path =
        block.match(/href=["'](\/hu\/events\/[^"'?]+)["']/i)?.[1] ?? "";
      const category = plainText(
        block.match(
          /class=["']category_tag[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,
        )?.[1] ?? "",
      );
      const info =
        block.match(
          /class=["']date_and_address[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
        )?.[1] ?? "";
      return {
        path,
        category,
        location: plainText(info).replace(
          /^Kezdődik\s+\d{1,2}:\d{2}\s*\|?\s*/i,
          "",
        ),
      };
    })
    .filter((card) => card.path);
}

const parseDate = harghitaEventDates;

function parseDescription(html: string) {
  const start = html.indexOf('<div class="description');
  if (start < 0) return "";
  const end = html.indexOf('<div class="similar_container', start);
  return plainText(html.slice(start, end > start ? end : start + 12_000)).slice(
    0,
    12_000,
  );
}

function parseOrganizer(description: string) {
  const match = description.match(
    /(?:^|\n)\s*(?:szervező(?:k)?|organizator(?:ul)?|organizatorii)\s*:\s*([^\n]+)/i,
  );
  return match?.[1]?.trim() || null;
}

function parseLocation(html: string, fallback: string) {
  const address = plainText(
    html.match(
      /<p class=["']text-gray-700 line-clamp-1["']>([\s\S]*?)<\/p>/i,
    )?.[1] ?? "",
  );
  const organizer = plainText(
    html.match(
      /class=["'][^"']*link-underline-animation[^"']*["'][^>]*>([\s\S]*?)<\/a>/i,
    )?.[1] ?? "",
  );
  return {
    location: organizer || fallback || address || "Székelyföld",
    address: address || fallback || null,
  };
}

function categoryCandidates(sourceCategory: string) {
  const value = normalize(sourceCategory);
  if (value.includes("szinhaz")) return ["Színház", "Közösség"];
  if (value.includes("koncert") || value.includes("zene"))
    return ["Koncert", "Közösség"];
  if (value.includes("sport")) return ["Sport", "Közösség"];
  if (value.includes("fesztival")) return ["Fesztivál", "Közösség"];
  if (value.includes("kiallitas")) return ["Kiállítás", "Közösség"];
  if (value.includes("tanc")) return ["Tánc", "Közösség"];
  if (value.includes("family") || value.includes("csaladi"))
    return ["Családi program", "Közösség"];
  return ["Közösség"];
}

function parseFirecrawlSources(): FirecrawlSource[] {
  const configured = process.env.FIRECRAWL_EVENT_SOURCES?.trim();
  if (!configured) return DEFAULT_FIRECRAWL_SOURCES;
  return configured
    .split(",")
    .map((entry, index) => {
      const [name, ...urlParts] = entry.trim().split("|");
      const url = urlParts.join("|").trim() || name;
      return {
        name: urlParts.length ? name.trim() : `Forrás ${index + 1}`,
        url,
      };
    })
    .filter((source) => /^https?:\/\//i.test(source.url));
}

function absoluteUrl(value: string | null | undefined, base: string) {
  if (!value) return null;
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

function validExtractedEvent(event: ExtractedEvent) {
  const startDate = new Date(event.startDate);
  if (
    !event.title?.trim() ||
    !event.location?.trim() ||
    Number.isNaN(startDate.getTime())
  )
    return null;
  const endDate = event.endDate ? new Date(event.endDate) : null;
  if (endDate && Number.isNaN(endDate.getTime())) return null;
  const expiry = endDate ?? startDate;
  if (expiry.getTime() < Date.now() - 86_400_000) return null;
  return {
    startDate,
    endDate: endDate && endDate >= startDate ? endDate : null,
  };
}

async function runFirecrawlSync(): Promise<SyncResult> {
  const sources = parseFirecrawlSources();
  const [existing, categories] = await Promise.all([
    db
      .select({
        id: eventsTable.id,
        title: eventsTable.title,
        startDate: eventsTable.startDate,
        newsLinks: eventsTable.newsLinks,
        ticketUrl: eventsTable.ticketUrl,
        location: eventsTable.location,
        locationAddress: eventsTable.locationAddress,
      })
      .from(eventsTable),
    db.select().from(categoriesTable),
  ]);
  const knownEvents = existing as ExistingEvent[];

  let examined = 0;
  let local = 0;
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const source of sources) {
    let extracted: ExtractedEvent[];
    try {
      extracted = await extractEventListing(source.url);
    } catch {
      failed++;
      continue;
    }
    examined += extracted.length;

    for (const event of extracted) {
      const dates = validExtractedEvent(event);
      if (!dates) {
        skipped++;
        continue;
      }
      if (
        !REGION_PLACE.test(
          `${event.title} ${event.location} ${event.address ?? ""}`,
        )
      ) {
        skipped++;
        continue;
      }
      local++;

      const eventUrl = absoluteUrl(event.eventUrl, source.url) ?? source.url;
      const canonicalEventUrl = normalizeSourceUrl(eventUrl);
      const duplicate = findMatchingEvent(
        knownEvents,
        event.title,
        dates.startDate,
        new Set(
          canonicalEventUrl === normalizeSourceUrl(source.url)
            ? []
            : [canonicalEventUrl],
        ),
        { location: event.location, locationAddress: event.address },
      );
      if (duplicate) {
        await rememberSource(duplicate, source.name, eventUrl);
        skipped++;
        continue;
      }

      const sourceNames = categoryCandidates(event.category ?? "").map(
        normalize,
      );
      const category =
        sourceNames
          .map((name) =>
            categories.find((item) => normalize(item.name) === name),
          )
          .find(Boolean) ?? null;
      const imageUrl =
        absoluteUrl(event.imageUrl, source.url) ?? "/hellocsik-logo.png";
      const newsLinks = [
        JSON.stringify({ title: source.name, url: eventUrl }),
        ...(event.organizerName?.trim()
          ? [
              JSON.stringify({
                title: "Szervező",
                url: "",
                name: event.organizerName.trim(),
              }),
            ]
          : []),
      ];
      const [created] = await db
        .insert(eventsTable)
        .values({
          title: event.title.trim(),
          description:
            event.description?.trim() || "Részletek a forrásoldalon.",
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
          newsLinks,
          status: "published",
        })
        .returning();
      knownEvents.push({
        id: created.id,
        title: event.title.trim(),
        startDate: dates.startDate,
        newsLinks,
        ticketUrl: eventUrl,
        location: event.location,
        locationAddress: event.address ?? null,
      });
      imported++;
    }
  }

  return {
    source: "Firecrawl",
    examined,
    local,
    imported,
    skipped,
    failed,
    ranAt: new Date().toISOString(),
  };
}

function syncFirecrawlEvents() {
  if (!firecrawlRunning)
    firecrawlRunning = runFirecrawlSync().finally(() => {
      firecrawlRunning = null;
    });
  return firecrawlRunning;
}

async function runVisitHarghitaSync(): Promise<SyncResult> {
  // The external calendars are trusted editorial sources. Promote their older
  // imports too, so a restart does not leave the public portal empty while
  // manually submitted events can still wait for review.
  const pendingImports = await db
    .select({
      id: eventsTable.id,
      tags: eventsTable.tags,
      status: eventsTable.status,
      startDate: eventsTable.startDate,
      endDate: eventsTable.endDate,
    })
    .from(eventsTable);
  for (const event of pendingImports) {
    if (
      event.status === "pending" &&
      event.tags.some((tag) => tag === "automatikus-import")
    ) {
      await db
        .update(eventsTable)
        .set({ status: "published", updatedAt: new Date() })
        .where(eq(eventsTable.id, event.id));
    }
  }
  const listing = await fetchHtml(VISIT_HARGHITA_EVENTS);
  const cards = parseCards(listing).slice(0, 40);
  const [existing, categories] = await Promise.all([
    db
      .select({
        id: eventsTable.id,
        title: eventsTable.title,
        startDate: eventsTable.startDate,
        newsLinks: eventsTable.newsLinks,
        ticketUrl: eventsTable.ticketUrl,
      })
      .from(eventsTable),
    db.select().from(categoriesTable),
  ]);
  const knownEvents = existing as ExistingEvent[];
  const metadata = new Map(pendingImports.map((event) => [event.id, event]));
  const knownUrls = new Set<string>();
  const knownUrlEventIds = new Map<string, number>();
  for (const event of knownEvents)
    for (const url of eventSourceUrls(event.newsLinks, event.ticketUrl)) {
      knownUrls.add(url);
      knownUrlEventIds.set(url, event.id);
    }

  let imported = 0;
  let skipped = 0;
  let failed = 0;
  let local = 0;
  const candidates: Array<{ card: SourceCard; sourceUrl: string }> = [];
  for (const card of cards) {
    const sourceUrl = new URL(card.path, VISIT_HARGHITA_EVENTS).toString();
    const canonicalUrl = normalizeSourceUrl(sourceUrl);
    if (knownUrls.has(canonicalUrl)) {
      const existingId = knownUrlEventIds.get(canonicalUrl);
      const matching = knownEvents.find((event) => event.id === existingId);
      if (matching) {
        await rememberSource(matching, "Visit Harghita", sourceUrl);
        const old = metadata.get(matching.id);
        if (
          old?.tags.includes("automatikus-import") &&
          !old.tags.includes("idopont-ellenorizve-v2") &&
          (old.endDate ?? old.startDate).getTime() > Date.now()
        ) {
          try {
            const dates = harghitaEventDates(await fetchHtml(sourceUrl));
            const delta = dates
              ? old.startDate.getTime() - dates.startDate.getTime()
              : 0;
            if (
              dates &&
              [7200000, 10800000].includes(delta) &&
              localDateKey(old.startDate) === localDateKey(dates.startDate)
            ) {
              await db
                .update(eventsTable)
                .set({
                  startDate: dates.startDate,
                  endDate: dates.endDate,
                  tags: [...old.tags, "idopont-ellenorizve-v2"],
                  updatedAt: new Date(),
                })
                .where(eq(eventsTable.id, old.id));
              matching.startDate = dates.startDate;
            }
          } catch {
            /* Preserve the stored event if the source cannot be checked. */
          }
        }
      }
      skipped++;
    } else candidates.push({ card, sourceUrl });
  }
  for (let index = 0; index < candidates.length; index += 5) {
    const batch = candidates.slice(index, index + 5);
    const details = await Promise.allSettled(
      batch.map(async (candidate) => ({
        ...candidate,
        html: await fetchHtml(candidate.sourceUrl),
      })),
    );
    for (const detail of details) {
      if (detail.status === "rejected") {
        failed++;
        continue;
      }
      const { card, sourceUrl, html } = detail.value;
      const canonicalUrl = normalizeSourceUrl(sourceUrl);
      const title = readMeta(html, "og:title");
      const dates = parseDate(html);
      if (
        !title ||
        !dates ||
        dates.startDate < new Date(Date.now() - 86_400_000)
      ) {
        skipped++;
        continue;
      }
      const place = parseLocation(html, card.location);
      if (
        !REGION_PLACE.test(
          `${title} ${card.location} ${place.location} ${place.address ?? ""}`,
        )
      ) {
        skipped++;
        continue;
      }
      local++;
      const sourceNames = categoryCandidates(card.category).map(normalize);
      const category =
        sourceNames
          .map((name) =>
            categories.find((item) => normalize(item.name) === name),
          )
          .find(Boolean) ?? null;
      const ticketUrl = decodeHtml(
        html.match(/href=["']([^"']+)["'][^>]*>\s*Jegyek\s*<\/a>/i)?.[1] ?? "",
      );
      const absoluteTicketUrl = ticketUrl
        ? new URL(ticketUrl, sourceUrl).toString()
        : null;
      const duplicate = findMatchingEvent(
        knownEvents,
        title,
        dates.startDate,
        new Set([
          canonicalUrl,
          ...(absoluteTicketUrl ? [normalizeSourceUrl(absoluteTicketUrl)] : []),
        ]),
        { location: place.location, locationAddress: place.address },
      );
      if (duplicate) {
        await rememberSource(duplicate, "Visit Harghita", sourceUrl);
        knownUrls.add(canonicalUrl);
        knownUrlEventIds.set(canonicalUrl, duplicate.id);
        if (absoluteTicketUrl) {
          knownUrls.add(normalizeSourceUrl(absoluteTicketUrl));
          knownUrlEventIds.set(
            normalizeSourceUrl(absoluteTicketUrl),
            duplicate.id,
          );
        }
        skipped++;
        continue;
      }
      const imageUrl = readMeta(html, "og:image") || "/hellocsik-logo.png";
      const description = parseDescription(html);
      const organizerName = parseOrganizer(description);
      const newsLinks = [
        JSON.stringify({ title: "Visit Harghita", url: sourceUrl }),
        ...(organizerName
          ? [
              JSON.stringify({
                title: "Szervező",
                url: "",
                name: organizerName,
              }),
            ]
          : []),
      ];
      const [created] = await db
        .insert(eventsTable)
        .values({
          title,
          description,
          imageUrl,
          startDate: dates.startDate,
          endDate: dates.endDate,
          location: place.location,
          locationAddress: place.address,
          categoryId: category?.id ?? null,
          featured: false,
          monthHighlight: false,
          ticketUrl: absoluteTicketUrl ?? sourceUrl,
          price: null,
          tags: [
            "automatikus-import",
            "Visit Harghita",
            "idopont-ellenorizve-v2",
          ],
          newsLinks,
          status: "published",
        })
        .returning();
      knownUrls.add(canonicalUrl);
      knownUrlEventIds.set(canonicalUrl, created.id);
      knownEvents.push({
        id: created.id,
        title,
        startDate: dates.startDate,
        newsLinks,
        ticketUrl: absoluteTicketUrl ?? sourceUrl,
        location: place.location,
        locationAddress: place.address,
      });
      imported++;
    }
  }

  lastResult = {
    source: "Visit Harghita",
    examined: cards.length,
    local,
    imported,
    skipped,
    failed,
    ranAt: new Date().toISOString(),
  };
  return lastResult;
}

export function syncVisitHarghitaEvents() {
  if (!running)
    running = runVisitHarghitaSync().finally(() => {
      running = null;
    });
  return running;
}

async function runRegionalCalendars(): Promise<SyncResult> {
  const [existing, categories] = await Promise.all([
    db
      .select({
        id: eventsTable.id,
        title: eventsTable.title,
        startDate: eventsTable.startDate,
        newsLinks: eventsTable.newsLinks,
        ticketUrl: eventsTable.ticketUrl,
        location: eventsTable.location,
        locationAddress: eventsTable.locationAddress,
      })
      .from(eventsTable),
    db.select().from(categoriesTable),
  ]);
  const knownEvents = existing as ExistingEvent[];
  const result: SyncResult = {
    source: "Visit Covasna + Visit Mureș",
    examined: 0,
    local: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
    ranAt: new Date().toISOString(),
  };
  const sources = [
    {
      name: "Visit Covasna",
      url: "https://visitcovasna.com/esemenyek?locale=hu",
      turbo: true,
    },
    {
      name: "Visit Mureș",
      url: "https://visitmures.com/hu/esemenyek",
      turbo: false,
    },
  ];
  const venueCache = new Map<string, string>();
  for (const source of sources) {
    let urls: string[] = [];
    try {
      const listing = await fetchHtml(source.url, source.turbo);
      if (source.turbo) {
        const path = covasnaFramePath(listing);
        if (!path) throw new Error("A nyilvános programlista nem található.");
        const firstPage = await fetchHtml(new URL(path, source.url).href, true);
        urls.push(...covasnaCards(firstPage));
        // Include the current and next month; the default list can start with distant festivals.
        for (const monthPath of covasnaMonthPaths(firstPage)) {
          try {
            urls.push(
              ...covasnaCards(
                await fetchHtml(new URL(monthPath, source.url).href, true),
              ),
            );
          } catch {
            result.failed++;
          }
        }
      } else urls = muresCards(listing);
    } catch {
      result.failed++;
      continue;
    }
    urls = [...new Set(urls)].slice(0, 35);
    result.examined += urls.length;
    for (let index = 0; index < urls.length; index += 4) {
      const details = await Promise.allSettled(
        urls
          .slice(index, index + 4)
          .map(async (url) => ({
            url,
            html: await fetchHtml(
              source.turbo ? url + "?locale=hu" : url,
              source.turbo,
            ),
          })),
      );
      for (const detail of details) {
        if (detail.status === "rejected") {
          result.failed++;
          continue;
        }
        let venueContext:
          | { location: string; address: string; organizerName: string | null }
          | undefined;
        if (source.turbo) {
          const refs = covasnaVenueReferences(detail.value.html),
            venue = refs.at(-1);
          if (venue) {
            try {
              let address = venueCache.get(venue.url);
              if (address === undefined) {
                address = covasnaVenueAddress(
                  await fetchHtml(venue.url + "?locale=hu", true),
                );
                venueCache.set(venue.url, address);
              }
              venueContext = {
                location: venue.name,
                address,
                organizerName:
                  refs.find((item) => item.organizer)?.name ?? null,
              };
            } catch {
              result.failed++;
              continue;
            }
          }
        }
        const event = parseRegionalSource(
          detail.value.html,
          detail.value.url,
          source.name,
          new Date(),
          venueContext,
        );
        if (!event) {
          result.skipped++;
          continue;
        }
        result.local++;
        const duplicate = findMatchingEvent(
          knownEvents,
          event.title,
          event.startDate,
          new Set([
            normalizeSourceUrl(event.sourceUrl),
            ...(event.ticketUrl ? [normalizeSourceUrl(event.ticketUrl)] : []),
          ]),
          event,
        );
        if (duplicate) {
          await rememberSource(duplicate, source.name, event.sourceUrl);
          result.skipped++;
          continue;
        }
        const category = categoryCandidates(event.category)
          .map(normalize)
          .map((name) =>
            categories.find((item) => normalize(item.name) === name),
          )
          .find(Boolean);
        const newsLinks = [
          JSON.stringify({ title: source.name, url: event.sourceUrl }),
          ...(event.organizerName
            ? [
                JSON.stringify({
                  title: "Szervező",
                  name: event.organizerName,
                  url: "",
                }),
              ]
            : []),
        ];
        const [created] = await db
          .insert(eventsTable)
          .values({
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            locationAddress: event.locationAddress,
            imageUrl: event.imageUrl ?? "/hellocsik-logo.png",
            ticketUrl: event.ticketUrl,
            price: event.price,
            categoryId: category?.id ?? null,
            featured: false,
            monthHighlight: false,
            status: "published",
            tags: ["automatikus-import", source.name],
            newsLinks,
          })
          .returning();
        knownEvents.push({
          id: created.id,
          title: event.title,
          startDate: event.startDate,
          newsLinks,
          ticketUrl: event.ticketUrl,
          location: event.location,
          locationAddress: event.locationAddress,
        });
        result.imported++;
      }
    }
  }
  return result;
}

export async function syncEventSources() {
  const results: SyncResult[] = [];
  const failures: string[] = [];
  // Run independently so an unavailable provider cannot hide the other regions.
  for (const [name, sync] of [
    ["Visit Harghita", syncVisitHarghitaEvents],
    ["Visit Covasna + Visit Mureș", runRegionalCalendars],
    ...(isFirecrawlConfigured() ? [["Firecrawl", syncFirecrawlEvents]] : []),
  ] as Array<[string, () => Promise<SyncResult>]>) {
    try {
      results.push(await sync());
    } catch {
      failures.push(name);
    }
  }
  lastResult = {
    source: results.map((item) => item.source).join(" + "),
    examined: 0,
    local: 0,
    imported: 0,
    skipped: 0,
    failed: failures.length,
    ranAt: new Date().toISOString(),
  };
  for (const result of results)
    for (const key of [
      "examined",
      "local",
      "imported",
      "skipped",
      "failed",
    ] as const)
      lastResult[key] += result[key];
  return {
    ...lastResult,
    firecrawlConfigured: isFirecrawlConfigured(),
    sources: results,
    unavailableSources: failures,
  };
}

export function getLastSourceSync() {
  return lastResult;
}

export function startSourceSyncScheduler(log: {
  info: (data: unknown, message: string) => void;
  warn: (data: unknown, message: string) => void;
}) {
  const sync = () =>
    syncEventSources()
      .then((result) =>
        log.info({ result }, "Automatic event source sync completed"),
      )
      .catch((err) => log.warn({ err }, "Automatic event source sync failed"));
  const first = setTimeout(sync, 30_000);
  const recurring = setInterval(sync, 6 * 60 * 60 * 1000);
  first.unref();
  recurring.unref();
}
