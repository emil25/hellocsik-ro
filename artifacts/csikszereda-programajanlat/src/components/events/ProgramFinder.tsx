import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents, useListCategories } from "@workspace/api-client-react";
import { EventCard } from "./EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { eventCountyMatches, REGION_COUNTIES, REGION_DESCRIPTION, type RegionCounty } from "@/lib/region";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("hu").trim();

export function ProgramFinder({ showHero = true }: { showHero?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<number | null>(null);
  const [day, setDay] = useState("");
  const [weekend, setWeekend] = useState(false);
  const [county, setCounty] = useState<RegionCounty | null>(null);
  const [visible, setVisible] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    const applyWeekend = () => { if (window.location.hash === "#hetvege") { setWeekend(true); setDay(""); setShowFilters(true); } };
    applyWeekend();
    window.addEventListener("hashchange", applyWeekend);
    return () => window.removeEventListener("hashchange", applyWeekend);
  }, []);
  const eventsQuery = useListUpcomingEvents({ limit: 100 });
  const categoriesQuery = useListCategories();
  const events = eventsQuery.data?.events;
  const filtered = useMemo(() => {
    const today = new Date();
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7));
    if (today.getDay() === 0) saturday.setDate(today.getDate() - 1);
    saturday.setHours(0, 0, 0, 0);
    const monday = new Date(saturday);
    monday.setDate(saturday.getDate() + 2);
    const from = day ? new Date(`${day}T00:00:00`) : null;
    const until = from ? new Date(from) : null;
    until?.setDate(until.getDate() + 1);
    return (events ?? []).filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate ?? event.startDate);
      const regionText = `${event.title} ${event.location} ${event.locationAddress ?? ""} ${event.description}`;
      return (!category || event.categoryId === category)
        && (!county || eventCountyMatches(regionText, county))
        && (!query.trim() || normalize(`${event.title} ${event.location} ${event.description}`).includes(normalize(query)))
        && (!from || !until || (start < until && end >= from))
        && (!weekend || (start < monday && end >= saturday));
    }).sort((a, b) => Number(b.featured) - Number(a.featured) || Date.parse(a.startDate) - Date.parse(b.startDate));
  }, [events, query, category, county, day, weekend]);
  const reset = () => { setQuery(""); setCategory(null); setCounty(null); setDay(""); setWeekend(false); setVisible(12); };

  return <>
    {showHero && <section className="discovery-hero">
      <div className="discovery-copy">
        <p className="discovery-eyebrow"><MapPin size={16} /> SZÉKELYFÖLD · 3 MEGYE</p>
        <h1>Jó helyen vagy.<br /><span>Jó program vár.</span></h1>
        <p className="discovery-intro">{REGION_DESCRIPTION} Koncertek, fesztiválok, színház és közösségi élmények a közeledben.</p>
        <div className="flex flex-wrap gap-3 mt-8">
          <a className="discovery-primary" href="#kozelgo">Találj programot <ArrowRight size={18} /></a>
          <a className="discovery-secondary" href="#kozelgo" onClick={() => { reset(); setWeekend(true); }}>Ezen a hétvégén <CalendarDays size={18} /></a>
        </div>
        <p className="discovery-note">Helyi programok. Közös élmények. Egy régió.</p>
      </div>
      <div className="discovery-photo">
        <img src={`${import.meta.env.BASE_URL}reference/city-center.jpg`} alt="Székelyföldi városkép" fetchPriority="high" />
        <div className="discovery-photo-caption"><span>HÁROM MEGYE · EGY RITMUS</span><strong>Éld meg Székelyföldet.</strong><p>Programok · helyek · közös élmények</p><a className="block text-xs mt-3 text-white/80 underline" href="https://commons.wikimedia.org/wiki/File:RO_HR_Miercurea_Ciuc_center_1.jpg" target="_blank" rel="noreferrer">Fotó: Andrei Stroe · CC BY-SA 3.0 · Vágott kép</a></div>
      </div>
    </section>}
    <div id="hetvege" />
    <div id="picks" />
    <section id="kozelgo" className="program-finder">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div><p className="discovery-eyebrow">KÖZELGŐ PROGRAMOK</p><h2>Hamarosan Székelyföldön</h2></div>
        <div className="flex gap-4"><button className="flex items-center gap-2 text-sm text-primary" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}><Search size={16} /> Keresés és szűrés</button><Link href="/naptar" className="flex items-center gap-2 text-sm font-semibold text-primary">Naptár nézet <ArrowRight size={16} /></Link></div>
      </div>
      {showFilters && <div className="finder-controls">
        <label className="finder-search"><Search size={20} aria-hidden="true" /><Input aria-label="Program, helyszín vagy kulcsszó keresése" placeholder="Koncert, színház, kedvenc helyszín…" value={query} onChange={e => { setQuery(e.target.value); setVisible(12); }} /></label>
        <label className="finder-date"><CalendarDays size={19} aria-hidden="true" /><span className="sr-only">Program dátuma</span><Input type="date" aria-label="Program dátuma" value={day} onChange={e => { setDay(e.target.value); setWeekend(false); setVisible(12); }} /></label>
        <Button variant={weekend ? "default" : "outline"} aria-pressed={weekend} onClick={() => { setWeekend(!weekend); setDay(""); setVisible(12); }}>Hétvége</Button>
      </div>}
        <div className="flex flex-wrap gap-2 my-5" aria-label="Programkategóriák">
        <Button size="sm" variant={category === null ? "default" : "outline"} aria-pressed={category === null} onClick={() => { setCategory(null); setVisible(12); }}>Minden program</Button>
        {REGION_COUNTIES.map(item => <Button key={item} size="sm" variant={county === item ? "default" : "outline"} aria-pressed={county === item} onClick={() => { setCounty(county === item ? null : item); setVisible(12); }}>{item} megye</Button>)}
        {categoriesQuery.data?.categories.filter(item => events?.some(event => event.categoryId === item.id)).map(item => <Button key={item.id} size="sm" variant={category === item.id ? "default" : "outline"} aria-pressed={category === item.id} onClick={() => { setCategory(item.id); setVisible(12); }}><span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}<span className="opacity-60">{events?.filter(event => event.categoryId === item.id).length}</span></Button>)}
      </div>
      {eventsQuery.isLoading ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Programok betöltése">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}</div>
        : eventsQuery.isError ? <div className="finder-empty" role="alert"><CalendarDays /><h3>A programokat most nem sikerült betölteni.</h3><p>Próbáld újra egy kicsit később.</p><Button onClick={() => eventsQuery.refetch()}>Újrapróbálom</Button></div>
        : <><p className="text-sm text-muted-foreground mb-5" role="status">{filtered.length} program{events?.length === 100 ? " a következő 100 esemény között" : ""}</p>
          {filtered.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.slice(0, visible).map(event => <EventCard key={event.id} event={event} />)}</div>
            : <div className="finder-empty"><SlidersHorizontal /><h3>{query || category || day || weekend ? "Erre most nincs találat." : "Hamarosan új programok érkeznek."}</h3><p>{query || category || day || weekend ? "Próbálj másik dátumot vagy tágabb keresést." : "Szervezel valamit? Küldd be a programodat!"}</p>{query || category || day || weekend ? <Button variant="outline" onClick={reset}>Szűrők törlése</Button> : <Link href="/bekuldese" className="discovery-primary">Program beküldése <ArrowRight size={16} /></Link>}</div>}
          {filtered.length > visible && <div className="text-center mt-8"><Button variant="outline" onClick={() => setVisible(visible + 12)}>További programok</Button></div>}
        </>}
    </section>
  </>;
}
