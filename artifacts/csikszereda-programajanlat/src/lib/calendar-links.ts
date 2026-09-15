type CalendarEvent = {
  id: number;
  title: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  location: string;
  locationAddress?: string | null;
};

const compactUtc = (value: Date) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const calendarEnd = (event: CalendarEvent) => event.endDate
  ? new Date(event.endDate)
  : new Date(new Date(event.startDate).getTime() + 2 * 60 * 60 * 1000);

export function googleCalendarUrl(event: CalendarEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${compactUtc(new Date(event.startDate))}/${compactUtc(calendarEnd(event))}`,
    details: event.description ?? "",
    location: [event.location, event.locationAddress].filter(Boolean).join(", "),
    stz: "Europe/Bucharest",
    etz: "Europe/Bucharest",
  });
  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
}

const escapeIcs = (value: string) => value
  .replace(/\\/g, "\\\\")
  .replace(/\n/g, "\\n")
  .replace(/,/g, "\\,")
  .replace(/;/g, "\\;");

export function downloadCalendarFile(event: CalendarEvent) {
  const pageUrl = `${window.location.origin}/esemeny/${event.id}`;
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HelloCsik//Programajanlo//HU",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:hellocsik-${event.id}@hellocsik.ro`,
    `DTSTAMP:${compactUtc(new Date())}`,
    `DTSTART:${compactUtc(new Date(event.startDate))}`,
    `DTEND:${compactUtc(calendarEnd(event))}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description ?? "")}`,
    `LOCATION:${escapeIcs([event.location, event.locationAddress].filter(Boolean).join(", "))}`,
    `URL:${pageUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${event.title.replace(/[^a-z0-9áéíóöőúüű]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "esemeny"}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}
