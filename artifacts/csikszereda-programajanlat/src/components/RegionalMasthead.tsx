import { useMemo, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, CalendarDays, Compass, MapPin } from "lucide-react";
import { RegionalPoster } from "./RegionalPortal";
import { cityForEvent, type RegionEvent } from "@/lib/regional-events";
import { getEventPriceLabel } from "@/lib/event-links";
import { formatShortDate, formatTime } from "@/utils/date-format";
import "./regional-spotlight.css";

const isPaid = (event: RegionEvent) =>
  event.promotionStatus === "paid" && event.promotionPlan !== "free";

function PortalPreview({ event, index }: { event: RegionEvent; index: number }) {
  const place = cityForEvent(event)?.name ?? event.location;
  const ongoing = Date.parse(event.startDate) < Date.now() && Boolean(event.endDate);
  return (
    <Link href={`/esemeny/${event.id}`} className="sf-discovery-card" aria-label={`${event.title} – ${place}, ${formatShortDate(event.startDate)}`}>
      <div className="sf-discovery-poster">
        <RegionalPoster event={event} priority={index < 3} />
        <span className="sf-discovery-city"><MapPin size={11} />{place}</span>
        {isPaid(event) ? (
          <span className="sf-discovery-promotion is-paid">Fizetett kiemelés</span>
        ) : event.featured ? (
          <span className="sf-discovery-promotion">Kiemelt ajánló</span>
        ) : null}
      </div>
      <div className="sf-discovery-preview-meta"><CalendarDays size={12} />{ongoing ? <>Folyamatban<i />{formatShortDate(event.endDate!).replace(/\.$/, "")}-ig</> : <>{formatShortDate(event.startDate)}<i />{formatTime(event.startDate)}</>}</div>
      <h3>{event.title}</h3>
      <div className="sf-discovery-preview-foot"><span>{event.category?.name ?? "Program"}</span><span>{getEventPriceLabel(event)}</span><ArrowUpRight size={16} /></div>
    </Link>
  );
}

export function RegionalMasthead({
  events = [],
  isLoading,
  cityLabel,
  areaLabel,
  onDate,
  children,
}: {
  count: number;
  events: RegionEvent[];
  isLoading: boolean;
  cityLabel?: string;
  areaLabel?: string;
  onDate: (value: string) => void;
  children?: ReactNode;
}) {
  const picks = useMemo(() => {
    const upcoming = events
      .filter((event) => Date.parse(event.endDate || event.startDate) >= Date.now())
      .sort((a, b) =>
        Number(isPaid(b)) - Number(isPaid(a)) ||
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        Date.parse(a.startDate) - Date.parse(b.startDate),
      );
    const selected = upcoming.filter(isPaid).slice(0, 5);
    const towns = new Set(selected.map((event) => cityForEvent(event)?.slug ?? event.location));
    for (const event of upcoming) {
      if (selected.length >= 5) break;
      const town = cityForEvent(event)?.slug ?? event.location;
      if (!towns.has(town) && !selected.some((item) => item.id === event.id)) {
        selected.push(event);
        towns.add(town);
      }
    }
    for (const event of upcoming) {
      if (selected.length >= 5) break;
      if (!selected.some((item) => item.id === event.id)) selected.push(event);
    }
    return selected;
  }, [events]);

  const pickedPlaces = new Set(picks.map((event) => cityForEvent(event)?.slug ?? event.location)).size;

  return (
    <section className="sf-discovery" aria-labelledby="sf-discovery-heading">
      <svg className="sf-discovery-lines" viewBox="0 0 1440 760" preserveAspectRatio="none" aria-hidden="true"><path d="M-100 490C180 170 330 700 780 230S1290 340 1550-90" /><path d="M-80 530C210 210 350 740 800 270S1320 380 1570-50" /><path d="M-60 570C240 250 370 780 820 310S1350 420 1590-10" /></svg>
      <header className="sf-discovery-heading rl-container">
        <span className="sf-discovery-label"><Compass size={14} /> SZÉKELYFÖLDI ESEMÉNYAJÁNLÓ</span>
        <h1 id="sf-discovery-heading">{cityLabel || areaLabel ? <>{cityLabel ?? areaLabel} <em>programjai.</em></> : <>Események <em>Székelyföldön.</em></>}</h1>
        <p>Koncertek, színház, fesztiválok és közösségi programok.<br className="sf-mobile-break" /> Keress város és időpont szerint.</p>
      </header>

      {children}

      <div className="sf-discovery-quick rl-container">
        <span>Gyorsválasztó</span>
        <button type="button" onClick={() => onDate("today")}>Ma <ArrowUpRight size={13} /></button>
        <button type="button" onClick={() => onDate("week")}>Ezen a héten <ArrowUpRight size={13} /></button>
        <button type="button" onClick={() => onDate("weekend")}>Hétvégén <ArrowUpRight size={13} /></button>
        <Link href="/naptar"><CalendarDays size={14} /> Naptár</Link>
      </div>

      <div className="sf-discovery-picks rl-container">
        <div className="sf-discovery-picks-heading">
          <div><h2><i /> Most a programajánlóban</h2>{!isLoading && pickedPlaces > 1 && <span>{pickedPlaces} település programjaiból</span>}</div>
          <button type="button" onClick={() => onDate("all")}>Összes program <ArrowRight size={16} /></button>
        </div>
        {isLoading ? (
          <div className="sf-discovery-loading" aria-label="Programajánló betöltése">{Array.from({ length: 5 }, (_, index) => <span key={index} />)}</div>
        ) : picks.length ? (
          <div className={`sf-discovery-posters${picks.length < 3 ? " is-sparse" : ""}`}>
            {picks.map((event, index) => <PortalPreview key={event.id} event={event} index={index} />)}
          </div>
        ) : (
          <div className="sf-discovery-empty"><CalendarDays size={26} /><p>Erre a helyre most nincs közelgő program. A keresőben más települést vagy időpontot is választhatsz.</p></div>
        )}
      </div>
    </section>
  );
}
