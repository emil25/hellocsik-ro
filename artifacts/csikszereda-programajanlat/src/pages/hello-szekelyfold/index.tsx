import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Compass, Heart, MapPin, Menu, Plus, Search, X } from "lucide-react";
import { RegionalPoster } from "@/components/RegionalPortal";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import { useFavorites } from "@/hooks/use-favorites";
import { cityForEvent, REGION_PLACES, usePortalEvents, type RegionEvent } from "@/lib/regional-events";
import { getEventPriceLabel } from "@/lib/event-links";
import { getEventSource } from "@/lib/event-meta";
import { withEventPresentation, CSIK_1956_POSTER_URL } from "@/lib/event-presentation";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { matchesDiscoveryEvent, sortDiscoveryEvents } from "../../../../../shared/event-discovery.mjs";
import { october1956Programs } from "../../../../../shared/october-1956.mjs";
import "./styles.css";

const PAGE = "/hello-szekelyfold";
const paid = (event: RegionEvent) => event.promotionStatus === "paid" && event.promotionPlan !== "free";
const promotion = (event: RegionEvent) => paid(event) ? "Fizetett kiemelés" : event.featured ? "Kiemelt ajánló" : "";
const periods = [
  { value: "all", label: "Bármikor" },
  { value: "today", label: "Ma" },
  { value: "tomorrow", label: "Holnap" },
  { value: "week", label: "Ezen a héten" },
  { value: "weekend", label: "Hétvégén" },
  { value: "month", label: "Ebben a hónapban" },
];

function eventDate(event: RegionEvent) {
  if (event.endDate && Date.parse(event.startDate) < Date.now()) return `Folyamatban · ${formatShortDate(event.endDate).replace(/\.$/, "")}-ig`;
  return `${formatShortDate(event.startDate)} · ${formatTime(event.startDate)}`;
}

function NewBrand({ onHome }: { onHome?: () => void }) {
  return <Link href={PAGE} className="hsx-brand" onClick={onHome} aria-label="Hello Székelyföld – új főoldal"><span className="hsx-brand-symbol" aria-hidden="true"><Compass size={26} strokeWidth={1.7} /></span><span>hello<span>székelyföld</span><small>ESEMÉNYEK · PROGRAMOK · TALÁLKOZÁSOK</small></span></Link>;
}

function NewHeader({ onHome }: { onHome: () => void }) {
  const [open, setOpen] = useState(false);
  const { favoriteIds } = useFavorites();
  return <header className="hsx-header">
    <NewBrand onHome={() => { setOpen(false); onHome(); }} />
    <nav className={`hsx-nav${open ? " is-open" : ""}`} aria-label="Hello Székelyföld új főmenü">
      <a href="#hsx-programok" aria-current="page" onClick={() => setOpen(false)}>Felfedezés</a>
      <Link href="/szekelyfold/naptar">Naptár</Link>
      <Link href="/szekelyfold/varosok">Városok</Link>
      <Link href="/szekelyfold/szervezok">Szervezőknek</Link>
    </nav>
    <div className="hsx-header-actions">
      <Link href="/szekelyfold/erdekel" className="hsx-favorites-link" aria-label={`Elmentett programok${favoriteIds.length ? ` (${favoriteIds.length})` : ""}`}><Heart size={20} />{favoriteIds.length > 0 && <b>{favoriteIds.length}</b>}</Link>
      <Link href="/szekelyfold/bekuldese" className="hsx-submit"><Plus size={16} /><span>Esemény beküldése</span></Link>
      <button type="button" className="hsx-menu" onClick={() => setOpen(!open)} aria-label={open ? "Menü bezárása" : "Menü megnyitása"} aria-expanded={open}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
  </header>;
}

function EventDeck({ events, loading, error }: { events: RegionEvent[]; loading: boolean; error: boolean }) {
  const [selected, setSelected] = useState(0);
  const active = selected % Math.max(1, events.length);
  function step(direction: number) { setSelected((active + direction + events.length) % events.length); }
  if (loading) return <div className="hsx-deck-loading" aria-label="Kiemelt események betöltése" />;
  if (!events.length) return <div className="hsx-deck-empty"><CalendarDays size={40} /><h2>{error ? "Az ajánlók most nem érhetők el." : "Hamarosan új események érkeznek."}</h2><a href="#hsx-programok">Programkereső <ArrowDown size={18} /></a></div>;
  return <div className="hsx-deck-region" aria-label="Lapozható eseményajánló">
    <div className="hsx-deck">
      {events.map((event, index) => <article key={event.id} className={`hsx-deck-panel${active === index ? " is-active" : ""}`} style={{ "--panel-accent": ["#edb85c", "#b5cdb8", "#c5b8d9", "#e2ad9a"][index] } as CSSProperties}>
        <div className="hsx-deck-image"><RegionalPoster event={event} priority /><span className="hsx-deck-place"><MapPin size={12} />{cityForEvent(event)?.name ?? "Székelyföld"}</span>{promotion(event) && <span className={`hsx-promotion${paid(event) ? " is-paid" : ""}`}>{promotion(event)}</span>}</div>
        <div className="hsx-deck-copy"><p>{eventDate(event)}</p><h2>{event.title}</h2><div><span>{getEventPriceLabel(event)}</span>{active === index && <Link href={`/szekelyfold/esemeny/${event.id}`}>Megnézem <ArrowUpRight size={18} /></Link>}</div></div>
        {active !== index && <button type="button" className="hsx-deck-select" onClick={() => setSelected(index)} aria-label={`${event.title} megjelenítése`}><span>{String(index + 1).padStart(2, "0")}<ArrowUpRight size={18} /></span></button>}
      </article>)}
    </div>
    <div className="hsx-deck-bar"><span><b>{String(active + 1).padStart(2, "0")}</b> / {String(events.length).padStart(2, "0")} <i /> Kiemelt programok több városból</span><div><button type="button" onClick={() => step(-1)} aria-label="Előző ajánló"><ChevronLeft size={19} /></button><button type="button" onClick={() => step(1)} aria-label="Következő ajánló"><ChevronRight size={19} /></button></div></div>
    <div className="hsx-deck-mobile-tabs" aria-label="Válassz ajánlót">{events.map((event, index) => <button type="button" key={event.id} aria-pressed={active === index} onClick={() => setSelected(index)} aria-label={`${event.title} megjelenítése`}><RegionalPoster event={event} /><span>{cityForEvent(event)?.name ?? "Székelyföld"}</span></button>)}</div>
  </div>;
}

function NewEventCard({ event }: { event: RegionEvent }) {
  const source = getEventSource(withEventPresentation(event).newsLinks);
  return <article className="hsx-event" style={{ "--hsx-event-color": event.category?.color ?? "#bb693c" } as CSSProperties}>
    <Link href={`/szekelyfold/esemeny/${event.id}`} className="hsx-event-link">
      <div className="hsx-event-image"><RegionalPoster event={event} /><span className="hsx-event-category">{event.category?.name ?? "Program"}</span>{promotion(event) && <span className={`hsx-promotion${paid(event) ? " is-paid" : ""}`}>{promotion(event)}</span>}</div>
      <div className="hsx-event-body"><p className="hsx-event-date"><CalendarDays size={14} />{eventDate(event)}</p><h3>{event.title}</h3><p className="hsx-event-place"><MapPin size={14} />{cityForEvent(event)?.name ?? event.location}</p><p className="hsx-event-source">Forrás: {source.title}</p><div className="hsx-event-bottom"><span>{getEventPriceLabel(event)}</span><span>Részletek <ArrowUpRight size={17} /></span></div></div>
    </Link>
    <FavoriteButton eventId={event.id} className="hsx-event-save" />
  </article>;
}

export default function HelloSzekelyfoldHome() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const initial = new URLSearchParams(search);
  const [query, setQuery] = useState(initial.get("q") ?? "");
  const [city, setCity] = useState(initial.get("varos") ?? "");
  const [date, setDate] = useState(periods.some(item => item.value === initial.get("mikor")) ? initial.get("mikor")! : "all");
  const [category, setCategory] = useState("");
  const [collection, setCollection] = useState(false);
  const [visible, setVisible] = useState(12);
  const { data: events = [], isLoading, isError, refetch } = usePortalEvents();

  useEffect(() => {
    document.title = "Hello Székelyföld – Események és programok";
    const meta = document.querySelector('meta[name="description"]');
    const original = meta?.getAttribute("content");
    meta?.setAttribute("content", "Koncertek, színház, fesztiválok és közösségi események Székelyföldön. Keress város és időpont szerint, és mentsd el a kedvenc programjaidat.");
    return () => { if (original) meta?.setAttribute("content", original); };
  }, []);
  useEffect(() => setVisible(12), [query, city, date, category, collection]);

  const places = useMemo(() => REGION_PLACES.filter(place => events.some(event => cityForEvent(event)?.slug === place.slug)), [events]);
  const categories = useMemo(() => [...new Map(events.filter(event => event.category?.slug).map(event => [event.category!.slug, event.category!])).values()], [events]);
  const anniversary = useMemo(() => october1956Programs(events), [events]);
  const heroEvents = useMemo(() => {
    const ordered = [...events].sort((a, b) => Number(paid(b)) - Number(paid(a)) || Number(Date.parse(a.startDate) < Date.now()) - Number(Date.parse(b.startDate) < Date.now()) || Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Date.parse(a.startDate) - Date.parse(b.startDate));
    const picked: RegionEvent[] = ordered.filter(paid).slice(0, 4);
    const towns = new Set(picked.map(event => cityForEvent(event)?.slug ?? event.location));
    for (const event of ordered) {
      if (picked.length === 4) break;
      const town = cityForEvent(event)?.slug ?? event.location;
      if (!towns.has(town) && !picked.some(item => item.id === event.id)) { picked.push(event); towns.add(town); }
    }
    return [...picked, ...ordered.filter(event => !picked.some(item => item.id === event.id))].slice(0, 4);
  }, [events]);
  const filtered = useMemo(() => sortDiscoveryEvents((collection ? anniversary : events).filter(event => matchesDiscoveryEvent(event, { query, city, date, category }))), [events, anniversary, query, city, date, category, collection]);
  const activeFilters = Boolean(query || city || date !== "all" || category || collection);
  const cityName = REGION_PLACES.find(place => place.slug === city)?.name;

  function goToResults() { requestAnimationFrame(() => document.getElementById("hsx-programok")?.scrollIntoView({ behavior: "smooth", block: "start" })); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city) params.set("varos", city);
    if (date !== "all") params.set("mikor", date);
    navigate(`${PAGE}${params.size ? `?${params}` : ""}`, { replace: true });
    goToResults();
  }
  function reset() { setQuery(""); setCity(""); setDate("all"); setCategory(""); setCollection(false); navigate(PAGE, { replace: true }); }

  return <div className="hsx-page">
      <NewHeader onHome={() => { reset(); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
    <section className="hsx-hero hsx-wrap" aria-labelledby="hsx-title">
      <div className="hsx-intro"><div><p className="hsx-eyebrow">HELLO SZÉKELYFÖLD · ESEMÉNYAJÁNLÓ</p><h1 id="hsx-title">Székelyföldi események<span>.</span></h1></div><p>Koncertek, színház, fesztiválok.<br /> {isLoading ? "A programok betöltése…" : isError ? "A programok betöltése átmenetileg szünetel." : <><b>{events.length} aktuális program</b> · {places.length} település</>}</p></div>
      <EventDeck events={heroEvents} loading={isLoading} error={isError} />
    </section>

    <main className="hsx-content">
      <section className="hsx-finder hsx-wrap" aria-label="Programkereső">
        <div className="hsx-finder-label"><Search size={20} /><span>Programkereső<br /><b>város és dátum szerint</b></span></div>
        <form className="hsx-search" onSubmit={submit} aria-label="Székelyföldi programkereső">
          <label className="hsx-search-query"><Search size={20} /><span><small>Mit keresel?</small><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Program, előadó, helyszín…" aria-label="Program keresése" /></span></label>
          <label><MapPin size={19} /><span><small>Hol?</small><select value={city} onChange={event => setCity(event.target.value)} aria-label="Város kiválasztása"><option value="">Egész Székelyföld</option>{places.map(place => <option key={place.slug} value={place.slug}>{place.name}</option>)}</select></span><ChevronDown size={13} /></label>
          <label><CalendarDays size={19} /><span><small>Mikor?</small><select value={date} onChange={event => setDate(event.target.value)} aria-label="Időpont kiválasztása">{periods.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></span><ChevronDown size={13} /></label>
          <button type="submit">Keresés <ArrowRight size={20} /></button>
        </form>
      </section>
      <div className="hsx-city-strip hsx-wrap" aria-label="Programok településenként"><button type="button" aria-pressed={!city} onClick={() => { setCity(""); goToResults(); }}>Egész Székelyföld</button>{places.map(place => <button type="button" key={place.slug} aria-pressed={city === place.slug} onClick={() => { setCity(place.slug); goToResults(); }}>{place.name}<small>{events.filter(event => cityForEvent(event)?.slug === place.slug).length}</small></button>)}</div>
      <section id="hsx-programok" className="hsx-results hsx-wrap" aria-labelledby="hsx-results-title">
        <div className="hsx-results-heading"><div><p className="hsx-eyebrow">PROGRAMOK ÉS PLAKÁTOK</p><h2 id="hsx-results-title">{collection ? "1956-os emlékprogramok" : cityName ? `${cityName} programjai` : "Minden esemény"}</h2><p aria-live="polite">{isLoading ? "Betöltés…" : `${filtered.length} aktuális esemény`}{date !== "all" ? ` · ${periods.find(item => item.value === date)?.label}` : ""}</p></div><div className="hsx-result-actions"><div className="hsx-date-tabs" aria-label="Gyors időszűrő">{periods.filter(item => ["all", "today", "weekend"].includes(item.value)).map(item => <button key={item.value} type="button" aria-pressed={date === item.value} onClick={() => setDate(item.value)}>{item.value === "all" ? "Bármikor" : item.label}</button>)}</div><Link href="/szekelyfold/naptar" className="hsx-calendar-link"><CalendarDays size={17} /> Naptár <ArrowUpRight size={15} /></Link></div></div>
        <div className="hsx-catalog-controls"><div className="hsx-categories" role="group" aria-label="Programkategóriák"><button type="button" aria-pressed={!category} onClick={() => setCategory("")}>Minden program</button>{categories.map(item => <button type="button" key={item.slug} aria-pressed={category === item.slug} onClick={() => setCategory(item.slug)}><i style={{ background: item.color }} />{item.name}</button>)}</div>{activeFilters && <button type="button" className="hsx-reset" onClick={reset}><X size={14} />Szűrők törlése</button>}</div>
        {isError ? <div className="hsx-empty" role="alert"><h3>Az eseményeket nem sikerült betölteni.</h3><button type="button" onClick={() => refetch()}>Újrapróbálom</button></div> : isLoading ? <div className="hsx-grid hsx-loading" aria-label="Események betöltése">{Array.from({ length: 6 }, (_, index) => <span key={index} />)}</div> : filtered.length ? <div className="hsx-grid">{filtered.slice(0, visible).map(event => <NewEventCard key={event.id} event={event} />)}</div> : <div className="hsx-empty"><Search size={32} /><h3>Erre a keresésre most nincs program.</h3><p>Próbálj másik települést vagy időpontot.</p><button type="button" onClick={reset}>Minden program megmutatása</button></div>}
        {filtered.length > visible && <button type="button" className="hsx-more" onClick={() => setVisible(value => value + 12)}>További programok <span>{filtered.length - visible}</span><ArrowDown size={16} /></button>}
      </section>

      {!activeFilters && anniversary.length > 0 && <section className="hsx-edition hsx-wrap" aria-labelledby="hsx-edition-title"><div className="hsx-edition-art"><img src={CSIK_1956_POSTER_URL} alt="A csíkszeredai 1956-os megemlékezés plakátja" loading="lazy" /></div><div className="hsx-edition-copy"><span>KIEMELT PROGRAMSOROZAT · OKTÓBER 23.</span><h2 id="hsx-edition-title">1956 emlékezete<br />Székelyföldön</h2><p>Megemlékezések, hangversenyek és történelmi programok a 70. évfordulón.</p><button type="button" onClick={() => { setCollection(true); goToResults(); }}>{anniversary.length} emlékprogram <ArrowUpRight size={19} /></button></div></section>}

      <section className="hsx-organizer hsx-wrap"><div><p className="hsx-eyebrow">SZERVEZŐKNEK</p><h2>A te eseményednek is<br />itt a helye.</h2><p>A beküldés és a szervezői profil ingyenes. Csak a választható kiemelés fizetős.</p></div><div><Link href="/szekelyfold/bekuldese">Ingyenes eseménybeküldés <Plus size={18} /></Link><Link href="/szekelyfold/szervezoi-felulet">Szervezői regisztráció és belépés <ArrowUpRight size={15} /></Link></div></section>
    </main>

    <footer className="hsx-footer"><div className="hsx-wrap hsx-footer-main"><div><NewBrand onHome={reset} /><p>Székelyföld eseményei, egy helyen.</p></div><nav aria-label="Új főoldal lábléc"><a href="#hsx-programok">Programok</a><Link href="/szekelyfold/varosok">Városok</Link><Link href="/szekelyfold/helyszinek">Helyszínek</Link><Link href="/szekelyfold/forrasok">Források</Link><Link href="/szekelyfold/arak">Kiemelések és árak</Link></nav></div><div className="hsx-wrap hsx-footer-bottom"><span>© {new Date().getFullYear()} Hello Székelyföld</span><Link href="/szekelyfold/">Másik főoldalváltozat <ArrowUpRight size={13} /></Link><Link href="/klasszikus">HelloCsík <ArrowUpRight size={13} /></Link></div></footer>
  </div>;
}
