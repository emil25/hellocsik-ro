export interface ImportCandidate {
  title: string;
  startDate: Date | string;
  location?: string;
  locationAddress?: string | null;
  newsLinks?: string[] | null;
  ticketUrl?: string | null;
  urls?: Iterable<string>;
}
export function similarEventTitle(left: string, right: string): boolean;
export function importSourceUrls(event: ImportCandidate): string[];
export function findImportedEvent<T extends ImportCandidate>(
  events: T[],
  candidate: ImportCandidate,
): T | undefined;
