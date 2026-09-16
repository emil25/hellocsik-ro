import { ArrowUpRight, CalendarDays, ChevronRight, MapPin, Search, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { useEffect } from "react";
import "./scene-portal.css";

const FALLBACK_IMAGES = ["cloud-hero.jpg", "city-center.jpg", "visit-aktiv-szekelyfold.png", "visit-halottember.jpg", "visit-kamarazenekar.JPG"];
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
    document.title = "programok.ro – Események Székelyföldön";
    return () => { document.title = previousTitle; };
  }, []);

  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events[0];
  const cards = events.slice(1, 6);
  const imageStyle = (event: typeof lead | undefined, index: number) => {
    const fallback = `${import.meta.env.BASE_URL}reference/${FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}`;
    return { backgroundImage: event?.imageUrl ? `url("${event.imageUrl}"), url("${fallback}")` : `url("${fallback}")` };
  };

  return <div className="scene-page stage-page">
    <header className="scene-header stage-header">
      <Link href="/" className="scene-logo stage-logo" aria-label="programok.ro főoldal"><span className="stage-logo-mark">✦</span><span>programok<span className="scene-logo-dot">.ro</span></span></Link>
      <div className="stage-header-note">SZÉKELYFÖLDI ESEMÉNYEK</div>
      <nav className="scene-nav stage-nav" aria-label="Fő navigáció"><a href="#felfedezes" className="scene-nav-current">Felfedezés</a><a href="#ma">Ma</a><a href="#varosok">Városok</a><Link href="/naptar">Naptár</Link></nav>
      <button className="stage-search" type="button" aria-label="Keresés"><Search size={18} /></button>
      <Link href="/bekuldese" className="scene-add stage-add">Esemény hozzáadása <ArrowUpRight size={15} /></Link>
    </header>

    <main>
      <section className="stage-hero" id="felfedezes">
        <div className="stage-hero-top"><span className="stage-overline"><Sparkles size={14} /> ESEMÉNYEK, AMIKRE ÉRDEMES ELINDULNI</span><span className="stage-date-line">2026. SZEPTEMBER 16. · SZERDA</span></div>
        <div className="stage-hero-content">
          <div className="stage-hero-copy">
            <span className="stage-eyebrow">CSÍK · GYERGYÓ · UDVARHELY · SEPSI</span>
            <h1>Találj rá<br /><em>ma.</em></h1>
            <p>Egy helyen a koncertek, filmek, kiállítások és programok, amelyek megtöltik a városokat.</p>
            <div className="stage-actions"><a href="#ma" className="stage-primary">Mai programok <ChevronRight size={17} /></a><Link href="/naptar" className="stage-secondary"><CalendarDays size={16} /> Teljes naptár</Link></div>
            <div className="stage-hero-meta"><span><strong>{events.length || "—"}</strong><small>közelgő esemény</small></span><span><strong>{new Set(events.map(event => cityLabel(`${event.title} ${event.location}`))).size || "—"}</strong><small>város programjai</small></span></div>
          </div>
          <div className="stage-art" aria-label="Kiemelt események">
            <div className="stage-orb stage-orb-one" /><div className="stage-orb stage-orb-two" />
            <div className="stage-poster" style={imageStyle(lead, 0)}><span className="stage-poster-label">KIEMELT PROGRAM</span><span className="stage-poster-date">{lead ? formatShortDate(lead.startDate) : "MA"}</span><div className="stage-poster-gradient" /><div className="stage-poster-caption"><b>{lead?.category?.name ?? "PROGRAM"}</b><h2>{lead?.title ?? (isLoading ? "Programok betöltése…" : "Nézd meg, mi történik ma.")}</h2><span><MapPin size={13} /> {lead?.location || "Székelyföld"}</span></div></div>
            <div className="stage-float-card stage-float-card-one" style={imageStyle(cards[0], 1)}><span>01</span><b>{cards[0] ? formatTime(cards[0].startDate) : "—"}</b></div>
            <div className="stage-float-card stage-float-card-two" style={imageStyle(cards[1], 2)}><span>02</span><b>{cards[1] ? formatShortDate(cards[1].startDate) : "—"}</b></div>
            <div className="stage-sticker">NINCS<br />UNALOM <i>↗</i></div>
          </div>
        </div>
        <div className="stage-scroll-hint"><span>GÖRGESS</span><i /></div>
      </section>

      <section className="stage-citybar" id="varosok"><span className="stage-citybar-title">VÁLASSZ VÁROST</span>{CITY_NAMES.map((city, index) => <a href="#ma" key={city}><i>0{index + 1}</i>{city}</a>)}<button type="button" aria-label="Keresés"><Search size={16} /></button></section>

      <section className="stage-showcase" id="ma"><div className="stage-section-head"><div><span className="stage-eyebrow">KÖVETKEZIK</span><h2>A következő napok</h2></div><Link href="/naptar" className="stage-view-all">Minden esemény <ArrowUpRight size={15} /></Link></div>
        <div className="stage-cards">
          {cards.map((event, index) => <Link href={`/esemeny/${event.id}`} className={`stage-event-card stage-event-card-${index + 1}`} key={event.id}>
            <div className="stage-event-image" style={imageStyle(event, index + 1)}><span>{formatShortDate(event.startDate)}</span><b>{formatTime(event.startDate)}</b></div>
            <div className="stage-event-body"><span className="stage-event-category">{event.category?.name ?? "PROGRAM"}</span><h3>{event.title}</h3><p><MapPin size={13} /> {event.location || "Székelyföld"}</p></div><ArrowUpRight className="stage-event-arrow" size={17} />
          </Link>)}
          {!isLoading && cards.length === 0 && <div className="stage-empty">Még nincs több közelgő esemény. <Link href="/bekuldese">Küldj be egy programot <ArrowUpRight size={14} /></Link></div>}
        </div>
      </section>

      <section className="stage-invite"><div className="stage-invite-mark">+</div><div><span className="stage-eyebrow">TE IS ISMERSZ EGY JÓ PROGRAMOT?</span><h2>Kerüljön fel a programok.ro-ra.</h2></div><Link href="/bekuldese" className="stage-primary">Beküldöm <ArrowUpRight size={16} /></Link></section>
    </main>
    <footer className="scene-footer stage-footer"><span className="stage-footer-logo">programok.ro</span><span>Programok Székelyföld városaiból.</span><span>© 2026</span></footer>
  </div>;
}
