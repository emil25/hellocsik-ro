export type RegionPlace = {
  slug: string;
  name: string;
  area: string;
  keys: string[];
  city: boolean;
};
export type RegionArea = {
  slug: string;
  name: string;
  shortName: string;
  color: string;
};
export type LocatedEvent = {
  title?: string;
  location?: string;
  locationAddress?: string | null;
  locality?: string | null;
};
export const REGION_AREAS: RegionArea[];
export const REGION_PLACES: RegionPlace[];
export function normalizePlaceText(value: unknown): string;
export function findRegionPlace(value: string): RegionPlace | undefined;
export function regionPlaceForEvent(
  event: LocatedEvent,
): RegionPlace | undefined;
export function regionAreaForEvent(event: LocatedEvent): RegionArea | undefined;
export function mergeLocalityAddress(
  address: unknown,
  locality: unknown,
): string | null;
