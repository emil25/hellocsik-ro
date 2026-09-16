import { ArrowUpRight, CalendarDays, ChevronRight, MapPin, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { useEffect } from "react";
import "./scene-portal.css";

const FALLBACK_IMAGES = ["cloud-hero.jpg", "city-center.jpg", "visit-aktiv-szekelyfold.png", "visit-halottember.jpg", "visit-kamarazenekar.JPG", "visit-masok-elete.png"];
const CITY_NAMES = ["Csíkszereda", "Székelyudvarhely", "Gyergyószentmiklós", "Sepsiszentgyörgy", "Kézdivásárhely", "Marosvásárhely"];
const NODE_POSITIONS = [{ left: "8%", top: "22%" }, { left: "22%", top: "69%" }, { left: "48%", top: "9%" }, { left: "73%", top: "18%" }, { left: "84%", top: "61%" }, { left: "45%", top: "82%" }];

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
    document.title = "programok.ro – Események Székelyföldön";
    return () => { document.title = previousTitle; };
  }, []);

  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events[0];
  const nodes = events.slice(1, 7);
  const nextEvents = events.slice(0, 4);
  const dates = [...new Set(events.slice(0, 8).map(event => formatShortDate(event.startDate)))];
  const imageStyle = (event: typeof lead | undefined, index: number) => {
    const fallback = `${import.meta.env.BASE_URL}reference/${FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}`;
    return { backgroundImage: event?.imageUrl ? `url("${event.imageUrl}"), url("${fallback}")` : `url("${fallback}")` };
  };

  return <div className="scene-page pulse-page">
    <header className="pulse-header">
      <Link href="/" className="pulse-logo" aria-label="programok.ro főoldal"><span className="pulse-logo-mark"><i /><i /><i /></span><span>programok<span>.ro</span></span></Link>
      <div className="pulse-search"><Search size={17} /><span>Mit keresel? koncert, film, helyszín...</span><kbd>⌘ K</kbd></div>
      <nav className="pulse-nav" aria-label="Fő navigáció"><a href="#korkep" className="pulse-nav-active">Körkép</a><a href="#ma">Ma</a><a href="#varosok">Városok</a><Link href="/naptar">Naptár</Link></nav>
      <Link href="/bekuldese" className="pulse-submit">+ Beküldés</Link>
    </header>

    <main>
      <section className="pulse-hero" id="korkep">
        <div className="pulse-hero-copy"><div className="pulse-hero-kicker"><span className="pulse-live-dot" /> SZÉKELYFÖLDI KÖRKÉP <b>2026.09.16.</b></div><h1>Mi történik<br /><em>körülötted?</em></h1><p>Minden, ami ma este történik. Válassz várost, időpontot vagy hangulatot.</p><div className="pulse-quick-filter"><a href="#ma" className="pulse-filter-active">Ma <strong>{events.length || "—"}</strong></a><a href="#ma">Ezen a héten</a><a href="#varosok">Város szerint</a></div><div className="pulse-hero-links"><a href="#ma" className="pulse-btn pulse-btn-dark">Programok megnyitása <ChevronRight size={16} /></a><Link href="/naptar" className="pulse-btn pulse-btn-light"><CalendarDays size={16} /> Naptár</Link></div></div>
        <div className="pulse-map" aria-label="Mai események térképe"><div className="pulse-map-grid" /><div className="pulse-map-ring pulse-map-ring-one" /><div className="pulse-map-ring pulse-map-ring-two" /><div className="pulse-map-center"><strong>16</strong><span>SZEPTEMBER<br />SZERDA</span><b>{events.length || "—"} PROGRAM</b></div>{nodes.map((event, index) => <Link href={`/esemeny/${event.id}`} className={`pulse-node pulse-node-${index + 1}`} style={NODE_POSITIONS[index]} key={event.id}><i /><span>{event.title}</span><b>{formatTime(event.startDate)}</b></Link>)}<div className="pulse-map-caption"><Sparkles size={13} /> MAI PROGRAMOK <span>VÁLASSZ EGY PONTOT</span></div></div>
        <div className="pulse-feature" style={imageStyle(lead, 0)}><div className="pulse-feature-shade" /><span>KIEMELT</span><div><small>{lead?.category?.name ?? "PROGRAM"}</small><h2>{lead?.title ?? (isLoading ? "Programok betöltése…" : "Nincs kiemelt program")}</h2><p><MapPin size={13} /> {lead?.location || "Székelyföld"}</p></div><Link href={lead ? `/esemeny/${lead.id}` : "/naptar"} aria-label="Kiemelt esemény megnyitása"><ArrowUpRight size={18} /></Link></div>
      </section>

      <section className="pulse-now" id="ma"><div className="pulse-section-title"><span className="pulse-section-index">01</span><div><span className="pulse-label">MOST A KÖRNYÉKEN</span><h2>A következő programok</h2></div><Link href="/naptar">Teljes naptár <ArrowUpRight size={15} /></Link></div><div className="pulse-now-layout"><div className="pulse-now-reel">{nextEvents.map((event, index) => <Link href={`/esemeny/${event.id}`} className={`pulse-now-card pulse-now-card-${index + 1}`} key={event.id}><div className="pulse-now-image" style={imageStyle(event, index + 1)}><span>{formatShortDate(event.startDate)}</span><b>{formatTime(event.startDate)}</b></div><div className="pulse-now-info"><small>{event.category?.name ?? "PROGRAM"}</small><h3>{event.title}</h3><p><MapPin size={12} /> {event.location || "Székelyföld"}</p></div></Link>)}</div><aside className="pulse-next"><span className="pulse-label">KÖVETKEZŐ</span><strong>{nextEvents[0] ? formatTime(nextEvents[0].startDate) : "—"}</strong><b>{nextEvents[0]?.title ?? "Programok betöltése…"}</b><p>{nextEvents[0]?.location || "Székelyföld"}</p><Link href={nextEvents[0] ? `/esemeny/${nextEvents[0].id}` : "/naptar"}>Megnyitás <ArrowUpRight size={14} /></Link></aside></div></section>

      <section className="pulse-week"><div className="pulse-section-title"><span className="pulse-section-index">02</span><div><span className="pulse-label">IDŐPONTOK</span><h2>Mikor érsz rá?</h2></div><span className="pulse-week-note"><SlidersHorizontal size={14} /> Szűrés kategória szerint</span></div><div className="pulse-week-track">{dates.map((date, index) => <a href="#ma" className={index === 0 ? "pulse-week-selected" : ""} key={date}><span>{String(index + 16).padStart(2, "0")}</span><b>{date.split(" ")[0]}</b><small>{date.split(" ")[1] ?? ""}</small><i>{events.filter(event => formatShortDate(event.startDate) === date).length || "0"}</i></a>)}<Link href="/naptar" className="pulse-week-more">Naptár <ArrowUpRight size={15} /></Link></div></section>

      <section className="pulse-cities" id="varosok"><div className="pulse-section-title"><span className="pulse-section-index">03</span><div><span className="pulse-label">HELYSZÍN</span><h2>Merre induljunk?</h2></div></div><div className="pulse-city-grid">{CITY_NAMES.map((city, index) => <a href="#ma" key={city}><span>0{index + 1}</span><strong>{city}</strong><small>{new Set(events.filter(event => cityLabel(`${event.title} ${event.location}`) === cityLabel(city)).map(event => event.id)).size || 0} program</small><ArrowUpRight size={16} /></a>)}</div></section>
      <section className="pulse-invite"><span className="pulse-invite-mark">+</span><div><span className="pulse-label">SAJÁT ESEMÉNY</span><h2>Kerüljön fel a térképre.</h2></div><Link href="/bekuldese" className="pulse-btn pulse-btn-dark">Beküldés <ArrowUpRight size={16} /></Link></section>
    </main>
    <footer className="pulse-footer"><span className="pulse-footer-logo">programok.ro</span><span>Székelyföld programjai egy helyen.</span><span>© 2026</span></footer>
  </div>;
}
