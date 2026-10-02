import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Heart, MapPin, Menu, Plus, Search, SlidersHorizontal, Ticket, X } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Event as ApiEvent } from "@workspace/api-client-react";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import { useFavorites } from "@/hooks/use-favorites";
import { getEventLinks } from "@/lib/event-links";
import { getVenueInfo } from "@/lib/venues";
import { formatShortDate, formatTime } from "@/utils/date-format";
import "./szekelyfold-home.css";

type RegionEvent = ApiEvent & { promotionStatus?: string; promotionPlan?: string };
type DateFilter = "all" | "today" | "weekend";
export const REGION_CITIES = [
  { slug: "csikszereda", name: "Csíkszereda", keys: ["csikszereda", "miercurea ciuc", "csiksomlyo"] },
  { slug: "szekelyudvarhely", name: "Székelyudvarhely", keys: ["szekelyudvarhely", "odorheiu secuiesc"] },
  { slug: "gyergyoszentmiklos", name: "Gyergyószentmiklós", keys: ["gyergyoszentmiklos", "gheorgheni"] },
  { slug: "sepsiszentgyorgy", name: "Sepsiszentgyörgy", keys: ["sepsiszentgyorgy", "sfantu gheorghe"] },
  { slug: "kezdivasarhely", name: "Kézdivásárhely", keys: ["kezdivasarhely", "targu secuiesc"] },
  { slug: "marosvasarhely", name: "Marosvásárhely", keys: ["marosvasarhely", "targu mures"] },
  { slug: "szovata", name: "Szováta", keys: ["szovata", "sovata"] },
  { slug: "szekelykeresztur", name: "Székelykeresztúr", keys: ["szekelykeresztur", "cristuru secuiesc"] },
] as const;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("hu");
const regionDay = (date: string | Date) => new Date(date).toLocaleDateString("sv-SE", { timeZone: "Europe/Bucharest" });
function cityForEvent(event: RegionEvent) {
  const match = (value: string) => REGION_CITIES.find(city => city.keys.some(key => normalize(value).includes(key)));
  return match(`${event.location} ${event.locationAddress ?? ""}`) ?? match(event.title) ?? match(getVenueInfo(event.location).address ?? "");
}

function useRegionEvents() {
  return useQuery({
    queryKey: ["region-all-upcoming"],
    queryFn: async ({ signal }) => {
      const events: RegionEvent[] = [];
      for (let offset = 0; ; offset += 100) {
        const response = await fetch(`/api/events?limit=100&offset=${offset}`, { signal });
        if (!response.ok) throw new Error("A programok nem tölthetők be.");
        const page = await response.json() as { events: RegionEvent[] };
        events.push(...page.events);
        if (page.events.length < 100) break;
      }
      return Array.from(new Map(events.map(event => [event.id, event])).values()).sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
    },
  });
}

function priceLabel(event: RegionEvent) {
  return event.price?.trim() || (getEventLinks(event).ticketUrl ? "Jegyvásárlás" : "Belépés: részletekben");
}

function Brand() {
  return <Link href="/" className="pg-brand" aria-label="Program.ro – Székelyföld főoldal"><span className="pg-brand-symbol"><Ticket size={24} strokeWidth={2.4} /></span><span>program<span className="pg-brand-domain">.ro</span><small>Székelyföld</small></span></Link>;
}

function RegionHeader({ cityName }: { cityName?: string }) {
  const [open, setOpen] = useState(false);
  const { favoriteIds } = useFavorites();
  return <header className="pg-header"><div className="pg-header-inner"><Brand /><nav aria-label="Főmenü" className={open ? "pg-nav pg-nav-open" : "pg-nav"}>
    <Link href="/#kozelgo" className="pg-nav-active" onClick={() => setOpen(false)}>Programok</Link>
    <Link href="/#varosok" onClick={() => setOpen(false)}>Városok</Link><Link href="/naptar">Naptár</Link><Link href="/szervezok">Szervezőknek</Link>
    <Link href="/erdekel" className="pg-nav-saved"><Heart size={17} /> Mentett{favoriteIds.length > 0 && <b>{favoriteIds.length}</b>}</Link>
  </nav><Link href="/bekuldese" className="pg-submit" aria-label="Eseményt küldök"><Plus size={17} /><span>Eseményt küldök</span></Link><button className="pg-menu" aria-label={open ? "Menü bezárása" : "Menü megnyitása"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>{cityName && <div className="pg-city-breadcrumb"><Link href="/"><ArrowLeft size={14} /> Összes város</Link><ChevronRight size={13} /><span>{cityName}</span></div>}</header>;
}

function PosterImage({ event, priority = false }: { event: RegionEvent; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [event.imageUrl]);
  if (!event.imageUrl || failed || /hellocsik-logo|photo-149268/.test(event.imageUrl)) return <div className="pg-image-fallback" style={{ backgroundColor: event.category?.color ?? "#7560e6" }}><CalendarDays size={38} strokeWidth={1.4} /><strong>{event.title}</strong></div>;
  return <img src={event.imageUrl} alt={event.title} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} onError={() => setFailed(true)} />;
}

function Spotlight({ events }: { events: RegionEvent[] }) {
  const [offset, setOffset] = useState(0);
  const pool = useMemo(() => [...events.filter(event => event.featured || event.promotionStatus === "paid"), ...events.filter(event => !event.featured && event.promotionStatus !== "paid")], [events]);
  const displayed = Array.from({ length: Math.min(3, pool.length) }, (_, index) => pool[(offset + index) % pool.length]);
  if (!displayed.length) return null;
  return <section className="pg-spotlight" aria-label="Programajánló"><div className="pg-spotlight-heading"><span><i /> MOST AJÁNLJUK</span><div><span className="pg-spotlight-count">{Math.min(offset + 1, pool.length)} / {pool.length}</span><button aria-label="Előző ajánlott programok" onClick={() => setOffset(value => (value - 1 + pool.length) % pool.length)}><ChevronLeft size={18} /></button><button aria-label="Következő ajánlott programok" onClick={() => setOffset(value => (value + 1) % pool.length)}><ChevronRight size={18} /></button></div></div>
    <div className="pg-spotlight-grid" data-count={displayed.length}>{displayed.map((event, index) => <article className={`pg-spotlight-card pg-spotlight-${index}`} key={event.id}><Link href={`/esemeny/${event.id}`} className="pg-spotlight-link"><PosterImage event={event} priority={index === 0} /><div className="pg-spotlight-shade" /><div className="pg-spotlight-top"><span>{event.promotionStatus === "paid" ? "Hirdetés" : event.category?.name ?? "Ajánló"}</span><div className="pg-date-sticker"><strong>{new Date(event.startDate).toLocaleDateString("hu-HU", { day: "numeric", timeZone: "Europe/Bucharest" })}</strong><small>{new Date(event.startDate).toLocaleDateString("hu-HU", { month: "short", timeZone: "Europe/Bucharest" })}</small></div></div><div className="pg-spotlight-caption"><p><MapPin size={13} />{cityForEvent(event)?.name ?? event.location}</p><h2>{event.title}</h2><span className="pg-spotlight-more">Megnézem <ArrowUpRight size={18} /></span></div></Link></article>)}</div>
  </section>;
}

function ProgramCard({ event, index }: { event: RegionEvent; index: number }) {
  const paid = event.promotionStatus === "paid" && event.promotionPlan !== "free";
  return <article className={`pg-card${paid ? " pg-card-promoted" : ""}`} style={{ "--card-accent": event.category?.color ?? "#7150e8", animationDelay: `${Math.min(index, 8) * 35}ms` } as CSSProperties}>
    <Link href={`/esemeny/${event.id}`} className="pg-card-link"><div className="pg-card-poster"><PosterImage event={event} /><span className="pg-card-category">{event.category?.name ?? "Program"}</span>{paid && <span className="pg-card-ad">Hirdetés</span>}</div><div className="pg-card-body"><div className="pg-card-time"><CalendarDays size={13} />{formatShortDate(event.startDate)}<span>•</span>{formatTime(event.startDate)}</div><h3>{event.title}</h3><p className="pg-card-location"><MapPin size={13} /><span>{cityForEvent(event)?.name ?? event.location}</span></p><div className="pg-card-bottom"><span>{priceLabel(event)}</span><span className="pg-card-arrow"><ArrowUpRight size={17} /></span></div></div></Link><FavoriteButton eventId={event.id} className="pg-favorite" />
  </article>;
}

function RegionPortal({ citySlug }: { citySlug?: string }) {
  const selectedCity = REGION_CITIES.find(city => city.slug === citySlug);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = selectedCity ? `${selectedCity.name} programjai – program.ro` : "program.ro – Székelyföld programjai";
    return () => { document.title = previousTitle; };
  }, [selectedCity]);
  const eventsQuery = useRegionEvents();
  const events = eventsQuery.data ?? [];
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(citySlug ?? "");
  const [category, setCategory] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [visible, setVisible] = useState(16);
  useEffect(() => { setCity(citySlug ?? ""); setQuery(""); setCategory(null); setDateFilter("all"); }, [citySlug]);
  useEffect(() => { setVisible(16); }, [city, query, category, dateFilter]);
  useEffect(() => {
    const applyHash = () => { if (window.location.hash === "#hetvege") setDateFilter("weekend"); };
    applyHash(); window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);
  const scopedEvents = useMemo(() => events.filter(event => !city || cityForEvent(event)?.slug === city), [events, city]);
  const categories = useMemo(() => Array.from(new Map(scopedEvents.flatMap(event => event.category ? [[event.category.id, event.category] as const] : [])).values()), [scopedEvents]);
  const filtered = useMemo(() => {
    const today = regionDay(new Date());
    const date = new Date(`${today}T12:00:00`);
    const friday = new Date(date);
    friday.setDate(date.getDate() + (date.getDay() === 0 ? -2 : date.getDay() === 6 ? -1 : (5 - date.getDay() + 7) % 7));
    const sunday = new Date(friday); sunday.setDate(friday.getDate() + 2);
    return scopedEvents.filter(event => {
      const start = regionDay(event.startDate), end = regionDay(event.endDate ?? event.startDate);
      return (!query.trim() || normalize(`${event.title} ${event.location} ${event.description}`).includes(normalize(query)))
        && (category === null || event.categoryId === category)
        && (dateFilter === "all" || (dateFilter === "today" ? start <= today && end >= today : start <= regionDay(sunday) && end >= regionDay(friday)));
    });
  }, [scopedEvents, query, category, dateFilter]);
  const reset = () => { setQuery(""); setCategory(null); setCity(citySlug ?? ""); setDateFilter("all"); };
  return <div className="pg-portal"><RegionHeader cityName={selectedCity?.name} /><main>
    <div className="pg-discover"><div className="pg-shell"><div className="pg-page-heading"><div><p>{selectedCity ? "VÁROSI PROGRAMOK" : "SZÉKELYFÖLD • ESEMÉNYAJÁNLÓ"}</p><h1>{selectedCity?.name ?? "Hova menjünk?"}<span className="pg-title-spark" aria-hidden="true">✳</span></h1></div><a href="#kozelgo" className="pg-all-link">{eventsQuery.isLoading ? "Programok betöltése" : `${scopedEvents.length} közelgő program`}<ArrowRight size={17} /></a></div>
    {eventsQuery.isLoading ? <div className="pg-spotlight-grid pg-spotlight-loading" aria-label="Ajánló betöltése">{[0, 1, 2].map(index => <div key={index} className="pg-skeleton" />)}</div> : <Spotlight events={scopedEvents} />}
    <div className="pg-finder" id="varosok"><label className="pg-search"><Search size={21} /><input type="search" placeholder="Koncert, előadás, kedvenc helyszín…" aria-label="Programok keresése" value={query} onChange={event => setQuery(event.target.value)} /></label><label className="pg-city-select"><MapPin size={20} /><select aria-label="Város szűrése" value={city} onChange={event => { setCity(event.target.value); setCategory(null); }}><option value="">Egész Székelyföld</option>{REGION_CITIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><ChevronDown size={15} /></label><a href="#kozelgo" className="pg-find-button">Mutasd a programokat <ArrowRight size={17} /></a></div></div></div>
    <section className="pg-programs pg-shell" id="kozelgo"><span id="hetvege" /><div className="pg-results-top"><h2>{city ? `${REGION_CITIES.find(item => item.slug === city)?.name} programjai` : "Az összes program"}<span>{filtered.length}</span></h2><div className="pg-date-tabs" aria-label="Időpont szűrése">{([{ id: "all", label: "Bármikor" }, { id: "today", label: "Ma" }, { id: "weekend", label: "Hétvégén" }] as const).map(tab => <button key={tab.id} aria-pressed={dateFilter === tab.id} onClick={() => setDateFilter(tab.id)}>{dateFilter === tab.id && <Check size={13} />}{tab.label}</button>)}<Link href="/naptar"><CalendarDays size={14} /> Naptár</Link></div></div>
    <div className="pg-category-tabs" aria-label="Kategóriák"><button className={category === null ? "pg-category-active" : ""} aria-pressed={category === null} onClick={() => setCategory(null)}><SlidersHorizontal size={15} /> Minden</button>{categories.map(item => <button key={item.id} className={category === item.id ? "pg-category-active" : ""} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}><i style={{ backgroundColor: item.color }} />{item.name}</button>)}</div>
    {eventsQuery.isLoading ? <div className="pg-program-grid" aria-label="Programok betöltése">{Array.from({ length: 8 }, (_, index) => <div className="pg-skeleton" key={index} />)}</div> : eventsQuery.isError ? <div className="pg-empty" role="alert"><CalendarDays /><h3>A programok nem töltődtek be.</h3><button onClick={() => eventsQuery.refetch()}>Újrapróbálom</button></div> : filtered.length ? <div className="pg-program-grid">{filtered.slice(0, visible).map((event, index) => <ProgramCard event={event} index={index} key={event.id} />)}</div> : <div className="pg-empty"><Search /><h3>Nincs találat ezekkel a szűrőkkel.</h3><p>Válassz másik napot, várost vagy kategóriát.</p><button onClick={reset}>Szűrők törlése</button></div>}
    {filtered.length > visible && <div className="pg-load-more"><button onClick={() => setVisible(value => value + 16)}>További {Math.min(16, filtered.length - visible)} program <ChevronDown size={17} /></button><p>{Math.min(visible, filtered.length)} / {filtered.length} program</p></div>}
    {city && <Link className="pg-city-page-link" href={`/varos/${city}`}>Külön városoldal megnyitása <ArrowUpRight size={16} /></Link>}
    </section>
    <section className="pg-cities-section pg-shell"><div><p className="pg-section-kicker">VÁROSRÓL VÁROSRA</p><h2>Hol legyen a következő program?</h2></div><div className="pg-cities-grid">{REGION_CITIES.map((item, index) => <Link href={`/varos/${item.slug}`} key={item.slug} style={{ "--city-color": ["#f0eaff", "#fff0dd", "#e8f5ed", "#ffe9ef"][index % 4] } as CSSProperties}><MapPin size={18} /><span>{item.name}</span><small>{events.filter(event => cityForEvent(event)?.slug === item.slug).length} program</small><ArrowUpRight size={17} /></Link>)}</div></section>
    <section className="pg-organizer-strip pg-shell"><div className="pg-organizer-icon"><Ticket size={34} /></div><div><p>SZERVEZŐKNEK</p><h2>A te eseményednek is itt a helye.</h2><span>Ingyenes eseménybeküldés, saját szervezői profil.</span></div><Link href="/bekuldese">Eseményt küldök <Plus size={18} /></Link></section>
    </main><footer className="pg-footer pg-shell"><Brand /><nav aria-label="Lábléc"><Link href="/szervezok">Szervezőknek</Link><Link href="/arak">Kiemelések és árak</Link><Link href="/klasszikus">HelloCsík – klasszikus</Link><Link href="/admin">Admin</Link></nav><span>© {new Date().getFullYear()} · Székelyföld programjai</span></footer></div>;
}

export function SzekelyfoldHome() { return <RegionPortal />; }
export function CityEventsPage({ slug }: { slug?: string }) {
  if (!REGION_CITIES.some(city => city.slug === slug)) return <div className="pg-portal"><RegionHeader /><div className="pg-empty"><h1>Ez a városoldal nem található.</h1><Link href="/">Összes város <ArrowRight size={17} /></Link></div></div>;
  return <RegionPortal citySlug={slug} />;
}
