import { ArrowUpRight, CalendarDays, ChevronRight, MapPin, Search } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { useEffect } from "react";
import "./programok-portal.css";

const CITY_NAMES = ["Csíkszereda", "Székelyudvarhely", "Gyergyószentmiklós", "Sepsiszentgyörgy", "Kézdivásárhely", "Marosvásárhely"];

function cityLabel(value: string) {
  const text = value.toLocaleLowerCase("hu-HU");
  if (text.includes("gheorgheni") || text.includes("gyergyó")) return "Gyergyószentmiklós";
  if (text.includes("odorheiu") || text.includes("udvarhely")) return "Székelyudvarhely";
  if (text.includes("miercurea") || text.includes("csík")) return "Csíkszereda";
  if (text.includes("sfântu") || text.includes("sepsi")) return "Sepsiszentgyörgy";
  if (text.includes("târgu secuiesc") || text.includes("kézdi")) return "Kézdivásárhely";
  if (text.includes("mureș") || text.includes("maros")) return "Marosvásárhely";
  return "Székelyföld";
}

export function ProgramokPortal() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "programok.ro – Székelyföld programjai";
    return () => { document.title = previousTitle; };
  }, []);
  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events.find(event => event.featured && event.imageUrl) ?? events.find(event => event.imageUrl) ?? events[0];
  const list = events.filter(event => event.id !== lead?.id).slice(0, 6);
  const heroImage = lead?.imageUrl || `${import.meta.env.BASE_URL}reference/city-center.jpg`;

  return (
    <div className="programok-page">
      <header className="programok-nav">
        <Link href="/programok" className="programok-logo" aria-label="programok.ro főoldal"><span className="programok-logo-mark">p</span><span>programok<span>.ro</span></span></Link>
        <nav className="programok-links" aria-label="Programok navigáció"><a href="#kiemelt">Kiemelt</a><a href="#programok">Programok</a><a href="#varosok">Városok</a><a href="#helyszinek">Helyszínek</a><Link href="/szervezok">Szervezők</Link><Link href="/arak">Árak</Link></nav>
        <div className="programok-nav-tools"><button aria-label="Keresés"><Search size={18} /></button><Link href="/szervezoi-felulet" className="programok-submit">Szervezői felület <ArrowUpRight size={15} /></Link></div>
      </header>

      <main>
        <section className="programok-hero" id="kiemelt">
          <div className="programok-hero-intro">
            <div className="programok-eyebrow"><span /> SZÉKELYFÖLDI PROGRAMOK</div>
            <h1>Ami történik<br /><i>most.</i></h1>
            <p>Programok városról városra: koncertek, színház, mozi, kiállítások és közösségi események.</p>
            <div className="programok-hero-actions"><a href="#programok" className="programok-btn-primary">Mai programok <ChevronRight size={17} /></a><Link href="/naptar" className="programok-btn-quiet"><CalendarDays size={16} /> Naptár</Link></div>
            <div className="programok-today"><strong>{events.length || "—"}</strong><span>közelgő program<br />a városokból</span></div>
          </div>
          <div className="programok-hero-stage">
            <div className="programok-hero-image" style={{ backgroundImage: `url("${heroImage}")` }}><span className="programok-image-label">KIEMELT</span><span className="programok-image-date">{lead ? formatShortDate(lead.startDate) : "—"}</span></div>
            <div className="programok-lead-card">{lead ? <Link href={`/esemeny/${lead.id}`}><div className="programok-lead-meta">{lead.category?.name ?? "PROGRAM"} <span>{formatTime(lead.startDate)}</span></div><h2>{lead.title}</h2><p><MapPin size={14} /> {lead.location}</p><ArrowUpRight className="programok-lead-arrow" size={23} /></Link> : <p>{isLoading ? "Programok betöltése…" : "Nincs közelgő esemény."}</p>}</div>
            <span className="programok-stage-number">01</span>
          </div>
        </section>

        <section className="programok-cityline" id="varosok"><div className="programok-cityline-label">VÁROSOK</div>{CITY_NAMES.map((city, index) => <a href="#programok" key={city}><span>0{index + 1}</span>{city}</a>)}</section>

        <section className="programok-list-section" id="programok">
          <div className="programok-section-heading"><div><span className="programok-eyebrow"><span /> KÖVETKEZŐ ESEMÉNYEK</span><h2>Válassz programot.</h2></div><Link href="/naptar" className="programok-all-link">Teljes naptár <ArrowUpRight size={16} /></Link></div>
          <div className="programok-event-grid">{list.map((event, index) => <Link href={`/esemeny/${event.id}`} className="programok-event-card" key={event.id}><div className="programok-event-thumb" style={{ backgroundImage: event.imageUrl ? `url("${event.imageUrl}")` : `url("${import.meta.env.BASE_URL}reference/city-center.jpg")` }}><span>0{index + 2}</span></div><div className="programok-event-body"><div className="programok-event-date">{formatShortDate(event.startDate)} <b>{formatTime(event.startDate)}</b></div><h3>{event.title}</h3><p><MapPin size={13} /> {event.location}</p><small>{cityLabel(`${event.title} ${event.location}`)}</small></div></Link>)}</div>
        </section>

        <section className="programok-bottom-row" id="helyszinek"><div className="programok-map-card"><div><span className="programok-eyebrow"><span /> HELYSZÍNEK</span><h2>Hol találkozunk?</h2><p>Fedezd fel a városok helyeit és programjait.</p><Link href="/helyszinek">Helyszínek megnyitása <ArrowUpRight size={15} /></Link></div><div className="programok-map-grid" aria-hidden="true"><span>CSÍK</span><span>UDVARHELY</span><span>GYERGYÓ</span><span>SEPSI</span><i /></div></div><div className="programok-submit-card"><span className="programok-eyebrow"><span /> SAJÁT PROGRAM</span><h2>Van eseményed?</h2><p>Küldd be, és megjelenítjük a naptárban.</p><Link href="/bekuldese">Beküldés indítása <ArrowUpRight size={15} /></Link></div></section>
      </main>

      <footer className="programok-footer"><span className="programok-logo-small">programok.ro</span><span>Székelyföld eseményei egy helyen.</span><span>© 2026</span></footer>
    </div>
  );
}
