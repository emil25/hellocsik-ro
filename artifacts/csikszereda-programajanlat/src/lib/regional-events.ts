import { useQuery } from "@tanstack/react-query";
import type { Event as ApiEvent } from "@workspace/api-client-react";
import { getVenueInfo } from "./venues";
import { getCsikArea } from "./csik-events";
import { eventDateKey } from "../../../../shared/event-time.mjs";

export const REGION_CITIES = [
  {
    slug: "csikszereda",
    name: "Csíkszereda",
    keys: ["Csíkszereda", "Csíkszeredában", "Miercurea Ciuc", "Csíksomlyó"],
  },
  {
    slug: "szekelyudvarhely",
    name: "Székelyudvarhely",
    keys: ["Székelyudvarhely", "Székelyudvarhelyen", "Odorheiu Secuiesc"],
  },
  {
    slug: "sepsiszentgyorgy",
    name: "Sepsiszentgyörgy",
    keys: ["Sepsiszentgyörgy", "Sepsiszentgyörgyön", "Sfântu Gheorghe"],
  },
  {
    slug: "marosvasarhely",
    name: "Marosvásárhely",
    keys: ["Marosvásárhely", "Marosvásárhelyen", "Târgu Mureș"],
  },
  {
    slug: "gyergyoszentmiklos",
    name: "Gyergyószentmiklós",
    keys: ["Gyergyószentmiklós", "Gyergyószentmiklóson", "Gheorgheni"],
  },
  {
    slug: "kezdivasarhely",
    name: "Kézdivásárhely",
    keys: ["Kézdivásárhely", "Kézdivásárhelyen", "Târgu Secuiesc"],
  },
  { slug: "szovata", name: "Szováta", keys: ["Szováta", "Szovátán", "Sovata"] },
  {
    slug: "szekelykeresztur",
    name: "Székelykeresztúr",
    keys: ["Székelykeresztúr", "Cristuru Secuiesc"],
  },
  { slug: "barot", name: "Barót", keys: ["Barót", "Baraolt"] },
  {
    slug: "kovaszna",
    name: "Kovászna",
    keys: ["Kovászna város", "Kovásznán", "Covasna"],
  },
  { slug: "borszek", name: "Borszék", keys: ["Borszék", "Borsec"] },
  { slug: "marosheviz", name: "Maroshévíz", keys: ["Maroshévíz", "Toplița"] },
  {
    slug: "tusnadfurdo",
    name: "Tusnádfürdő",
    keys: ["Tusnádfürdő", "Băile Tușnad"],
  },
  { slug: "csik-kornyeke", name: "Csík környéke", keys: [] },
] as const;

export type RegionEvent = ApiEvent & {
  promotionStatus?: string | null;
  promotionPlan?: string | null;
  organizerName?: string | null;
  organizer?: {
    id: number;
    slug: string;
    name: string;
    city?: string | null;
    website?: string | null;
    logoUrl?: string | null;
  } | null;
};
export type RegionDateFilter = "all" | "today" | "week" | "weekend";
export const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("hu-HU")
    .replace(/\s+/g, " ")
    .trim();

export function cityForEvent(
  event: Pick<RegionEvent, "location" | "locationAddress" | "title">,
) {
  const match = (value: string) =>
    REGION_CITIES.find((city) =>
      city.keys.some((key) =>
        ` ${normalizeSearch(value).replace(/[^a-z0-9]+/g, " ")} `.includes(
          ` ${normalizeSearch(key)} `,
        ),
      ),
    );
  // The actual address has precedence over a venue or an organiser in the title.
  return (
    match(event.locationAddress ?? "") ??
    match(event.location) ??
    match(getVenueInfo(event.location).address ?? "") ??
    (getCsikArea(event) === "surroundings"
      ? REGION_CITIES.find((city) => city.slug === "csik-kornyeke")
      : undefined) ??
    match(event.title)
  );
}

export function matchesDateFilter(
  event: RegionEvent,
  filter: RegionDateFilter,
  now = new Date(),
) {
  if (filter === "all") return true;
  const today = eventDateKey(now);
  const from = new Date(today + "T12:00:00");
  const to = new Date(from);
  if (filter === "week") to.setDate(from.getDate() + ((7 - from.getDay()) % 7));
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
  const start = eventDateKey(event.startDate),
    end = eventDateKey(event.endDate ?? event.startDate);
  return start <= eventDateKey(to) && end >= eventDateKey(from);
}

export function usePortalEvents() {
  return useQuery({
    queryKey: ["portal", "all-upcoming-events"],
    queryFn: async ({ signal }) => {
      const events: RegionEvent[] = [];
      for (let offset = 0; ; offset += 100) {
        const response = await fetch(`/api/events?limit=100&offset=${offset}`, {
          signal,
        });
        if (!response.ok)
          throw new Error("Az események betöltése nem sikerült.");
        const page = (await response.json()) as { events: RegionEvent[] };
        events.push(...page.events);
        if (page.events.length < 100) break;
      }
      const now = Date.now();
      return [...new Map(events.map((event) => [event.id, event])).values()]
        .filter((event) => Date.parse(event.endDate ?? event.startDate) >= now)
        .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
    },
    refetchInterval: 5 * 60 * 1000,
  });
}
