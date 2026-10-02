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

const eventPlace = (event: RegionEvent) => cityForEvent(event)?.name ?? event.location;
const dateParts = (event: RegionEvent) => ({
  day: new Date(event.startDate).toLocaleDateString("hu-HU", { day: "numeric", timeZone: "Europe/Bucharest" }),
  month: new Date(event.startDate).toLocaleDateString("hu-HU", { month: "short", timeZone: "Europe/Bucharest" }),
});

function Brand() {
  return <Link href="/" className="pr-brand" aria-label="Program.ro – Székelyföld főoldal"><span className="pr-brand-mark"><Ticket size={27} strokeWidth={2.3} /></span><span>program<span className="pr-brand-dot">.ro</span><small>Székelyföld programjai</small></span></Link>;
}

function RegionHeader({ cityName }: { cityName?: string }) {
  const [open, setOpen] = useState(false);
  const { favoriteIds } = useFavorites();
  return <header className="pr-header"><div className="pr-header-inner"><Brand /><nav aria-label="Főmenü" className={open ? "pr-nav pr-nav-open" : "pr-nav"}>
    <a href="/#kozelgo" aria-current="page" onClick={() => setOpen(false)}>Programok</a><a href="/#varosok" onClick={() => setOpen(false)}>Városok</a><Link href="/naptar">Naptár</Link><Link href="/szervezok">Szervezőknek</Link>
  </nav><div className="pr-header-actions"><Link href="/erdekel" className="pr-saved" aria-label={favoriteIds.length ? "Mentett programok (" + favoriteIds.length + ")" : "Mentett programok"}><Heart size={21} />{favoriteIds.length > 0 && <b>{favoriteIds.length}</b>}</Link><Link href="/bekuldese" className="pr-submit" aria-label="Esemény beküldése"><Plus size={18} /><span>Esemény beküldése</span></Link><button className="pr-menu" aria-label={open ? "Menü bezárása" : "Menü megnyitása"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></div>{cityName && <div className="pr-breadcrumb pr-shell"><Link href="/"><ArrowLeft size={14} /> Összes város</Link><ChevronRight size={14} />{cityName}</div>}</header>;
}

function PosterImage({ event, priority = false }: { event: RegionEvent; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [event.imageUrl]);
  if (!event.imageUrl || failed || /hellocsik-logo|photo-149268/.test(event.imageUrl)) return <div className="pr-image-fallback" style={{ backgroundColor: event.category?.color ?? "#267365" }}><CalendarDays size={42} strokeWidth={1.4} /><strong>{event.title}</strong></div>;
  return <img src={event.imageUrl} alt={event.title} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} onError={() => setFailed(true)} />;
}

function Spotlight({ events }: { events: RegionEvent[] }) {
  const [offset, setOffset] = useState(0);
  const pool = useMemo(() => [...events.filter(event => event.featured || event.promotionStatus === "paid"), ...events.filter(event => !event.featured && event.promotionStatus !== "paid")], [events]);
  const displayed = Array.from({ length: Math.min(3, pool.length) }, (_, index) => pool[(offset + index) % pool.length]);
  if (!displayed.length) return null;
  const lead = displayed[0], date = dateParts(lead);
  return <section className="pr-showcase" aria-label="Kiemelt programajánló"><div className="pr-showcase-grid" data-count={displayed.length}>
    <article className="pr-feature" key={lead.id}><Link href={"/esemeny/" + lead.id} className="pr-feature-image"><PosterImage event={lead} priority /><span className="pr-feature-badge">{lead.promotionStatus === "paid" ? "Hirdetés" : "Ajánljuk"}</span><span className="pr-image-open"><ArrowUpRight size={24} /></span></Link><div className="pr-feature-copy"><div className="pr-feature-meta"><span className="pr-live-dot" />{eventPlace(lead)}<span>{lead.category?.name ?? "Program"}</span></div><div className="pr-feature-title"><div className="pr-feature-date"><strong>{date.day}</strong><span>{date.month}</span></div><h2><Link href={"/esemeny/" + lead.id}>{lead.title}</Link></h2></div><p className="pr-feature-place"><MapPin size={17} /><span>{lead.location}</span></p><p className="pr-feature-time"><CalendarDays size={17} />{formatTime(lead.startDate)}<span>·</span>{priceLabel(lead)}</p><Link href={"/esemeny/" + lead.id} className="pr-feature-button">Megnézem a programot <ArrowRight size={19} /></Link><div className="pr-carousel-controls"><span>{(offset % pool.length) + 1}<small> / {pool.length}</small></span><div><button aria-label="Előző ajánlott program" onClick={() => setOffset(value => (value - 1 + pool.length) % pool.length)}><ChevronLeft size={18} /></button><button aria-label="Következő ajánlott program" onClick={() => setOffset(value => (value + 1) % pool.length)}><ChevronRight size={18} /></button></div></div></div></article>
    {displayed.length > 1 && <div className="pr-feature-side"><span className="pr-side-heading">További ajánlók <span aria-hidden="true">↙</span></span>{displayed.slice(1).map(event => <article className="pr-side-card" key={event.id}><Link href={"/esemeny/" + event.id}><div className="pr-side-image"><PosterImage event={event} /></div><div className="pr-side-copy"><span>{formatShortDate(event.startDate)} <i /> {eventPlace(event)}</span><h3>{event.title}</h3><p>{event.category?.name ?? "Program"}<ArrowUpRight size={20} /></p></div></Link></article>)}</div>}
  </div></section>;
}

function ProgramCard({ event, index }: { event: RegionEvent; index: number }) {
  const date = dateParts(event), paid = event.promotionStatus === "paid" && event.promotionPlan !== "free";
  return <article className={"pr-event" + (paid ? " pr-event-promoted" : "")} style={{ "--event-accent": event.category?.color ?? "#16816c", animationDelay: Math.min(index, 6) * 40 + "ms" } as CSSProperties}>
    <Link href={"/esemeny/" + event.id} className="pr-event-link"><div className="pr-event-image"><PosterImage event={event} /><div className="pr-event-date"><strong>{date.day}</strong><span>{date.month}</span></div>{paid && <span className="pr-event-ad">Hirdetés</span>}</div><div className="pr-event-copy"><div className="pr-event-category"><i />{event.category?.name ?? "Program"}<span>{formatTime(event.startDate)}</span></div><h3>{event.title}</h3><p><MapPin size={15} /><span>{eventPlace(event)}</span></p><div className="pr-event-bottom"><span>{priceLabel(event)}</span><ArrowUpRight size={19} /></div></div></Link><FavoriteButton eventId={event.id} className="pr-favorite" />
  </article>;
}

function RegionPortal({ citySlug }: { citySlug?: string }) {
  const selectedCity = REGION_CITIES.find(city => city.slug === citySlug);
  const eventsQuery = useRegionEvents(), events = eventsQuery.data ?? [];
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(citySlug ?? "");
  const [category, setCategory] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [visible, setVisible] = useState(15);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = selectedCity ? selectedCity.name + " programjai – program.ro" : "program.ro – Székelyföld programjai";
    return () => { document.title = previousTitle; };
  }, [selectedCity]);
  useEffect(() => { setCity(citySlug ?? ""); setQuery(""); setCategory(null); setDateFilter("all"); }, [citySlug]);
  useEffect(() => { setVisible(15); }, [city, query, category, dateFilter]);
  useEffect(() => {
    const applyHash = () => { if (window.location.hash === "#hetvege") setDateFilter("weekend"); };
    applyHash(); window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);
  useEffect(() => {
    if (eventsQuery.isLoading) return;
    const scrollToSection = () => {
      const id = window.location.hash.slice(1);
      if (id) document.getElementById(id === "hetvege" ? "kozelgo" : id)?.scrollIntoView({ block: "start" });
      else window.scrollTo(0, 0);
    };
    scrollToSection(); window.addEventListener("hashchange", scrollToSection);
    return () => window.removeEventListener("hashchange", scrollToSection);
  }, [citySlug, eventsQuery.isLoading]);
  const cityCounts = useMemo(() => new Map(REGION_CITIES.map(item => [item.slug, events.filter(event => cityForEvent(event)?.slug === item.slug).length])), [events]);
  const scopedEvents = useMemo(() => events.filter(event => !city || cityForEvent(event)?.slug === city), [events, city]);
  const categories = useMemo(() => Array.from(new Map(scopedEvents.flatMap(event => event.category ? [[event.category.id, event.category] as const] : [])).values()), [scopedEvents]);
  const filtered = useMemo(() => {
    const today = regionDay(new Date()), date = new Date(today + "T12:00:00"), friday = new Date(date);
    friday.setDate(date.getDate() + (date.getDay() === 0 ? -2 : date.getDay() === 6 ? -1 : (5 - date.getDay() + 7) % 7));
    const sunday = new Date(friday); sunday.setDate(friday.getDate() + 2);
    return scopedEvents.filter(event => {
      const start = regionDay(event.startDate), end = regionDay(event.endDate ?? event.startDate);
      return (!query.trim() || normalize(event.title + " " + event.location + " " + event.description).includes(normalize(query.trim())))
        && (category === null || event.categoryId === category)
        && (dateFilter === "all" || (dateFilter === "today" ? start <= today && end >= today : start <= regionDay(sunday) && end >= regionDay(friday)));
    });
  }, [scopedEvents, query, category, dateFilter]);
  const reset = () => { setQuery(""); setCategory(null); setCity(citySlug ?? ""); setDateFilter("all"); };
  const selectCity = (slug: string) => { setCity(slug); setCategory(null); };
  const filterCount = Number(Boolean(query.trim())) + Number(Boolean(city)) + Number(category !== null);
  return <div className={"pr-portal" + (selectedCity ? " pr-city-portal" : "")}><RegionHeader cityName={selectedCity?.name} /><main>
    <section className="pr-opening"><div className="pr-shell"><div className="pr-opening-title"><div><span className="pr-eyebrow">{selectedCity ? "VÁROSI ESEMÉNYAJÁNLÓ" : "SZÉKELYFÖLD ESEMÉNYEI"}</span><h1>{selectedCity?.name ?? "Programajánló"}<span className="pr-title-dot" /></h1></div><a href="#kozelgo">{eventsQuery.isLoading ? "Betöltés…" : scopedEvents.length + " közelgő program"}<ArrowRight size={19} /></a></div>
    {eventsQuery.isLoading ? <div className="pr-showcase-skeleton" aria-label="Ajánló betöltése"><div className="pr-skeleton" /><div className="pr-skeleton" /></div> : <Spotlight events={scopedEvents} />}
    </div></section>
    <section className="pr-citybar pr-shell" id="varosok" aria-label="Városok"><div className="pr-citybar-label"><MapPin size={21} /><span>Hol keresel<br /><strong>programot?</strong></span></div><div className="pr-citybar-scroll"><button aria-pressed={!city} onClick={() => selectCity("")}>Minden város<span>{events.length}</span></button>{REGION_CITIES.map(item => <button key={item.slug} aria-pressed={city === item.slug} onClick={() => selectCity(item.slug)}>{item.name}<span>{cityCounts.get(item.slug)}</span></button>)}</div></section>
    <section className="pr-listing pr-shell" id="kozelgo"><span id="hetvege" /><div className="pr-listing-heading"><div><span className="pr-eyebrow">ESEMÉNYNAPTÁR</span><h2>{city ? REGION_CITIES.find(item => item.slug === city)?.name + " programjai" : "Közelgő programok"}<span>{filtered.length}</span></h2></div><div className="pr-dates" aria-label="Időpont szűrése">{([{ id: "all", label: "Összes" }, { id: "today", label: "Ma" }, { id: "weekend", label: "Hétvégén" }] as const).map(tab => <button key={tab.id} aria-pressed={dateFilter === tab.id} onClick={() => setDateFilter(tab.id)}>{tab.label}</button>)}<Link href="/naptar" aria-label="Havi naptár megnyitása"><CalendarDays size={20} /></Link></div></div>
    <div className="pr-listing-layout"><aside className={"pr-filters" + (filtersOpen ? " pr-filters-open" : "")} aria-label="Programok szűrése"><button className="pr-filter-toggle" aria-expanded={filtersOpen} aria-controls="program-filter-fields" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={18} /> Szűrés és keresés{filterCount > 0 && <span>{filterCount}</span>}<ChevronDown size={17} /></button><div className="pr-filter-fields" id="program-filter-fields"><div className="pr-filter-heading"><SlidersHorizontal size={18} /><h3>Keresés és szűrés</h3></div><label className="pr-filter-label" htmlFor="program-search">Keresés</label><div className="pr-search"><Search size={17} /><input id="program-search" type="search" placeholder="Cím, előadó, helyszín…" aria-label="Programok keresése" value={query} onChange={event => setQuery(event.target.value)} /></div><label className="pr-filter-label" htmlFor="program-city">Város</label><div className="pr-select"><select id="program-city" aria-label="Város szűrése" value={city} onChange={event => selectCity(event.target.value)}><option value="">Egész Székelyföld</option>{REGION_CITIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><ChevronDown size={15} /></div><h4 className="pr-filter-label">Programtípus</h4><div className="pr-categories"><button aria-pressed={category === null} onClick={() => setCategory(null)}><span className="pr-filter-check">{category === null && <Check size={12} />}</span> Minden program <small>{scopedEvents.length}</small></button>{categories.map(item => <button key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}><span className="pr-filter-check">{category === item.id && <Check size={12} />}</span><i style={{ background: item.color }} />{item.name}<small>{scopedEvents.filter(event => event.categoryId === item.id).length}</small></button>)}</div>{filterCount > 0 && <button className="pr-filter-reset" onClick={reset}><X size={14} /> Szűrők törlése</button>}{city && city !== citySlug && <Link className="pr-city-link" href={"/varos/" + city}>Városoldal megnyitása<ArrowUpRight size={16} /></Link>}<div className="pr-filter-organizer"><Ticket size={22} /><p>Saját eseményt szervezel?</p><Link href="/bekuldese">Küldd be ingyen <ArrowRight size={15} /></Link></div></div></aside>
    <div className="pr-listing-results">{query.trim() && <p className="pr-query-result">Találatok erre: <strong>„{query.trim()}”</strong></p>}{eventsQuery.isLoading ? <div className="pr-event-grid" aria-label="Programok betöltése">{Array.from({ length: 6 }, (_, index) => <div className="pr-skeleton" key={index} />)}</div> : eventsQuery.isError ? <div className="pr-empty" role="alert"><CalendarDays /><h3>A programok nem töltődtek be.</h3><button onClick={() => eventsQuery.refetch()}>Újrapróbálom</button></div> : filtered.length ? <div className="pr-event-grid">{filtered.slice(0, visible).map((event, index) => <ProgramCard event={event} index={index} key={event.id} />)}</div> : <div className="pr-empty"><Search /><h3>Nincs találat ezekkel a szűrőkkel.</h3><p>Válassz másik napot, várost vagy kategóriát.</p><button onClick={reset}>Összes program</button></div>}{filtered.length > visible && <div className="pr-more"><button onClick={() => setVisible(value => value + 15)}>További {Math.min(15, filtered.length - visible)} program <Plus size={18} /></button><span>{Math.min(visible, filtered.length)} / {filtered.length} program</span></div>}</div></div></section>
    <section className="pr-organizer pr-shell"><div className="pr-organizer-art" aria-hidden="true"><Ticket /><span>+</span></div><div><span className="pr-eyebrow">SZERVEZŐKNEK</span><h2>Szervezői profil és eseménybeküldés</h2><p>Ingyenes beküldés, szervezői bemutatkozás és kiemelési lehetőségek.</p></div><Link href="/szervezok">Szervezői felület <ArrowUpRight size={20} /></Link></section>
    </main><footer className="pr-footer pr-shell"><Brand /><nav aria-label="Lábléc"><Link href="/szervezok">Szervezőknek</Link><Link href="/arak">Kiemelések és árak</Link><Link href="/klasszikus">HelloCsík – klasszikus</Link><Link href="/admin">Admin</Link></nav><span>© {new Date().getFullYear()} · Székelyföld programjai</span></footer></div>;
}

export function SzekelyfoldHome() { return <RegionPortal />; }
export function CityEventsPage({ slug }: { slug?: string }) {
  if (!REGION_CITIES.some(city => city.slug === slug)) return <div className="pr-portal"><RegionHeader /><div className="pr-empty"><h1>Ez a városoldal nem található.</h1><Link href="/">Összes város <ArrowRight size={17} /></Link></div></div>;
  return <RegionPortal citySlug={slug} />;
}
