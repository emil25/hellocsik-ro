import { useQuery } from "@tanstack/react-query";
import type { Event as ApiEvent } from "@workspace/api-client-react";
import {
  REGION_PLACES,
  REGION_AREAS,
  regionPlaceForEvent,
  regionAreaForEvent,
  normalizePlaceText,
} from "../../../../shared/region-places.mjs";
import { discoveryDateRange } from "../../../../shared/event-discovery.mjs";
import { eventDateKey } from "../../../../shared/event-time.mjs";

export { REGION_PLACES, REGION_AREAS, regionPlaceForEvent, regionAreaForEvent };
export const REGION_CITIES = REGION_PLACES.filter((place) => place.city);
export const cityForEvent = regionPlaceForEvent;
export const normalizeSearch = normalizePlaceText;
export type RegionDateFilter =
  | "all"
  | "today"
  | "tomorrow"
  | "week"
  | "weekend"
  | "next-week"
  | "month";
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
export function matchesDateFilter(
  event: RegionEvent,
  filter: RegionDateFilter,
  now = new Date(),
) {
  const range = discoveryDateRange(filter, now);
  return (
    !range ||
    (eventDateKey(event.startDate) <= range.to &&
      eventDateKey(event.endDate || event.startDate) >= range.from)
  );
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
      return [...new Map(events.map((event) => [event.id, event])).values()]
        .filter(
          (event) => Date.parse(event.endDate || event.startDate) >= Date.now(),
        )
        .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
    },
    refetchInterval: 5 * 60 * 1000,
  });
}
