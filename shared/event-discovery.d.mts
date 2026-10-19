import type { LocatedEvent } from "./region-places.mjs";
export type DiscoveryEvent = LocatedEvent & {
  startDate: string;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  price?: string | null;
  description?: string;
  category?: { slug: string; name: string } | null;
  organizerName?: string | null;
  organizer?: { name: string } | null;
  tags?: string[];
};
export type DiscoveryFilters = {
  area?: string;
  city?: string;
  nearby?: boolean;
  category?: string;
  free?: boolean;
  query?: string;
  day?: string;
  date?: string;
  from?: string;
  to?: string;
};
export const DISCOVERY_DATES: string[];
export function discoveryDateRange(
  filter: string,
  now?: Date,
): { from: string; to: string } | null;
export function isFreeEvent(event: Pick<DiscoveryEvent, "price">): boolean;
export function matchesDiscoveryEvent(
  event: DiscoveryEvent,
  filters?: DiscoveryFilters,
  now?: Date,
): boolean;
export function sortDiscoveryEvents<T extends DiscoveryEvent>(
  events: T[],
  order?: string,
  now?: Date,
): T[];
