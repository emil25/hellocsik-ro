import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Search,
  Ticket,
} from "lucide-react";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import { Regional56Feature } from "./Regional56Feature";
import { RegionalPoster } from "./RegionalPortal";
import {
  REGION_PLACES,
  cityForEvent,
  normalizeSearch,
  usePortalEvents,
  type RegionEvent,
} from "@/lib/regional-events";
import { getEventPriceLabel } from "@/lib/event-links";
import { formatShortDate, formatTime } from "@/utils/date-format";
import {
  matchesDiscoveryEvent,
  sortDiscoveryEvents,
} from "../../../../shared/event-discovery.mjs";
import "./regional-poster-wall.css";

const paid = (event: RegionEvent) =>
  event.promotionStatus === "paid" && event.promotionPlan !== "free";
const badge = (event: RegionEvent) =>
  paid(event) ? "Fizetett kiemelés" : event.featured ? "Kiemelt ajánló" : "";

function PosterCard({ event, lead = false }: { event: RegionEvent; lead?: boolean }) {
  return (
    <article className={`rpf-card${lead ? " rpf-card-lead" : ""}`}>
      <Link href={`/esemeny/${event.id}`} className="rpf-card-link">
        <div className="rpf-card-image">
          <RegionalPoster event={event} priority={lead} />
          <span className="rpf-category">{event.category?.name ?? "Program"}</span>
          {badge(event) && <span className="rpf-paid">{badge(event)}</span>}
          {lead && <span className="rpf-lead-mark">A hét ajánlata</span>}
        </div>
        <div className="rpf-card-copy">
          <div className="rpf-card-meta">
            <span><CalendarDays size={14} />{formatShortDate(event.startDate)} · {formatTime(event.startDate)}</span>
            <span><MapPin size={14} />{cityForEvent(event)?.name ?? "Székelyföld"}</span>
          </div>
          <h2>{event.title}</h2>
          <div className="rpf-card-foot">
            <span>{getEventPriceLabel(event)}</span>
            <span className="rpf-details">Részletek <ArrowUpRight size={16} /></span>
          </div>
        </div>
      </Link>
      <FavoriteButton eventId={event.id} className="rpf-save" />
    </article>
  );
}

export function RegionalPosterWall() {
  const { data: events = [], isLoading, isError, refetch } = usePortalEvents();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("week");
  const [category, setCategory] = useState("");
  const [visible, setVisible] = useState(12);

  const categories = useMemo(
    () => [...new Map(events.filter(event => event.category?.slug).map(event => [event.category!.slug, event.category!.name])).entries()],
    [events],
  );
  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    return sortDiscoveryEvents(events.filter(event => {
      if (city && cityForEvent(event)?.slug !== city) return false;
      if (date !== "all" && !matchesDiscoveryEvent(event, { date })) return false;
      if (category && event.category?.slug !== category) return false;
      if (q && !normalizeSearch(`${event.title} ${event.location} ${event.description ?? ""}`).includes(q)) return false;
      return true;
    })).sort((a, b) => Number(paid(b)) - Number(paid(a)) || Number(b.featured) - Number(a.featured));
  }, [events, city, date, category, query]);

  return (
    <div className="rpf-home">
      <section className="rpf-opening">
        <div className="rpf-opening-top rpf-wrap">
          <span>HELLO SZÉKELYFÖLD <i /> PROGRAMFAL</span>
          <Link href="/">Vissza az áttekintő főoldalra <ArrowUpRight size={16} /></Link>
        </div>
        <div className="rpf-opening-main rpf-wrap">
          <div className="rpf-opening-copy">
            <p className="rpf-kicker">HARGITA · HÁROMSZÉK · MAROS</p>
            <h1>Székelyföldi<br /><em>programnaptár</em></h1>
            <p className="rpf-opening-note">Válassz időpontot vagy települést, és böngészd a közelgő események plakátjait.</p>
            <div className="rpf-opening-actions">
              <a href="#rpf-events">Események böngészése <ArrowRight size={17} /></a>
              <Link href="/bekuldese"><Ticket size={16} /> Ingyenes beküldés</Link>
            </div>
          </div>
          <div className="rpf-opening-index" aria-label="Az oldal adatai">
            <span>AKTUÁLIS PROGRAMOK</span>
            <strong>{isLoading ? "—" : events.length.toString().padStart(2, "0")}</strong>
            <small>közelgő esemény</small>
            <div><b>01</b><span>Keresés város és dátum szerint</span></div>
            <div><b>02</b><span>Plakát, jegyár és részletek egy helyen</span></div>
          </div>
        </div>
      </section>

      <section className="rpf-filter-band" aria-label="Események szűrése">
        <div className="rpf-wrap rpf-filter-row">
          <label className="rpf-query"><Search size={19} /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Program vagy előadó keresése" aria-label="Program vagy előadó keresése" /></label>
          <label><MapPin size={18} /><select aria-label="Település" value={city} onChange={event => setCity(event.target.value)}><option value="">Minden település</option>{REGION_PLACES.filter(place => place.city).map(place => <option key={place.slug} value={place.slug}>{place.name}</option>)}</select></label>
          <label><CalendarDays size={18} /><select aria-label="Időszak" value={date} onChange={event => setDate(event.target.value)}><option value="week">Ezen a héten</option><option value="weekend">Hétvégén</option><option value="month">Ebben a hónapban</option><option value="all">Bármikor</option></select></label>
        </div>
      </section>

      {!isError && <Regional56Feature events={events} initialCity={city} />}

      <main className="rpf-wrap rpf-events" id="rpf-events">
        <div className="rpf-events-heading">
          <div><span className="rpf-kicker">VÁLOGATÁS</span><h2>{date === "week" ? "Ezen a héten" : date === "weekend" ? "Hétvégi programok" : date === "month" ? "Közelgő programok" : "Minden esemény"}<small>{filtered.length}</small></h2></div>
          <Link href="/naptar">Naptár nézet <ArrowUpRight size={17} /></Link>
        </div>
        <div className="rpf-categories" aria-label="Kategóriák">
          <button aria-pressed={!category} onClick={() => setCategory("")}>Mind</button>
          {categories.map(([slug, name]) => <button key={slug} aria-pressed={category === slug} onClick={() => setCategory(category === slug ? "" : slug)}>{name}</button>)}
        </div>
        {isError ? <div className="rpf-empty" role="alert"><p>Az eseményeket nem sikerült betölteni.</p><button onClick={() => refetch()}>Újrapróbálom</button></div> : isLoading ? <div className="rpf-empty">Programok betöltése…</div> : filtered.length ? <div className="rpf-wall">{filtered.slice(0, visible).map((event, index) => <PosterCard key={event.id} event={event} lead={index === 0 && Boolean(badge(event))} />)}</div> : <div className="rpf-empty"><p>Erre a szűrésre most nincs program.</p><button onClick={() => { setDate("all"); setCity(""); setCategory(""); setQuery(""); }}>Minden esemény megmutatása</button></div>}
        {filtered.length > visible && <button className="rpf-more" onClick={() => setVisible(value => value + 8)}>További programok <ArrowRight size={17} /></button>}
      </main>
    </div>
  );
}
