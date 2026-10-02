import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronRight, MapPin, Search, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatTime } from "@/utils/date-format";
import { getEventPriceLabel } from "@/lib/event-links";
import { REGION_COUNTIES } from "@/lib/region";

export const REGION_CITIES = [
  { slug: "csikszereda", name: "Csíkszereda", short: "Csík", keys: ["csíkszereda", "miercurea ciuc"] },
  { slug: "szekelyudvarhely", name: "Székelyudvarhely", short: "Udvarhely", keys: ["székelyudvarhely", "odorheiu secuiesc"] },
  { slug: "gyergyoszentmiklos", name: "Gyergyószentmiklós", short: "Gyergyó", keys: ["gyergyószentmiklós", "gheorgheni"] },
  { slug: "sepsiszentgyorgy", name: "Sepsiszentgyörgy", short: "Sepsi", keys: ["sepsiszentgyörgy", "sfântu gheorghe", "sfantu gheorghe"] },
  { slug: "kezdivasarhely", name: "Kézdivásárhely", short: "Kézdi", keys: ["kézdivásárhely", "târgu secuiesc", "targu secuiesc"] },
  { slug: "marosvasarhely", name: "Marosvásárhely", short: "Maros", keys: ["marosvásárhely", "târgu mureș", "targu mures"] },
  { slug: "szovata", name: "Szováta", short: "Szováta", keys: ["szováta", "sovata"] },
] as const;

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("hu");
const eventText = (event: any) => `${event.title} ${event.location} ${event.locationAddress ?? ""} ${event.description ?? ""}`;
const cityForEvent = (event: any) => REGION_CITIES.find(city => city.keys.some(key => normalize(eventText(event)).includes(normalize(key))));

function SmallEventCard({ event, index }: { event: any; index: number }) {
  const [imageError, setImageError] = useState(false);
  const city = cityForEvent(event);
  const fallback = event.category?.color ?? "#1b5446";
  return (
    <Link href={`/esemeny/${event.id}`} className="szf-event-card group">
      <div className="szf-event-index">{String(index + 1).padStart(2, "0")}</div>
      <div className="szf-event-image" style={{ background: `linear-gradient(135deg, ${fallback}, #102e2a)` }}>
        {event.imageUrl && !imageError ? <img src={event.imageUrl} alt="" loading="lazy" onError={() => setImageError(true)} /> : <CalendarDays size={28} />}
        <span className="szf-event-type">{event.category?.name ?? "Program"}</span>
      </div>
      <div className="szf-event-body">
        <div className="szf-event-date"><span>{formatDate(event.startDate)}</span><b>{formatTime(event.startDate)}</b></div>
        <h3>{event.title}</h3>
        <p><MapPin size={14} /> {event.location}</p>
        <div className="szf-event-footer"><span>{city?.short ?? "Székelyföld"}</span><strong>{getEventPriceLabel(event)}</strong></div>
      </div>
      <ArrowUpRight className="szf-event-arrow" size={18} />
    </Link>
  );
}

function CityRail({ events }: { events: any[] }) {
  return (
    <section className="szf-city-rail" aria-label="Városok">
      <div className="szf-city-rail-heading"><span>VÁROSOK</span><p>Válassz egy várost, vagy nézd meg az egész régiót.</p></div>
      <div className="szf-city-rail-list">
        <Link href="#programok" className="szf-city-chip szf-city-chip-all"><b>{events.length}</b><span>Mind</span><ChevronRight size={15} /></Link>
        {REGION_CITIES.map(city => {
          const count = events.filter(event => city.keys.some(key => normalize(eventText(event)).includes(normalize(key)))).length;
          return <Link href={`/varos/${city.slug}`} className="szf-city-chip" key={city.slug}><b>{String(count).padStart(2, "0")}</b><span>{city.short}</span><ChevronRight size={15} /></Link>;
        })}
      </div>
    </section>
  );
}

export function SzekelyfoldHome() {
  const { data, isLoading, isError } = useListUpcomingEvents({ limit: 100 });
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const events = data?.events ?? [];
  const visibleEvents = useMemo(() => events.filter(event => {
    const matchesQuery = !query.trim() || normalize(eventText(event)).includes(normalize(query));
    const selected = REGION_CITIES.find(item => item.slug === city);
    const matchesCity = !selected || selected.keys.some(key => normalize(eventText(event)).includes(normalize(key)));
    return matchesQuery && matchesCity;
  }).sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate)), [events, query, city]);

  return <div className="szf-home">
    <section className="szf-intro">
      <div className="szf-intro-top"><Link href="/" className="szf-wordmark"><span className="szf-wordmark-dot" /> program<span>.ro</span></Link><div className="szf-intro-meta"><span>ÉLŐ PROGRAMTÉRKÉP</span><span>{REGION_COUNTIES.join(" · ")}</span></div></div>
      <div className="szf-intro-grid">
        <div className="szf-intro-copy">
          <p className="szf-kicker"><Sparkles size={14} /> SZÉKELYFÖLD PROGRAMTÉR</p>
          <h1>Egy régió.<br /><em>Sok történet.</em></h1>
          <p className="szf-lead">Minden koncert, film, előadás, kiállítás és közösségi esemény egy helyen. Nézd meg, mi történik ma a közeledben.</p>
          <div className="szf-quick-links"><a href="#programok">Összes program <ArrowUpRight size={17} /></a><Link href="/naptar">Naptár <CalendarDays size={17} /></Link></div>
        </div>
        <div className="szf-intro-side"><div className="szf-stats"><div><strong>{events.length || "—"}</strong><span>közelgő<br />program</span></div><div><strong>{REGION_CITIES.filter(city => events.some(event => city.keys.some(key => normalize(eventText(event)).includes(normalize(key))))).length || "—"}</strong><span>aktív<br />város</span></div></div><div className="szf-side-note"><span>01</span><p>Városról városra fedezd fel Székelyföld programjait.</p></div></div>
      </div>
    </section>
    <CityRail events={events} />
    <section className="szf-programs" id="programok">
      <div className="szf-programs-heading"><div><p className="szf-kicker">KÖVETKEZŐ PROGRAMOK</p><h2>Mi történik a régióban?</h2></div><div className="szf-search"><Search size={17} /><Input aria-label="Keresés a programok között" placeholder="Keress programot vagy helyszínt" value={query} onChange={event => setQuery(event.target.value)} /></div></div>
      {city && <div className="szf-active-filter">{REGION_CITIES.find(item => item.slug === city)?.name}<button onClick={() => setCity(null)}>Összes város</button></div>}
      {isLoading ? <div className="szf-event-grid">{Array.from({ length: 6 }, (_, index) => <div className="szf-skeleton" key={index} />)}</div> : isError ? <div className="szf-empty">A programok most nem tölthetők be. Próbáld újra később.</div> : visibleEvents.length ? <div className="szf-event-grid">{visibleEvents.map((event, index) => <SmallEventCard key={event.id} event={event} index={index} />)}</div> : <div className="szf-empty">Erre a keresésre nincs program.</div>}
    </section>
    <section className="szf-submit-strip"><div><span>SAJÁT PROGRAM?</span><h2>Te is hozzáadhatod a régió történetéhez.</h2></div><Link href="/bekuldese">Program beküldése <ArrowUpRight size={17} /></Link></section>
  </div>;
}

export function CityEventsPage({ slug }: { slug?: string }) {
  const city = REGION_CITIES.find(item => item.slug === slug) ?? REGION_CITIES[0];
  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const events = (data?.events ?? []).filter(event => city.keys.some(key => normalize(eventText(event)).includes(normalize(key))));
  return <div className="szf-city-page"><div className="szf-city-page-head"><Link href="/" className="szf-back">← Minden program</Link><p className="szf-kicker">VÁROSI PROGRAMTÉR</p><h1>{city.name}</h1><p>{events.length} közelgő program ezen a városon belül.</p></div><div className="szf-city-page-body">{isLoading ? <div className="szf-event-grid">{Array.from({ length: 3 }, (_, index) => <div className="szf-skeleton" key={index} />)}</div> : events.length ? <div className="szf-event-grid">{events.map((event, index) => <SmallEventCard key={event.id} event={event} index={index} />)}</div> : <div className="szf-empty">Ehhez a városhoz most nincs rögzített közelgő esemény.</div>}</div></div>;
}
