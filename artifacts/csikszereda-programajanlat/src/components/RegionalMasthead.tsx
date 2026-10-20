import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { RegionalPoster } from "./RegionalPortal";
import { cityForEvent, type RegionEvent } from "@/lib/regional-events";
import { getEventPriceLabel } from "@/lib/event-links";
import { formatShortDate, formatTime } from "@/utils/date-format";
import "./regional-spotlight.css";

const paid = (event: RegionEvent) => event.promotionStatus === "paid" && event.promotionPlan !== "free";
const eventDate = (event: RegionEvent) => Date.parse(event.startDate) < Date.now() && event.endDate
  ? `Folyamatban · ${formatShortDate(event.endDate).replace(/\.$/, "")}-ig`
  : `${formatShortDate(event.startDate)} · ${formatTime(event.startDate)}`;

function Poster({ event, position, linkBase, onSelect }: { event: RegionEvent; position: "lead" | "left" | "right"; linkBase: string; onSelect: () => void }) {
  const href = `${linkBase}/esemeny/${event.id}`;
  return <article className={`rf-poster rf-poster-${position}`}>
    <div className="rf-poster-image">
      <RegionalPoster event={event} priority backdrop={false} />
      {position !== "lead" && <button type="button" onClick={onSelect} aria-label={`${event.title} előtérbe hozása`}><span>Megnézem <ArrowUpRight size={16} /></span></button>}
      {position === "lead" && <Link href={href} className="rf-poster-image-link" aria-label={`${event.title} részletei`} />}
    </div>
    <div className="rf-poster-caption">
      <span className="rf-poster-place"><MapPin size={12} />{cityForEvent(event)?.name ?? event.location}</span>
      <h2>{position === "lead" ? <Link href={href}>{event.title}</Link> : <button type="button" onClick={onSelect}>{event.title}</button>}</h2>
      <p>{eventDate(event)}</p>
    </div>
  </article>;
}

export function RegionalMasthead({ count, events = [], isLoading, cityLabel, areaLabel, onDate, linkBase = "" }: {
  count: number; events: RegionEvent[]; isLoading: boolean; cityLabel?: string; areaLabel?: string; onDate: (value: string) => void; linkBase?: string;
}) {
  const [selected, setSelected] = useState(0);
  const picks = useMemo(() => {
    const ordered = events.filter(event => Date.parse(event.endDate || event.startDate) >= Date.now()).sort((a, b) =>
      Number(paid(b)) - Number(paid(a)) || Number(Date.parse(a.startDate) < Date.now()) - Number(Date.parse(b.startDate) < Date.now()) || Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Date.parse(a.startDate) - Date.parse(b.startDate));
    const opening: RegionEvent[] = [];
    const towns = new Set<string>();
    for (const event of ordered) {
      const town = cityForEvent(event)?.slug ?? event.location;
      if (paid(event) || !towns.has(town)) { opening.push(event); towns.add(town); }
      if (opening.length === 6) break;
    }
    return [...opening, ...ordered.filter(event => !opening.some(item => item.id === event.id))].slice(0, 6);
  }, [events]);
  const active = selected % Math.max(1, picks.length);
  const main = picks[active];
  const previous = picks.length > 1 ? picks[(active + picks.length - 1) % picks.length] : undefined;
  const next = picks.length > 2 ? picks[(active + 1) % picks.length] : undefined;
  function step(offset: number) { setSelected((active + offset + picks.length) % picks.length); }

  return <section className="rf-hero" aria-labelledby="rf-title">
    <div className="rf-wrap">
      <div className="rf-heading"><div><p className="rf-eyebrow"><span /> HELLO SZÉKELYFÖLD · PROGRAMAJÁNLÓ</p><h1 id="rf-title">{cityLabel ?? areaLabel ?? "Programok"}<span>{cityLabel || areaLabel ? "programjai." : "Székelyföldön."}</span></h1></div><div className="rf-heading-aside"><p>Koncertek, színház, fesztiválok és közösségi programok.<br />Több településről, egy helyen.</p><Link href={`${linkBase}/naptar`}><CalendarDays size={16} /> Naptár <ArrowUpRight size={15} /></Link></div></div>
      {isLoading ? <div className="rf-loading" aria-label="Ajánlók betöltése"><span /><span /><span /></div> : main ? <div className="rf-stage" style={{ "--rf-poster-count": picks.length } as CSSProperties}>
        <div className="rf-stage-note"><span>{paid(main) ? "FIZETETT KIEMELÉS" : main.featured ? "KIEMELT AJÁNLÓ" : "PROGRAMAJÁNLÓ"}</span><span>{String(active + 1).padStart(2, "0")}<i />{String(picks.length).padStart(2, "0")}</span></div>
        {previous && <Poster key={`left-${previous.id}`} event={previous} position="left" linkBase={linkBase} onSelect={() => step(-1)} />}
        <Poster key={`lead-${main.id}`} event={main} position="lead" linkBase={linkBase} onSelect={() => {}} />
        {next && <Poster key={`right-${next.id}`} event={next} position="right" linkBase={linkBase} onSelect={() => step(1)} />}
        <div className="rf-active-detail"><span>{getEventPriceLabel(main)}</span><Link href={`${linkBase}/esemeny/${main.id}`}>Az esemény részletei <ArrowUpRight size={18} /></Link></div>
        {picks.length > 1 && <div className="rf-navigation" aria-label="Ajánlók lapozása"><button type="button" aria-label="Előző kiemelt program" onClick={() => step(-1)}><ChevronLeft size={20} /></button><div className="rf-dots">{picks.map((event, index) => <button type="button" key={event.id} aria-label={`${event.title} megjelenítése`} aria-pressed={active === index} onClick={() => setSelected(index)} />)}</div><button type="button" aria-label="Következő kiemelt program" onClick={() => step(1)}><ChevronRight size={20} /></button></div>}
      </div> : <div className="rf-empty"><CalendarDays size={36} /><h2>Hamarosan új programok érkeznek.</h2><Link href={`${linkBase}/naptar`}>Naptár megnyitása <ArrowUpRight size={16} /></Link></div>}
      <div className="rf-bottom"><button type="button" className="rf-browse" onClick={() => onDate("all")}>Minden program <ArrowDown size={16} /></button><div className="rf-presets" aria-label="Gyors időszűrő"><span>Mikor?</span><button type="button" onClick={() => onDate("today")}>Ma</button><button type="button" onClick={() => onDate("week")}>Ezen a héten</button><button type="button" onClick={() => onDate("weekend")}>Hétvégén</button></div><span className="rf-count">{isLoading ? "Betöltés…" : `${count} aktuális program`}</span></div>
    </div>
  </section>;
}
