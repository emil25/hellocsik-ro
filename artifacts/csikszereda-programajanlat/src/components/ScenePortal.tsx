import { ArrowUpRight, CalendarDays, ChevronRight, Clock3, MapPin, Search } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { useEffect } from "react";
import "./scene-portal.css";

const FALLBACK_IMAGES = ["cloud-hero.jpg", "city-center.jpg", "visit-aktiv-szekelyfold.png", "visit-halottember.jpg"];
const CITY_NAMES = ["Csíkszereda", "Székelyudvarhely", "Gyergyószentmiklós", "Sepsiszentgyörgy", "Kézdivásárhely", "Marosvásárhely"];

function cityLabel(value: string) {
  const text = value.toLocaleLowerCase("hu-HU");
  if (text.includes("gheorgheni") || text.includes("gyergyó")) return "Gyergyó";
  if (text.includes("odorheiu") || text.includes("udvarhely")) return "Udvarhely";
  if (text.includes("miercurea") || text.includes("csík")) return "Csík";
  if (text.includes("sfântu") || text.includes("sepsi")) return "Sepsi";
  if (text.includes("târgu secuiesc") || text.includes("kézdi")) return "Kézdi";
  if (text.includes("mureș") || text.includes("maros")) return "Maros";
  return "Székelyföld";
}

export function ScenePortal() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "műsor – Székelyföldi programok";
    return () => { document.title = previousTitle; };
  }, []);

  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events[0];
  const rail = events.slice(1, 5);
  const stream = events.slice(1, 8);
  const imageStyle = (event: typeof lead | undefined, index: number) => {
    const fallback = `${import.meta.env.BASE_URL}reference/${FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}`;
    return { backgroundImage: event?.imageUrl ? `url("${event.imageUrl}"), url("${fallback}")` : `url("${fallback}")` };
  };

  return <div className="scene-page">
    <header className="scene-header">
      <Link href="/" className="scene-logo" aria-label="műsor főoldal"><span className="scene-logo-mark">m</span><span>műsor<span className="scene-logo-dot">.</span>ro</span></Link>
      <div className="scene-header-note">PROGRAMNAPTÁR <span>/</span> SZÉKELYFÖLD</div>
      <nav className="scene-nav" aria-label="Fő navigáció"><a href="#ma">Ma</a><a href="#folyam">Programfolyam</a><a href="#varosok">Városok</a><Link href="/naptar">Naptár</Link></nav>
      <Link href="/bekuldese" className="scene-add">Esemény hozzáadása <ArrowUpRight size={15} /></Link>
    </header>

    <main>
      <section className="scene-hero" id="ma">
        <div className="scene-hero-date"><span>MA</span><strong>16</strong><b>SZEPTEMBER<br />SZERDA</b><i /></div>
        <div className="scene-hero-copy"><div className="scene-kicker"><span /> MAI PROGRAMOK</div><h1>Programok<br /><em>ma.</em></h1><p>Programok és események Székelyföld városaiból, időrendben.</p><div className="scene-actions"><a href="#folyam" className="scene-primary">Mai programok <ChevronRight size={17} /></a><Link href="/naptar" className="scene-secondary"><CalendarDays size={16} /> Naptár</Link></div><div className="scene-hero-meta"><span><strong>{events.length || "—"}</strong> közelgő esemény</span><span><strong>{new Set(events.map(event => cityLabel(`${event.title} ${event.location}`))).size || "—"}</strong> város</span></div></div>
        <div className="scene-collage">
          <div className="scene-collage-main" style={imageStyle(lead, 0)}><span>KIEMELT</span><b>{lead ? formatShortDate(lead.startDate) : "—"}</b></div>
          <div className="scene-collage-tile scene-collage-tile-a" style={imageStyle(events[1], 1)}><span>02</span></div>
          <div className="scene-collage-tile scene-collage-tile-b" style={imageStyle(events[2], 2)}><span>03</span></div>
          <div className="scene-collage-caption">KÉPES PROGRAMNAPTÁR <b>2026</b></div>
        </div>
        <div className="scene-lead"><div className="scene-lead-tag">{lead?.category?.name ?? "PROGRAM"}</div>{lead ? <Link href={`/esemeny/${lead.id}`}><h2>{lead.title}</h2><p><MapPin size={13} /> {lead.location || "Székelyföld"}<span><Clock3 size={13} /> {formatTime(lead.startDate)}</span></p></Link> : <h2>{isLoading ? "Programok betöltése…" : "Nincs mai program."}</h2>}</div>
      </section>

      <section className="scene-rail" id="varosok"><div className="scene-rail-label">VÁROSOK</div>{CITY_NAMES.map((city, index) => <a href="#folyam" key={city}><small>0{index + 1}</small>{city}</a>)}<button aria-label="Keresés"><Search size={16} /></button></section>

      <section className="scene-stream" id="folyam"><div className="scene-stream-head"><div><div className="scene-kicker"><span /> PROGRAMFOLYAM</div><h2>Mi jön ezután?</h2></div><Link href="/naptar" className="scene-stream-link">Teljes naptár <ArrowUpRight size={15} /></Link></div><div className="scene-stream-layout"><div className="scene-timeline">{stream.map((event, index) => <Link href={`/esemeny/${event.id}`} className="scene-event-row" key={event.id}><div className="scene-event-time"><strong>{formatTime(event.startDate)}</strong><span>{formatShortDate(event.startDate)}</span></div><div className="scene-event-line"><i /><b /></div><div className="scene-event-info"><span>{event.category?.name ?? "PROGRAM"}</span><h3>{event.title}</h3><p><MapPin size={13} /> {event.location || "Székelyföld"}</p></div><ArrowUpRight className="scene-event-arrow" size={18} /></Link>)}</div><aside className="scene-side-note"><div className="scene-side-number">{events.length || "—"}</div><span>KÖVETKEZŐ<br />ESEMÉNY</span><p>A városok programjai egy egyszerű, naprakész folyamban.</p><Link href="/bekuldese">Saját program beküldése <ArrowUpRight size={14} /></Link></aside></div></section>
    </main>
    <footer className="scene-footer"><span className="scene-footer-logo">műsor.ro</span><span>Székelyföldi programok időrendben.</span><span>© 2026</span></footer>
  </div>;
}
