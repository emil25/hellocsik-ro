import { Router } from "express";

const router = Router();
const CINEMA_URL = "https://cinemacsikimozi.ro/hu";
const MONTHS: Record<string, number> = {
  jan: 0, febr: 1, márc: 2, ápr: 3, máj: 4, jún: 5,
  júl: 6, aug: 7, szept: 8, okt: 9, nov: 10, dec: 11,
};

type CinemaMovie = {
  title: string;
  date: string;
  imageUrl: string;
  url: string;
  status: "MŰSORON" | "KÖVETKEZIK";
};

let cache: { movies: CinemaMovie[]; fetchedAt: number } | null = null;

function decodeHtml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function screeningDate(label: string) {
  const match = label.toLowerCase().match(/([\p{L}]+)\.\s*(\d{1,2})/u);
  if (!match) return null;
  const month = MONTHS[match[1]];
  if (month === undefined) return null;
  const now = new Date();
  let year = now.getFullYear();
  if (month < now.getMonth() - 6) year++;
  return new Date(year, month, Number(match[2]), 23, 59, 59);
}

function shortDate(date: string) {
  return date.replace(/,\s*[\p{L}]+$/u, ".").replace(/\.{2,}/g, ".");
}

function posterUrl(raw: string) {
  try {
    const url = new URL(decodeHtml(raw));
    url.searchParams.set("width", "375");
    url.searchParams.set("height", "562");
    url.searchParams.set("format", "webp");
    return url.toString();
  } catch { return decodeHtml(raw); }
}

function parseMovies(html: string): CinemaMovie[] {
  const nextSection = html.indexOf('id="kovetkezik"');
  const card = /<div class="card panel"[\s\S]*?<div class="card_date"[^>]*>([^<]+)<\/div>[\s\S]*?<a href="(\/hu\/film\/[^"]+)"[\s\S]*?<img src="([^"]+)" alt="Movie:\s*([^"]+)"[\s\S]*?<\/figure><\/div>/gi;
  const byUrl = new Map<string, CinemaMovie & { dates: string[] }>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const match of html.matchAll(card)) {
    const date = decodeHtml(match[1]).trim();
    const parsedDate = screeningDate(date);
    if (!parsedDate || parsedDate < today) continue;
    const path = match[2];
    const url = new URL(path, CINEMA_URL).toString();
    const existing = byUrl.get(url);
    if (existing) {
      if (!existing.dates.includes(date)) existing.dates.push(date);
      continue;
    }
    byUrl.set(url, {
      title: decodeHtml(match[4]).trim(),
      date: "",
      dates: [date],
      imageUrl: posterUrl(match[3]),
      url,
      status: nextSection >= 0 && (match.index ?? 0) >= nextSection ? "KÖVETKEZIK" : "MŰSORON",
    });
  }

  return [...byUrl.values()].map(({ dates, ...movie }) => ({
    ...movie,
    date: dates.slice(0, 2).map(shortDate).join(" és "),
  })).slice(0, 8);
}

async function loadMovies() {
  if (cache && Date.now() - cache.fetchedAt < 60 * 60 * 1000) return cache.movies;
  const response = await fetch(CINEMA_URL, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; HelloCsik cinema guide)",
      "accept-language": "hu-HU,hu;q=0.9",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Cinema Csíki Mozi: HTTP ${response.status}`);
  const movies = parseMovies(await response.text());
  if (!movies.length) throw new Error("A mozis műsorból nem olvasható ki vetítés.");
  cache = { movies, fetchedAt: Date.now() };
  return movies;
}

router.get("/cinema", async (req, res) => {
  try {
    res.json({ movies: await loadMovies(), updatedAt: new Date(cache?.fetchedAt ?? Date.now()).toISOString() });
  } catch (err) {
    req.log.warn({ err }, "Could not refresh cinema schedule");
    if (cache) { res.json({ movies: cache.movies, updatedAt: new Date(cache.fetchedAt).toISOString(), stale: true }); return; }
    res.status(502).json({ error: "A Csíki Mozi műsora most nem érhető el." });
  }
});

export default router;
