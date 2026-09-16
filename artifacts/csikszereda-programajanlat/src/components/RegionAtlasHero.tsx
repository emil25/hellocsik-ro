import { ArrowRight, CalendarDays, MapPin, Search } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import type { ReactNode } from "react";
import "./region-atlas-home.css";

const CITIES = [
  { name: "Csíkszereda", keys: ["csíkszereda", "miercurea ciuc"] },
  { name: "Székelyudvarhely", keys: ["székelyudvarhely", "odorheiu secuiesc"] },
  { name: "Gyergyószentmiklós", keys: ["gyergyószentmiklós", "gheorgheni"] },
  { name: "Sepsiszentgyörgy", keys: ["sepsiszentgyörgy", "sfântu gheorghe", "sfantu gheorghe"] },
  { name: "Kézdivásárhely", keys: ["kézdivásárhely", "târgu secuiesc", "targu secuiesc"] },
  { name: "Marosvásárhely", keys: ["marosvásárhely", "târgu mureș", "targu mures"] },
  { name: "Szováta", keys: ["szováta", "sovata"] },
];

function normalized(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("hu-HU"); }

export function RegionAtlasHero({ viewSwitch }: { viewSwitch: ReactNode }) {
  const { data, isLoading, isError, refetch } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events.find(event => event.featured) ?? events[0];
  const next = events.filter(event => event.id !== lead?.id).slice(0, 3);
  const cityCount = (city: typeof CITIES[number]) => events.filter(event => city.keys.some(key => normalized(`${event.title} ${event.location} ${event.locationAddress ?? ""}`).includes(normalized(key)))).length;
  const heroImage = `${import.meta.env.BASE_URL}reference/city-center.jpg`;

  return <section className="region-atlas" aria-label="Székelyföldi események"><div className="region-atlas-shell">
    <header className="atlas-topbar"><div className="atlas-brand"><span className="atlas-brand-dot" /><strong>HELLOCSÍK</strong><b>PROGRAMOK</b></div><div className="atlas-top-actions"><span className="atlas-date">2026. SZEPTEMBER 16. · SZÉKELYFÖLD</span>{viewSwitch}</div></header>
    <div className="atlas-hero-grid">
      <div className="atlas-hero-copy"><span className="atlas-poster-kicker"><Search size={14} /> MAI PROGRAMOK</span><h1>Mi történik<br /><em>ma?</em></h1><p>Koncertek, előadások, kiállítások és közösségi programok városról városra.</p><div className="atlas-actions"><a href="#kozelgo" className="atlas-primary">Programok megnyitása <ArrowRight size={17} /></a><Link href="/naptar" className="atlas-secondary"><CalendarDays size={17} /> Naptár</Link></div><div className="atlas-quick-stats"><div><strong>{events.length || "—"}</strong><span>közelgő<br />program</span></div><div><strong>{CITIES.filter(city => cityCount(city) > 0).length || "—"}</strong><span>aktív<br />város</span></div></div></div>
      <div className="atlas-hero-visual"><div className="atlas-hero-photo" style={{ backgroundImage: `url("${heroImage}")` }}><div className="atlas-photo-shade" /><span className="atlas-photo-label">SZÉKELYFÖLD · PROGRAMNAPTÁR</span><span className="atlas-photo-number">01</span></div><div className="atlas-feature-card">{lead ? <Link href={`/esemeny/${lead.id}`} className="atlas-feature-link"><div className="atlas-feature-top"><span>KIEMELT PROGRAM</span><b>{formatShortDate(lead.startDate)}</b></div><h2>{lead.title}</h2><p><MapPin size={14} /> {lead.location || "Székelyföld"}<span className="atlas-feature-time">{formatTime(lead.startDate)}</span></p><ArrowRight className="atlas-feature-arrow" size={22} /></Link> : <div className="atlas-feature-empty"><span>PROGRAMOK</span><h2>{isLoading ? "Események betöltése…" : "Nincs közelgő esemény."}</h2>{isError && <button onClick={() => refetch()}>Újrapróbálom</button>}</div>}</div></div>
    </div>
    <div className="atlas-city-bar"><span className="atlas-city-bar-title">VÁROSOK</span><div className="atlas-city-bar-list">{CITIES.map(city => <span key={city.name}><b>{cityCount(city)}</b> {city.name}</span>)}</div></div>
    <div className="atlas-next"><div className="atlas-next-title"><span>KÖVETKEZIK</span><h2>A következő programok</h2><p>Időpont és helyszín egy helyen.</p></div><div className="atlas-next-list">{next.map((event, index) => <Link href={`/esemeny/${event.id}`} className="atlas-next-card" key={event.id}><span className="atlas-next-index">0{index + 1}</span><div><small>{formatShortDate(event.startDate)} · {formatTime(event.startDate)}</small><h3>{event.title}</h3><p><MapPin size={12} /> {event.location}</p></div><ArrowRight size={17} /></Link>)}</div></div>
  </div></section>;
}
