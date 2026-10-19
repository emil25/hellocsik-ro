import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Sparkles,
} from "lucide-react";
import { RegionalPoster } from "./RegionalPortal";
import { cityForEvent, type RegionEvent } from "@/lib/regional-events";
import { getEventPriceLabel } from "@/lib/event-links";
import { formatShortDate, formatTime } from "@/utils/date-format";

const isPaid = (event: RegionEvent) =>
  event.promotionStatus === "paid" && event.promotionPlan !== "free";

function eventBadge(event: RegionEvent) {
  if (isPaid(event)) return "Fizetett kiemelés";
  if (event.featured) return "Kiemelt ajánló";
  return event.category?.name ?? "Program";
}

function SceneEvent({
  event,
  index,
}: {
  event: RegionEvent;
  index: number;
}) {
  const city = cityForEvent(event)?.name ?? event.location;
  const classes = ["rs-scene-event", `rs-scene-event-${index + 1}`].join(" ");
  return (
    <Link
      href={`/esemeny/${event.id}`}
      className={classes}
      aria-label={`${event.title} – ${city}, ${formatShortDate(event.startDate)}`}
    >
      <span className="rs-scene-art">
        <RegionalPoster event={event} priority={index === 0} />
        <span className={`rs-scene-badge${isPaid(event) ? " is-paid" : ""}`}>
          {eventBadge(event)}
        </span>
        <span className="rs-scene-date">
          <b>{formatShortDate(event.startDate)}</b>
          <small>{formatTime(event.startDate)}</small>
        </span>
        <span className="rs-scene-number" aria-hidden="true">
          0{index + 1}
        </span>
      </span>
      <span className="rs-scene-copy">
        <strong>{event.title}</strong>
        <span>
          <MapPin size={12} /> {city}
        </span>
        <span className="rs-scene-mobile-date">
          <CalendarDays size={11} /> {formatShortDate(event.startDate)} · {formatTime(event.startDate)}
        </span>
        {index === 0 && (
          <span className="rs-scene-price">{getEventPriceLabel(event)}</span>
        )}
      </span>
      <span className="rs-scene-arrow" aria-hidden="true">
        <ArrowUpRight size={17} />
      </span>
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
  const [active, setActive] = useState(0);
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

  const allUpcoming = useMemo(
    () =>
      events
        .filter((event) => Date.parse(event.endDate || event.startDate) >= Date.now())
        .sort(
          (a, b) =>
            Number(isPaid(b)) - Number(isPaid(a)) ||
            Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            Date.parse(a.startDate) - Date.parse(b.startDate),
        ),
    [events],
  );
  const lead = allUpcoming.length ? allUpcoming[active % allUpcoming.length] : undefined;
  const related = lead
    ? [
        ...spotlights.filter((event) => event.id !== lead.id),
        ...allUpcoming.filter(
          (event) => event.id !== lead.id && !spotlights.some((item) => item.id === event.id),
        ),
      ].slice(0, 2)
    : [];
  const sceneEvents = lead ? [lead, ...related] : [];
  const current = active % Math.max(1, allUpcoming.length);

  return (
    <section className="rs-masthead rs-masthead-collage" aria-labelledby="rs-masthead-title">
      <div className="rs-masthead-decoration" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="rs-masthead-inner rl-container">
        <div className="rs-masthead-copy">
          <span className="rs-masthead-label">
            <span /> HELLO SZÉKELYFÖLD <i /> PROGRAMOK EGY HELYEN
          </span>
          <h1 id="rs-masthead-title">
            {cityLabel ?? areaLabel ?? "Események"}
            <br />
            <span>{cityLabel ? "közel hozzád." : areaLabel ? "a térségben." : "Székelyföldön."}</span>
          </h1>
          <p>
            Koncertek, előadások, fesztiválok és közösségi programok a térség településeiről.
          </p>
          <div className="rs-masthead-actions">
            <button onClick={() => onDate("all")}>
              Programok böngészése <ArrowDown size={17} />
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
          <div className="rs-masthead-region-note">
            <span><MapPin size={14} /> {cityLabel ?? areaLabel ?? "Székelyföld"}</span>
            <i />
            <span>{count} közelgő program</span>
          </div>
        </div>

        <div className="rs-event-stage" aria-label="Válogatás a közelgő programokból">
          <div className="rs-stage-head">
            <span><Sparkles size={15} /> MOST ÉRDEMES FIGYELNI</span>
            <span>{isLoading ? "BETÖLTÉS…" : `${count} PROGRAM`}</span>
          </div>
          {isLoading ? (
            <div className="rs-scene-loading" aria-label="Programok betöltése">
              <span /><span /><span />
            </div>
          ) : sceneEvents.length ? (
            <div className={`rs-poster-scene${sceneEvents.length < 3 ? " is-sparse" : ""}`}>
              <span className="rs-scene-orbit rs-scene-orbit-one" aria-hidden="true" />
              <span className="rs-scene-orbit rs-scene-orbit-two" aria-hidden="true" />
              {sceneEvents.map((event, index) => (
                <SceneEvent key={`${event.id}-${index}`} event={event} index={index} />
              ))}
              <span className="rs-scene-pin" aria-hidden="true"><MapPin size={15} /> SZÉKELYFÖLD</span>
              <span className="rs-scene-stamp" aria-hidden="true">KÖZELGŐ<br />PROGRAMOK</span>
            </div>
          ) : (
            <div className="rs-scene-empty">
              <CalendarDays size={28} />
              <strong>Hamarosan új programok érkeznek.</strong>
              <Link href="/naptar">Naptár megnyitása <ArrowUpRight size={15} /></Link>
            </div>
          )}
          <div className="rs-stage-foot">
            <Link href="/plakatfal">Az összes plakát <ArrowUpRight size={15} /></Link>
            {allUpcoming.length > 1 && (
              <div className="rs-scene-controls" aria-label="Kiemelt események lapozása">
                <span>{String(current + 1).padStart(2, "0")} <i /> {String(allUpcoming.length).padStart(2, "0")}</span>
                <button
                  onClick={() => setActive((value) => (value - 1 + allUpcoming.length) % allUpcoming.length)}
                  aria-label="Előző program"
                ><ChevronLeft size={16} /></button>
                <button
                  onClick={() => setActive((value) => (value + 1) % allUpcoming.length)}
                  aria-label="Következő program"
                ><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
