import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3, Heart, MapPin, Menu, Music2, Plus, Search, Sparkles, Theater, Ticket, Users, X, Activity } from "lucide-react";
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
  return match(event.location + " " + (event.locationAddress ?? "")) ?? match(event.title) ?? match(getVenueInfo(event.location).address ?? "");
}
function useRegionEvents() {
  return useQuery({
    queryKey: ["region-all-upcoming"],
    queryFn: async ({ signal }) => {
      const events: RegionEvent[] = [];
      for (let offset = 0; ; offset += 100) {
        const response = await fetch("/api/events?limit=100&offset=" + offset, { signal });
        if (!response.ok) throw new Error("A programok nem tölthetők be.");
        const page = await response.json() as { events: RegionEvent[] };
        events.push(...page.events);
        if (page.events.length < 100) break;
      }
      return Array.from(new Map(events.map(event => [event.id, event])).values())
        .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
    },
  });
}
function priceLabel(event: RegionEvent) {
  return event.price?.trim() || (getEventLinks(event).ticketUrl ? "Jegyvásárlás" : "Belépő: részletekben");
}
const eventPlace = (event: RegionEvent) => cityForEvent(event)?.name ?? event.location;
const dateParts = (event: RegionEvent) => ({
  day: new Date(event.startDate).toLocaleDateString("hu-HU", { day: "numeric", timeZone: "Europe/Bucharest" }),
  month: new Date(event.startDate).toLocaleDateString("hu-HU", { month: "short", timeZone: "Europe/Bucharest" }),
});
function categoryLook(name?: string) {
  const normalized = normalize(name ?? "");
  if (/koncert|zene|fesztival/.test(normalized)) return { color: "#7455d9", background: "#eee7ff", Icon: Music2 };
  if (/szinhaz|tanc/.test(normalized)) return { color: "#cc5846", background: "#ffebe4", Icon: Theater };
  if (/sport/.test(normalized)) return { color: "#218776", background: "#dcf4ed", Icon: Activity };
  if (/kozosseg/.test(normalized)) return { color: "#94721c", background: "#fff3d0", Icon: Users };
  return { color: "#675b91", background: "#edeaf4", Icon: CalendarDays };
}
function Brand() {
  return <Link href="/" className="sf-brand" aria-label="Program.ro – Székelyföld főoldal">
    <span className="sf-brand-symbol" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M20 3C11 3 5 10 5 18c0 10 15 19 15 19s15-9 15-19C35 10 29 3 20 3Z" fill="currentColor" /><path d="m17 12 10 6-10 6V12Z" fill="white" /></svg></span>
    <span>program<span className="sf-brand-dot">.ro</span><small>Székelyföld</small></span>
  </Link>;
}
function RegionHeader() {
  const [open, setOpen] = useState(false);
  const { favoriteIds } = useFavorites();
  return <header className="sf-header"><div className="sf-header-inner">
    <Brand />
    <nav className={"sf-nav" + (open ? " sf-nav-open" : "")} aria-label="Főmenü">
      <a href="/#kozelgo" aria-current="page" onClick={() => setOpen(false)}>Programok</a>
      <a href="/#hetvege" onClick={() => setOpen(false)}>Hétvége</a>
      <a href="/#varosok" onClick={() => setOpen(false)}>Városok</a>
      <Link href="/naptar">Naptár</Link>
      <Link href="/szervezok">Szervezőknek</Link>
    </nav>
    <div className="sf-header-actions">
      <Link href="/erdekel" className="sf-saved" aria-label={"Mentett programok" + (favoriteIds.length ? " (" + favoriteIds.length + ")" : "")}><Heart size={20} />{favoriteIds.length > 0 && <b>{favoriteIds.length}</b>}</Link>
      <Link href="/bekuldese" className="sf-submit"><Plus size={17} /><span>Esemény beküldése</span></Link>
      <button className="sf-menu" aria-expanded={open} aria-label={open ? "Menü bezárása" : "Menü megnyitása"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
  </div></header>;
}
function PosterImage({ event, priority = false }: { event: RegionEvent; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [event.imageUrl]);
  if (!event.imageUrl || failed || /hellocsik-logo|photo-149268/.test(event.imageUrl)) {
    return <div className="sf-image-fallback" style={{ background: categoryLook(event.category?.name).color }}><CalendarDays size={42} /><strong>{event.title}</strong></div>;
  }
  return <img src={event.imageUrl} alt={event.title} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} onError={() => setFailed(true)} />;
}
function Spotlight({ events }: { events: RegionEvent[] }) {
  const [offset, setOffset] = useState(0);
  const pool = useMemo(() => {
    const promoted = events.filter(event => event.featured || event.promotionStatus === "paid");
    const other = events.filter(event => !event.featured && event.promotionStatus !== "paid");
    // Give the opening a mix of programme types, then retain every event in the carousel.
    const first = promoted[0] ?? other[0];
    const second = other.find(event => event.id !== first?.id && event.category?.slug === "sport");
    const third = other.find(event => event.id !== first?.id && event.id !== second?.id && event.category?.slug === "kozosseg");
    const opening = [first, second, third].filter((event): event is RegionEvent => Boolean(event));
    return [...opening, ...[...promoted, ...other].filter(event => !opening.some(item => item.id === event.id))];
  }, [events]);
  useEffect(() => setOffset(0), [events]);
  if (!pool.length) return null;
  const displayed = Array.from({ length: Math.min(3, pool.length) }, (_, index) => pool[(offset + index) % pool.length]);
  return <div className="sf-spotlight">
    <div className="sf-stage" data-count={displayed.length}>
      {displayed.map((event, index) => {
        const date = dateParts(event);
        return <article className={"sf-story sf-story-" + index} key={event.id}>
          <Link href={"/esemeny/" + event.id} className="sf-story-link">
            <PosterImage event={event} priority={index === 0} />
            <span className="sf-story-shade" />
            <div className="sf-story-top"><span className="sf-story-label">{event.promotionStatus === "paid" ? "Hirdetés" : event.featured ? "Kiemelt program" : event.category?.name ?? "Ajánló"}</span><span className="sf-story-date"><strong>{date.day}</strong><span>{date.month}</span></span></div>
            <div className="sf-story-copy"><span className="sf-story-city"><MapPin size={14} />{eventPlace(event)}</span><h2>{event.title}</h2><div className="sf-story-bottom"><span><Clock3 size={14} />{formatTime(event.startDate)}</span><span className="sf-story-arrow"><ArrowUpRight size={21} /></span></div></div>
          </Link>
          <FavoriteButton eventId={event.id} className="sf-story-favorite" />
        </article>;
      })}
    </div>
    <div className="sf-stage-controls"><span><i />Aktuális ajánlók</span>{pool.length > 3 && <div><span>{offset + 1}<small> / {pool.length}</small></span><button aria-label="Előző ajánlott programok" onClick={() => setOffset(value => (value - 1 + pool.length) % pool.length)}><ChevronLeft size={19} /></button><button aria-label="Következő ajánlott programok" onClick={() => setOffset(value => (value + 1) % pool.length)}><ChevronRight size={19} /></button></div>}</div>
  </div>;
}
function ProgramCard({ event, index }: { event: RegionEvent; index: number }) {
  const date = dateParts(event), look = categoryLook(event.category?.name);
  const paid = event.promotionStatus === "paid" && event.promotionPlan !== "free";
  return <article className="sf-event" style={{ "--event-accent": look.color, "--event-tint": look.background, animationDelay: Math.min(index, 8) * 35 + "ms" } as CSSProperties}>
    <Link href={"/esemeny/" + event.id} className="sf-event-link">
      <div className="sf-event-poster"><PosterImage event={event} /><span className="sf-event-category"><look.Icon size={12} />{event.category?.name ?? "Program"}</span>{paid && <span className="sf-event-ad">Hirdetés</span>}</div>
      <div className="sf-event-info"><div className="sf-event-date"><strong>{date.day}</strong><span>{date.month}</span></div><div className="sf-event-text"><p>{eventPlace(event)}</p><h3>{event.title}</h3><span><Clock3 size={12} />{formatTime(event.startDate)}</span></div></div>
      <div className="sf-event-bottom"><span>{priceLabel(event)}</span><ArrowUpRight size={18} /></div>
    </Link>
    <FavoriteButton eventId={event.id} className="sf-event-favorite" />
  </article>;
}
function RegionPortal({ citySlug }: { citySlug?: string }) {
  const selectedCity = REGION_CITIES.find(city => city.slug === citySlug);
  const eventsQuery = useRegionEvents(), events = eventsQuery.data ?? [];
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(citySlug ?? "");
  const [category, setCategory] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [visible, setVisible] = useState(16);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = selectedCity ? selectedCity.name + " programjai – program.ro" : "program.ro – Székelyföld programjai";
    return () => { document.title = previousTitle; };
  }, [selectedCity]);
  useEffect(() => { setCity(citySlug ?? ""); setQuery(""); setCategory(null); setDateFilter("all"); }, [citySlug]);
  useEffect(() => { setVisible(16); }, [city, query, category, dateFilter]);
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
      return (!query.trim() || normalize(event.title + " " + event.location + " " + (event.description ?? "")).includes(normalize(query.trim())))
        && (category === null || event.categoryId === category)
        && (dateFilter === "all" || (dateFilter === "today" ? start <= today && end >= today : start <= regionDay(sunday) && end >= regionDay(friday)));
    });
  }, [scopedEvents, query, category, dateFilter]);
  const reset = () => { setQuery(""); setCategory(null); setCity(citySlug ?? ""); setDateFilter("all"); };
  const selectCity = (slug: string) => { setCity(slug); setCategory(null); };
  const search = (event: FormEvent) => { event.preventDefault(); document.getElementById("kozelgo")?.scrollIntoView({ block: "start", behavior: "smooth" }); };
  const activeFilters = Boolean(query.trim() || city || category !== null || dateFilter !== "all");
  const currentCity = REGION_CITIES.find(item => item.slug === city);
  return <div className={"sf-portal" + (selectedCity ? " sf-city-portal" : "")}><RegionHeader /><main>
    <section className="sf-opening"><div className="sf-shell">
      {selectedCity && <Link className="sf-back" href="/"><ArrowLeft size={15} />Székelyföld összes programja</Link>}
      <div className="sf-opening-heading"><div><span className="sf-eyebrow"><span />ESEMÉNYAJÁNLÓ</span><h1>{selectedCity ? selectedCity.name : "Székelyföld"}<span> programjai<span className="sf-title-period">.</span></span></h1></div><a className="sf-weekend-link" href="#hetvege"><CalendarDays size={19} /><span>Ezen a hétvégén</span><ArrowUpRight size={19} /></a></div>
      {eventsQuery.isLoading ? <div className="sf-stage sf-stage-loading" aria-label="Ajánló betöltése">{Array.from({ length: 3 }, (_, index) => <div className="sf-skeleton" key={index} />)}</div> : <Spotlight events={scopedEvents} />}
      <form className="sf-searchbar" onSubmit={search}>
        <label className="sf-search-field"><Search size={22} /><span><span>Mit keresel?</span><input type="search" aria-label="Programok keresése" placeholder="Esemény, előadó, helyszín…" value={query} onChange={event => setQuery(event.target.value)} /></span></label>
        <label className="sf-search-choice"><MapPin size={21} /><span><span>Hol?</span><select aria-label="Város szűrése" value={city} onChange={event => selectCity(event.target.value)}><option value="">Egész Székelyföld</option>{REGION_CITIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></span><ChevronDown size={15} /></label>
        <label className="sf-search-choice sf-search-when"><CalendarDays size={21} /><span><span>Mikor?</span><select aria-label="Időpont szűrése" value={dateFilter} onChange={event => setDateFilter(event.target.value as DateFilter)}><option value="all">Bármikor</option><option value="today">Ma</option><option value="weekend">Ezen a hétvégén</option></select></span><ChevronDown size={15} /></label>
        <button type="submit">Keresés<ArrowRight size={19} /></button>
      </form>
    </div></section>
    <section className="sf-programs sf-shell" id="kozelgo" aria-labelledby="sf-programs-title">
      <div className="sf-section-heading"><div><span className="sf-eyebrow">PROGRAMOK</span><h2 id="sf-programs-title">{currentCity ? currentCity.name : dateFilter === "weekend" ? "Ezen a hétvégén" : dateFilter === "today" ? "Mai programok" : "Mi érdekel?"}<span>{filtered.length}</span></h2></div><Link href="/naptar" className="sf-calendar-link"><CalendarDays size={18} />Naptár nézet<ArrowUpRight size={17} /></Link></div>
      <div className="sf-category-row" aria-label="Programtípus szűrése">
        <button aria-pressed={category === null} onClick={() => setCategory(null)}><Sparkles size={17} />Minden program</button>
        {categories.map(item => { const look = categoryLook(item.name); return <button key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)} style={{ "--category-color": look.color, "--category-bg": look.background } as CSSProperties}><look.Icon size={17} />{item.name}<span>{scopedEvents.filter(event => event.categoryId === item.id).length}</span></button>; })}
      </div>
      <div className="sf-result-line" aria-live="polite"><p>{eventsQuery.isLoading ? "Programok betöltése…" : filtered.length + " közelgő esemény"}{query.trim() && <> · <strong>„{query.trim()}”</strong></>}</p>{activeFilters && <button onClick={reset}><X size={14} />Szűrők törlése</button>}</div>
      {eventsQuery.isLoading ? <div className="sf-event-grid">{Array.from({ length: 8 }, (_, index) => <div className="sf-skeleton" key={index} />)}</div>
        : eventsQuery.isError ? <div className="sf-empty" role="alert"><CalendarDays /><h3>A programok nem töltődtek be.</h3><button onClick={() => eventsQuery.refetch()}>Újrapróbálom</button></div>
        : filtered.length ? <div className="sf-event-grid">{filtered.slice(0, visible).map((event, index) => <ProgramCard key={event.id} event={event} index={index} />)}</div>
        : <div className="sf-empty"><Search /><h3>Nincs találat ezekkel a szűrőkkel.</h3><p>Válassz másik várost, időpontot vagy programtípust.</p><button onClick={reset}>Összes program</button></div>}
      {filtered.length > visible && <div className="sf-more"><button onClick={() => setVisible(value => value + 16)}>További programok<Plus size={19} /></button><span>{visible} / {filtered.length} esemény</span></div>}
    </section>
    <section className="sf-city-section" id="varosok"><div className="sf-shell"><div className="sf-section-heading"><div><span className="sf-eyebrow">VÁROSOK</span><h2>Programok a közeledben<span className="sf-city-dot" /></h2></div><p>Válassz várost, és nézd meg a helyi eseményeket.</p></div><div className="sf-city-grid">{REGION_CITIES.map((item, index) => <Link href={"/varos/" + item.slug} key={item.slug} className={"sf-city sf-city-tone-" + index % 4}><span className="sf-city-icon"><MapPin size={24} /></span><span><strong>{item.name}</strong><small>{cityCounts.get(item.slug) ?? 0} közelgő program</small></span><ArrowUpRight size={22} /></Link>)}</div></div></section>
    <section className="sf-organizer sf-shell"><span className="sf-organizer-icon"><Ticket size={32} /></span><div><h2>Szervezői profil és eseménybeküldés</h2><p>Ingyenes eseménybeküldés és saját szervezői profil.</p></div><Link href="/szervezok">Szervezőknek<ArrowUpRight size={20} /></Link></section>
  </main><footer className="sf-footer sf-shell"><Brand /><nav aria-label="Lábléc"><Link href="/szervezok">Szervezőknek</Link><Link href="/arak">Kiemelések és árak</Link><Link href="/klasszikus">HelloCsík – klasszikus</Link><Link href="/admin">Admin</Link></nav><span>© {new Date().getFullYear()} · Székelyföld programjai</span></footer></div>;
}
export function SzekelyfoldHome() { return <RegionPortal />; }
export function CityEventsPage({ slug }: { slug?: string }) {
  if (!REGION_CITIES.some(city => city.slug === slug)) return <div className="sf-portal"><RegionHeader /><div className="sf-empty"><h1>Ez a városoldal nem található.</h1><Link href="/">Összes város<ArrowRight size={17} /></Link></div></div>;
  return <RegionPortal citySlug={slug} />;
}
