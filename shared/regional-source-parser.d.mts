export interface RegionalSourceEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  location: string;
  locationAddress: string | null;
  imageUrl: string | null;
  ticketUrl: string | null;
  price: string | null;
  category: string;
  sourceUrl: string;
  sourceName: string;
  organizerName: string | null;
}
export function decodeSourceHtml(value: unknown): string;
export function sourceText(value: string): string;
export function muresCards(html: string): string[];
export function covasnaCards(html: string): string[];
export function covasnaFramePath(html: string): string;
export function covasnaMonthPaths(html: string, now?: Date): string[];
export function parseRegionalSource(
  html: string,
  url: string,
  sourceName: string,
  now?: Date,
  venueContext?: {
    location: string;
    address: string;
    organizerName?: string | null;
  },
): RegionalSourceEvent | null;

export function covasnaVenueReferences(
  html: string,
): Array<{ url: string; name: string; organizer: boolean }>;
export function covasnaVenueAddress(html: string): string;

export function harghitaEventDates(html:string):{startDate:Date;endDate:Date|null}|null;
