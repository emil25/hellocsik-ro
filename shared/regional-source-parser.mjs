import { eventInputToISO, parseEventDate } from "./event-time.mjs";
import {
  findRegionPlace,
  regionPlaceForEvent,
  mergeLocalityAddress,
  normalizePlaceText,
} from "./region-places.mjs";

export function decodeSourceHtml(value) {
  const names = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
    middot: "·",
  };
  return String(value ?? "").replace(
    /&(#x[\da-f]+|#\d+|[a-z]+);/gi,
    (entity, key) => {
      if (key[0] === "#") {
        const n = parseInt(
          key.slice(/^#x/i.test(key) ? 2 : 1),
          /^#x/i.test(key) ? 16 : 10,
        );
        return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
      }
      return names[key.toLowerCase()] ?? entity;
    },
  );
}
export const sourceText = (html) =>
  decodeSourceHtml(html)
    .replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(?:p|div|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
const abs = (value, base) => {
  try {
    const u = new URL(decodeSourceHtml(value), base);
    return /https?:/.test(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
};
const first = (html, expression) => html.match(expression)?.[1] ?? "";
const MONTHS = [
  "januar",
  "februar",
  "marcius",
  "aprilis",
  "majus",
  "junius",
  "julius",
  "augusztus",
  "szeptember",
  "oktober",
  "november",
  "december",
];
function huDate(value) {
  const match = normalizePlaceText(value).match(/(20\d{2}) (\w+) (\d{1,2})/);
  if (!match) return null;
  const month = MONTHS.indexOf(match[2]);
  return month < 0
    ? null
    : match[1] +
        "-" +
        String(month + 1).padStart(2, "0") +
        "-" +
        match[3].padStart(2, "0");
}
export function muresCards(html) {
  return [
    ...new Set(
      [
        ...html.matchAll(
          /location\.href=['"](https:\/\/visitmures\.com\/hu\/esemenyek\/[^'"]+)/g,
        ),
      ].map((match) => decodeSourceHtml(match[1])),
    ),
  ];
}
export function covasnaCards(html) {
  return [...html.matchAll(/<a\b[^>]*href="([^"#?]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .filter((match) => /<h3\b/i.test(match[2]) && /<img\b/i.test(match[2]))
    .map((match) => abs(match[1], "https://visitcovasna.com"))
    .filter(Boolean);
}
export function covasnaFramePath(html) {
  return decodeSourceHtml(
    first(html, /<turbo-frame[^>]*id="page-list-[^"]+"[^>]*src="([^"]+)"/i),
  );
}
export function covasnaMonthPaths(html, now = new Date()) {
  const thisMonth = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
  }).format(now);
  const next = new Date(thisMonth + "-15T12:00:00Z");
  next.setUTCMonth(next.getUTCMonth() + 1);
  const months = [thisMonth, next.toISOString().slice(0, 7)];
  return [
    ...new Set(
      [...html.matchAll(/href="([^"<>]*month=([^&"]+)[^"<>]*)"/g)]
        .filter((m) => months.includes(m[2]))
        .map((m) => decodeSourceHtml(m[1])),
    ),
  ];
}
function categoryFor(title, category) {
  const value = normalizePlaceText(category + " " + title);
  if (/kiallitas|muzeum/.test(value)) return "Kiállítás";
  if (/koncert|zene|hangverseny/.test(value)) return "Koncert";
  if (/szinhaz|szinpadi|szinjatek/.test(value)) return "Színház";
  if (/sport|futas|tura|maraton/.test(value)) return "Sport";
  if (/fesztival/.test(value)) return "Fesztivál";
  if (/tanc/.test(value)) return "Tánc";
  return "Közösség";
}
export function covasnaVenueReferences(html) {
  const part = html.slice(
    html.indexOf("date-intervals"),
    html.indexOf('class="trix-content"'),
  );
  return [...part.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .filter((m) => /<h3\b/.test(m[2]) && m[1].startsWith("/"))
    .map((m) => ({
      url: abs(m[1], "https://visitcovasna.com"),
      name: sourceText(first(m[2], /<h3\b[^>]*>([\s\S]*?)<\/h3>/i)),
      organizer: /Rendezvényszervező/i.test(sourceText(m[2])),
    }))
    .filter((item) => item.url && item.name);
}
export function covasnaVenueAddress(html) {
  return sourceText(
    first(
      html,
      /<div class="cms-location__address">[\s\S]*?<span>([\s\S]*?)<\/span>/i,
    ),
  );
}
export function parseRegionalSource(
  html,
  url,
  sourceName,
  now = new Date(),
  venueContext,
) {
  const covasna = sourceName === "Visit Covasna";
  const title = sourceText(first(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i));
  let startDate,
    endDate = null,
    location = "",
    body = "",
    imageUrl = null;
  if (covasna) {
    // Only the event interval; later publication/update times are unrelated.
    const interval = first(
      html,
      /<div class="date-intervals">([\s\S]*?)<\/section>/i,
    );
    const dates = [
      ...interval.matchAll(/<time[^>]*datetime="([^"]+T[^"]+)"/g),
    ].map((m) => m[1]);
    if (!dates.length) return null;
    try {
      startDate = parseEventDate(dates[0]);
      endDate = dates[1] ? parseEventDate(dates[1]) : null;
    } catch {
      return null;
    }
    const mapCard =
      [
        ...html.matchAll(
          /<a\b[^>]*href="https:\/\/(?:maps\.app\.goo\.gl|www\.google\.com\/maps)[^"]*"[^>]*>([\s\S]*?)<\/a>/g,
        ),
      ][0]?.[1] ?? "";
    location = sourceText(first(mapCard, /<span\b[^>]*>([\s\S]*?)<\/span>/i));
    const trix = html.indexOf('class="trix-content"');
    body =
      trix < 0
        ? ""
        : sourceText(
            html.slice(
              trix,
              html.indexOf("Galerie foto", trix) > trix
                ? html.indexOf("Galerie foto", trix)
                : trix + 12000,
            ),
          ).replace(/^class="trix-content"[^>]*>/, "");
    imageUrl = abs(first(html, /<img\b[^>]*src="([^"]+)"/i), url);
  } else {
    const day = huDate(
      sourceText(
        first(
          html,
          /<(?:span|p) class="detailed-date">([\s\S]*?)<\/(?:span|p)>/i,
        ),
      ),
    );
    const bodyStart = html.indexOf('class="container main-desc"');
    body =
      bodyStart < 0
        ? ""
        : sourceText(
            html.slice(bodyStart, html.indexOf("EOF event-details", bodyStart)),
          ).replace(/^class="container main-desc">/, "");
    const time =
      body.match(/(?:^|[^\d])(\d{1,2}):([0-5]\d)(?!\d)/) ??
      body.match(/(?:^|[^\d])(\d{1,2})\s*óra(?:tól|kor)?/i);
    // Do not invent a clock time for date-only listings.
    if (!day || !time || Number(time[1]) > 23) return null;
    try {
      startDate = new Date(
        eventInputToISO(
          day + "T" + time[1].padStart(2, "0") + ":" + (time[2] ?? "00"),
        ),
      );
    } catch {
      return null;
    }
    location = sourceText(
      first(html, /<div id="location">[\s\S]*?<u>([\s\S]*?)<\/u>/i),
    );
    const details = html.slice(html.indexOf('class="event-details"'));
    imageUrl = abs(first(details, /<img\b[^>]*src="([^"]+)"/i), url);
  }
  if (venueContext?.location) location = venueContext.location;
  const place = regionPlaceForEvent({
    location,
    locationAddress: venueContext?.address,
  });
  if (
    !title ||
    !startDate ||
    !place ||
    (endDate ?? startDate).getTime() < now.getTime() ||
    (endDate && endDate < startDate)
  )
    return null;
  if (!location) location = place.name;
  const eventContent = covasna
    ? html.slice(html.indexOf('class="trix-content"'))
    : html.slice(
        html.indexOf('class="container main-desc"'),
        html.indexOf("EOF event-details"),
      );
  const ticketMatch = [
    ...eventContent.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi),
  ].find((m) =>
    /bilete\.|in-time\.hu|eventim\.|tixa\.|jegy\.hu|jegyv[aá]s[aá]rl[aá]s|jegyek|ticket/i.test(
      m[1] + " " + sourceText(m[2]),
    ),
  );
  const ticketUrl = ticketMatch ? abs(ticketMatch[1], url) : null;
  const category = categoryFor(title, sourceText(html.slice(-3500)));
  const price = /\b(?:belépés|részvétel) (?:díjtalan|ingyenes)\b/i.test(body)
    ? "Ingyenes"
    : null;
  // A short source excerpt, followed by the original program link in newsLinks.
  const description =
    (body
      ? body
          .trim()
          .slice(0, 500)
          .replace(/\s+\S*$/, "") +
        (body.length > 500 ? "…" : "") +
        "\n\n"
      : "") +
    "Teljes program és aktuális tudnivalók: " +
    sourceName +
    " (a forráslinknél).";
  return {
    title,
    description,
    startDate,
    endDate,
    location,
    locationAddress: mergeLocalityAddress(
      venueContext?.address || location,
      place.name,
    ),
    imageUrl,
    ticketUrl,
    price,
    category,
    sourceUrl: url,
    sourceName,
    organizerName: venueContext?.organizerName ?? null,
  };
}

export function harghitaEventDates(html) {
  const text = sourceText(
    first(html, /<div class="event_date[^>]*>([\s\S]*?)<\/section>/i) || html,
  );
  const match = text.match(
    /(?:hétfő|kedd|szerda|csütörtök|péntek|szombat|vasárnap)\s*,\s*(\d{1,2})\s+([\p{L}]+)\s+(\d{4})\s+(\d{1,2}:\d{2})(?:\s*[-–]\s*(\d{1,2}:\d{2}))?/iu,
  );
  if (!match) return null;
  const month = MONTHS.indexOf(normalizePlaceText(match[2]));
  if (month < 0) return null;
  const day =
    match[3] +
    "-" +
    String(month + 1).padStart(2, "0") +
    "-" +
    match[1].padStart(2, "0");
  try {
    const startDate = new Date(
      eventInputToISO(day + "T" + match[4].padStart(5, "0")),
    );
    let endDate = match[5]
      ? new Date(eventInputToISO(day + "T" + match[5].padStart(5, "0")))
      : null;
    if (endDate && endDate < startDate) {
      const next = new Date(day + "T12:00:00Z");
      next.setUTCDate(next.getUTCDate() + 1);
      endDate = new Date(
        eventInputToISO(
          next.toISOString().slice(0, 10) + "T" + match[5].padStart(5, "0"),
        ),
      );
    }
    return { startDate, endDate };
  } catch {
    return null;
  }
}
