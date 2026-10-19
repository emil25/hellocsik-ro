import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { RegionalPoster } from "./RegionalPortal";
import { cityForEvent, type RegionEvent } from "@/lib/regional-events";
import { getEventPriceLabel } from "@/lib/event-links";
import { withEventPresentation } from "@/lib/event-presentation";
import { formatShortDate, formatTime } from "@/utils/date-format";
import "./regional-spotlight.css";

const isPaid = (event: RegionEvent) =>
  event.promotionStatus === "paid" && event.promotionPlan !== "free";

function eventBadge(event: RegionEvent) {
  if (isPaid(event)) return "Fizetett kiemelés";
  if (event.featured) return "Kiemelt ajánló";
  return "A programajánlóból";
}

const eventDay = (date: string) => new Intl.DateTimeFormat("hu-HU", { day: "2-digit", timeZone: "Europe/Bucharest" }).format(new Date(date));
const eventMonth = (date: string) => new Intl.DateTimeFormat("hu-HU", { month: "long", timeZone: "Europe/Bucharest" }).format(new Date(date));

export function RegionalMasthead({
  count,
  events = [],
  isLoading,
  cityLabel,
  areaLabel,
  onDate,
}: {
  count: number;
  events: RegionEvent[];
  isLoading: boolean;
  cityLabel?: string;
  areaLabel?: string;
  onDate: (value: string) => void;
}) {
  const [active, setActive] = useState(0);
  const spotlights = useMemo(() => {
    const upcoming = events
      .filter((event) => Date.parse(event.endDate || event.startDate) >= Date.now())
      .sort((a, b) =>
        Number(isPaid(b)) - Number(isPaid(a)) ||
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        Date.parse(a.startDate) - Date.parse(b.startDate),
      );
    const selected = upcoming.filter(isPaid).slice(0, 4);
    const towns = new Set(selected.map((event) => cityForEvent(event)?.slug ?? event.location));
    for (const event of upcoming) {
      if (selected.length >= 4) break;
      const town = cityForEvent(event)?.slug ?? event.location;
      if (!towns.has(town) && !selected.some((item) => item.id === event.id)) {
        selected.push(event);
        towns.add(town);
      }
    }
    for (const event of upcoming) {
      if (selected.length >= 4) break;
      if (!selected.some((item) => item.id === event.id)) selected.push(event);
    }
    return selected;
  }, [events]);

  const current = active % Math.max(1, spotlights.length);
  const selectedEvent = spotlights[current];
  const image = selectedEvent ? withEventPresentation(selectedEvent).imageUrl : undefined;
  const place = selectedEvent ? cityForEvent(selectedEvent)?.name ?? selectedEvent.location : "";
  const cycle = (direction: number) => setActive((current + direction + spotlights.length) % spotlights.length);

  return (
    <section className="sf-cinema" aria-labelledby="sf-cinema-heading">
      <div
        className="sf-cinema-atmosphere"
        aria-hidden="true"
        style={image ? { backgroundImage: `url(${JSON.stringify(image)})` } : undefined}
      />
      <div className="sf-cinema-top rl-container">
        <div className="sf-cinema-identity">
          <span><i /> HELLO SZÉKELYFÖLD</span>
          <h1 id="sf-cinema-heading">{cityLabel ?? areaLabel ?? "Székelyföld"} programjai</h1>
        </div>
        <div className="sf-cinema-top-actions">
          <span>{isLoading ? "Programok betöltése…" : `${count} aktuális program`}</span>
          <button type="button" onClick={() => onDate("all")}>Programot keresek <ArrowDown size={16} /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="sf-cinema-loading rl-container" aria-label="Kiemelt programok betöltése"><span /></div>
      ) : selectedEvent ? (
        <article className="sf-cinema-feature" key={selectedEvent.id}>
          <div className="sf-cinema-screen rl-container">
            <div className="sf-cinema-date" aria-hidden="true">
              <span>{eventMonth(selectedEvent.startDate)}</span>
              <b>{eventDay(selectedEvent.startDate)}</b>
              <small>{formatTime(selectedEvent.startDate)}</small>
            </div>
            <Link href={`/esemeny/${selectedEvent.id}`} className="sf-cinema-art" aria-label={`${selectedEvent.title} – plakát és részletek`}>
              <RegionalPoster event={selectedEvent} priority />
              <span>Plakát és részletek <ArrowUpRight size={15} /></span>
            </Link>
            <span className="sf-cinema-position" aria-hidden="true"><b>{String(current + 1).padStart(2, "0")}</b><i />{String(spotlights.length).padStart(2, "0")}</span>
          </div>
          <div className="sf-cinema-caption rl-container">
            <div className="sf-cinema-event-copy">
              <div className="sf-cinema-kicker">
                <span className={`sf-cinema-badge${isPaid(selectedEvent) ? " is-paid" : ""}`}>{eventBadge(selectedEvent)}</span>
                <span>{selectedEvent.category?.name ?? "Program"}</span>
                <span><MapPin size={13} />{place}</span>
              </div>
              <h2><Link href={`/esemeny/${selectedEvent.id}`}>{selectedEvent.title}</Link></h2>
              <div className="sf-cinema-event-meta">
                <span><CalendarDays size={14} />{formatShortDate(selectedEvent.startDate)} · {formatTime(selectedEvent.startDate)}</span>
                <i />
                <span>{getEventPriceLabel(selectedEvent)}</span>
              </div>
            </div>
            <Link href={`/esemeny/${selectedEvent.id}`} className="sf-cinema-details">Részletek <ArrowUpRight size={20} /></Link>
          </div>
        </article>
      ) : (
        <div className="sf-cinema-empty rl-container"><CalendarDays size={35} /><h2>Hamarosan új programok érkeznek.</h2><Link href="/naptar">Naptár megnyitása <ArrowUpRight size={16} /></Link></div>
      )}

      {!isLoading && spotlights.length > 1 && (
        <div className="sf-cinema-lineup">
          <div className="sf-cinema-lineup-inner rl-container">
            <div className="sf-cinema-choices" role="group" aria-label="Válassz kiemelt programot">
              {spotlights.map((event, index) => (
                <button type="button" key={event.id} aria-pressed={index === current} aria-label={`${event.title} megjelenítése a kiemelt ajánlóban`} onClick={() => setActive(index)}>
                  <span className="sf-cinema-choice-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="sf-cinema-choice-copy">
                    <small>{formatShortDate(event.startDate)} · {cityForEvent(event)?.name ?? "Székelyföld"}</small>
                    <strong>{event.title}</strong>
                  </span>
                </button>
              ))}
            </div>
            <div className="sf-cinema-controls">
              <button type="button" aria-label="Előző kiemelt program" onClick={() => cycle(-1)}><ChevronLeft size={19} /></button>
              <button type="button" aria-label="Következő kiemelt program" onClick={() => cycle(1)}><ChevronRight size={19} /></button>
            </div>
          </div>
        </div>
      )}
      <div className="sf-cinema-browse rl-container">
        <span>Mikor mennél?</span>
        <button type="button" onClick={() => onDate("today")}>Ma <ArrowRight size={13} /></button>
        <button type="button" onClick={() => onDate("week")}>Ezen a héten <ArrowRight size={13} /></button>
        <button type="button" onClick={() => onDate("weekend")}>Hétvégén <ArrowRight size={13} /></button>
        <Link href="/naptar"><CalendarDays size={14} /> Teljes naptár</Link>
      </div>
    </section>
  );
}
