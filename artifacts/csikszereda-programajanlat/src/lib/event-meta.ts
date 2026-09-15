export type EventSource = { title: string; url?: string };

export function getEventSource(newsLinks?: string[] | null): EventSource {
  for (const raw of newsLinks ?? []) {
    try {
      const parsed = JSON.parse(raw) as { title?: unknown; url?: unknown };
      if (typeof parsed.title === "string" && parsed.title.trim()) {
        return {
          title: parsed.title.trim(),
          url: typeof parsed.url === "string" && parsed.url.trim() ? parsed.url.trim() : undefined,
        };
      }
    } catch {
      // A régi, hibás bejegyzéseket egyszerűen kihagyjuk.
    }
  }
  return { title: "HelloCsík szerkesztőség" };
}

export function formatRefreshDate(value?: string | null) {
  if (!value) return "dátum nélkül";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "dátum nélkül";
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
