export const EVENT_TIME_ZONE: "Europe/Bucharest";
export function parseEventDate(value: unknown): Date;
export function eventDateKey(value: string | Date): string;
export function toEventInput(value: string | Date | null | undefined): string;
export function eventInputToISO(value: string, original?: string | Date | null): string;
export function eventOccursOnDate(event: { startDate: string | Date; endDate?: string | Date | null }, day: string): boolean;
export function assertEventRange(start: string | Date, end?: string | Date | null): void;
