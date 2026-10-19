import { useMemo } from "react";
import { Link } from "wouter";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Sparkles,
} from "lucide-react";
import { RegionalPoster } from "./RegionalPortal";
import {
  cityForEvent,
  type RegionEvent,
} from "@/lib/regional-events";
import { getEventPriceLabel } from "@/lib/event-links";
import { formatShortDate, formatTime } from "@/utils/date-format";

const isPaid = (event: RegionEvent) =>
  event.promotionStatus === "paid" && event.promotionPlan !== "free";

function eventBadge(event: RegionEvent) {
  if (isPaid(event)) return "Fizetett kiemelés";
  if (event.featured) return "Kiemelt ajánló";
  return event.category?.name ?? "Program";
}

function SpotlightCard({
  event,
  lead = false,
}: {
  event: RegionEvent;
  lead?: boolean;
}) {
  const place = cityForEvent(event)?.name ?? event.location;
  return (
    <Link
      href={`/esemeny/${event.id}`}
      className={`rs-spotlight-card${lead ? " is-lead" : ""}`}
      aria-label={`${event.title} – ${place}, ${formatShortDate(event.startDate)}`}
    >
      <div className="rs-spotlight-art">
        <RegionalPoster event={event} priority={lead} />
        <span className={`rs-spotlight-badge${isPaid(event) ? " is-paid" : ""}`}>
          {eventBadge(event)}
        </span>
        <span className="rs-spotlight-date">
          <b>{formatShortDate(event.startDate)}</b>
          <small>{formatTime(event.startDate)}</small>
        </span>
      </div>
      <div className="rs-spotlight-copy">
        <h2>{event.title}</h2>
        <p>
          <MapPin size={13} />
          <span>{place}</span>
        </p>
        <div className="rs-spotlight-foot">
          <span>{getEventPriceLabel(event)}</span>
          <span aria-hidden="true">
            <ArrowUpRight size={17} />
          </span>
        </div>
      </div>
    </Link>
  );
}

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
  const spotlights = useMemo(() => {
    const upcoming = events
      .filter((event) => Date.parse(event.endDate || event.startDate) >= Date.now())
      .sort(
        (a, b) =>
          Number(isPaid(b)) - Number(isPaid(a)) ||
          Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
          Date.parse(a.startDate) - Date.parse(b.startDate),
      );
    const selected: RegionEvent[] = [];
    const towns = new Set<string>();
    for (const event of upcoming) {
      const town = cityForEvent(event)?.slug ?? event.location;
      if (!towns.has(town)) {
        selected.push(event);
        towns.add(town);
      }
      if (selected.length === 3) break;
    }
    if (selected.length < 3) {
      for (const event of upcoming) {
        if (!selected.some((item) => item.id === event.id)) selected.push(event);
        if (selected.length === 3) break;
      }
    }
    return selected;
  }, [events]);

  return (
    <section className="rs-masthead" aria-labelledby="rs-masthead-title">
      <div className="rs-masthead-orbit" aria-hidden="true" />
      <div className="rs-masthead-inner rl-container">
        <div className="rs-masthead-copy">
          <span className="rs-masthead-label">
            <span /> HELLO SZÉKELYFÖLD <i /> PROGRAMAJÁNLÓ
          </span>
          <h1 id="rs-masthead-title">
            {cityLabel ?? areaLabel ?? "Programok"}
            <br />
            <span>{cityLabel || areaLabel ? "programjai." : "Székelyföldön."}</span>
          </h1>
          <p>
            Kiemelt események és friss programok a térség településeiről, egy
            helyen.
          </p>
          <div className="rs-masthead-actions">
            <button onClick={() => onDate("all")}>
              Programot keresek <ArrowDown size={18} />
            </button>
            <Link href="/naptar">
              <CalendarDays size={17} /> Naptár
            </Link>
          </div>
          <div className="rs-masthead-dates" aria-label="Gyors időszűrő">
            <span>Mikor?</span>
            <button onClick={() => onDate("today")}>Ma</button>
            <button onClick={() => onDate("week")}>Ezen a héten</button>
            <button onClick={() => onDate("weekend")}>
              Hétvégén <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="rs-spotlight-board" aria-label="Kiemelt események">
          <div className="rs-spotlight-heading">
            <span>
              <Sparkles size={15} /> AMIRE MOST ÉRDEMES FIGYELNI
            </span>
            <span className="rs-spotlight-count">
              {isLoading ? "BETÖLTÉS…" : `${count} AKTUÁLIS PROGRAM`}
            </span>
          </div>
          <div className="rs-spotlight-grid">
            {isLoading ? (
              <div className="rs-spotlight-loading" aria-label="Programok betöltése">
                <span />
                <span />
                <span />
              </div>
            ) : spotlights.length ? (
              <>
                <SpotlightCard event={spotlights[0]} lead />
                {spotlights.slice(1, 3).map((event) => (
                  <SpotlightCard key={event.id} event={event} />
                ))}
              </>
            ) : (
              <div className="rs-spotlight-empty">
                <CalendarDays size={27} />
                <strong>Hamarosan új programok érkeznek.</strong>
                <Link href="/naptar">
                  Naptár megnyitása <ArrowUpRight size={15} />
                </Link>
              </div>
            )}
          </div>
          <Link href="/plakatfal" className="rs-alt-home-link">
            Plakátfal nézet <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
