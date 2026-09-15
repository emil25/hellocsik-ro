const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v2/scrape";

export type ExtractedEvent = {
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  location: string;
  address: string | null;
  category: string | null;
  imageUrl: string | null;
  eventUrl: string | null;
  price: string | null;
};

type JsonSchema = Record<string, unknown>;

function apiKey() {
  return process.env.FIRECRAWL_API_KEY?.trim() ?? "";
}

export function isFirecrawlConfigured() {
  return Boolean(apiKey());
}

async function extractJson(url: string, prompt: string, schema: JsonSchema) {
  if (!apiKey()) return null;

  const response = await fetch(FIRECRAWL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: [{ type: "json", prompt, schema }],
      onlyMainContent: true,
      location: { country: "RO", languages: ["hu-HU", "ro-RO"] },
      timeout: 45_000,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Firecrawl: HTTP ${response.status}${detail ? ` – ${detail}` : ""}`);
  }

  const payload = await response.json() as { success?: boolean; data?: { json?: unknown }; error?: string };
  if (!payload.success) throw new Error(payload.error || "A Firecrawl nem adott használható választ.");
  return payload.data?.json ?? null;
}

const eventProperties = {
  title: { type: "string", description: "Az esemény pontos, eredeti címe" },
  description: { type: "string", description: "Az esemény valódi, részletes leírása, az eredeti nyelven" },
  startDate: { type: "string", description: "Kezdés ISO 8601 formátumban, Europe/Bucharest időzónával" },
  endDate: { type: ["string", "null"], description: "Befejezés ISO 8601 formátumban, ha ismert" },
  location: { type: "string", description: "A helyszín neve" },
  address: { type: ["string", "null"], description: "A helyszín címe, ha ismert" },
  category: { type: ["string", "null"], description: "Az esemény kategóriája" },
  imageUrl: { type: ["string", "null"], description: "A borítókép teljes URL-je, ha van" },
  eventUrl: { type: ["string", "null"], description: "Az esemény saját részletoldalának URL-je" },
  price: { type: ["string", "null"], description: "Jegyár vagy Ingyenes, ha ismert" },
};

export async function extractEventListing(url: string): Promise<ExtractedEvent[]> {
  const schema = {
    type: "object",
    properties: {
      events: {
        type: "array",
        items: { type: "object", properties: eventProperties, required: ["title", "startDate", "location"] },
      },
    },
    required: ["events"],
  };
  const prompt = [
    "Gyűjtsd ki az oldalon felsorolt valódi eseményeket.",
    "Csak jelenlegi vagy jövőbeli eseményt adj vissza, hírt és navigációs elemet ne.",
    "Őrizd meg a magyar szöveget; ha magyar és román változat is van, a magyart válaszd.",
    "A dátum legyen teljes ISO 8601 érték Europe/Bucharest időzónával.",
    "Az eventUrl és imageUrl legyen teljes URL.",
  ].join(" ");
  const json = await extractJson(url, prompt, schema) as { events?: unknown } | null;
  return Array.isArray(json?.events) ? json.events as ExtractedEvent[] : [];
}

export async function extractFacebookEvent(url: string): Promise<Partial<ExtractedEvent> | null> {
  const schema = { type: "object", properties: eventProperties, required: ["title"] };
  const prompt = [
    "Olvasd ki ennek a nyilvános Facebook-eseménynek az adatait.",
    "A valódi eseményleírást add vissza, ne a szervezők neveiből képzett Facebook-összefoglalót.",
    "Őrizd meg a magyar címet és leírást; csak akkor használj más nyelvet, ha magyar változat nincs.",
    "A dátum legyen teljes ISO 8601 érték Europe/Bucharest időzónával.",
  ].join(" ");
  return await extractJson(url, prompt, schema) as Partial<ExtractedEvent> | null;
}
