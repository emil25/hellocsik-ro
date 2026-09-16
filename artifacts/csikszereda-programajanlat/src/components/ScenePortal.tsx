import { ArrowUpRight, CalendarDays, ChevronRight, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { useEffect } from "react";
import "./scene-portal.css";

const FALLBACK_IMAGES = ["cloud-hero.jpg", "city-center.jpg", "visit-aktiv-szekelyfold.png", "visit-halottember.jpg", "visit-kamarazenekar.JPG", "visit-masok-elete.png"];
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
  const visibleEvents = events.slice(1, 7);
  const dates = [...new Set(events.slice(0, 6).map(event => formatShortDate(event.startDate)))];
  const imageStyle = (event: typeof lead | undefined, index: number) => {
    const fallback = `${import.meta.env.BASE_URL}reference/${FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}`;
    return { backgroundImage: event?.imageUrl ? `url("${event.imageUrl}"), url("${fallback}")` : `url("${fallback}")` };
  };

  return <div className="scene-page orbit-page">
    <header className="orbit-header">
      <Link href="/" className="orbit-logo" aria-label="programok.ro főoldal"><span className="orbit-logo-mark"><i /></span><span>programok<span>.ro</span></span></Link>
      <nav className="orbit-nav" aria-label="Fő navigáció"><a href="#felfedezes" className="orbit-nav-active">Felfedezés</a><a href="#ma">Ma</a><a href="#varosok">Városok</a><Link href="/naptar">Naptár</Link></nav>
      <div className="orbit-header-tools"><button type="button" aria-label="Keresés"><Search size={17} /></button><Link href="/bekuldese" className="orbit-submit">Program beküldése <ArrowUpRight size={14} /></Link></div>
    </header>

    <main>
      <section className="orbit-hero" id="felfedezes">
        <div className="orbit-hero-word">PROGRAMOK</div>
        <div className="orbit-hero-copy"><span className="orbit-label">SZÉKELYFÖLD · MA</span><div className="orbit-date"><strong>16</strong><span>SZEPT.<br />SZERDA</span></div><h1>Mit néznél<br /><em>ma?</em></h1><p>Koncertek, előadások, filmek és helyek egy mozdulatra.</p><div className="orbit-hero-actions"><a href="#ma" className="orbit-btn orbit-btn-dark">Nézd meg <ChevronRight size={17} /></a><Link href="/naptar" className="orbit-btn orbit-btn-light"><CalendarDays size={16} /> Naptár</Link></div></div>
        <div className="orbit-hero-feature" style={imageStyle(lead, 0)}><div className="orbit-hero-feature-shade" /><div className="orbit-feature-top"><span>MAI KIEMELT</span><b>{lead ? formatTime(lead.startDate) : "—"}</b></div><div className="orbit-feature-bottom"><span>{lead?.category?.name ?? "PROGRAM"}</span><h2>{lead?.title ?? (isLoading ? "Programok betöltése…" : "Nincs kiemelt program")}</h2><p><MapPin size={14} /> {lead?.location || "Székelyföld"}</p></div><Link href={lead ? `/esemeny/${lead.id}` : "/naptar"} className="orbit-feature-open" aria-label="Kiemelt esemény megnyitása"><ArrowUpRight size={19} /></Link></div>
        <div className="orbit-hero-corner"><span>{events.length || "—"}</span><small>közelgő<br />program</small></div>
      </section>

      <section className="orbit-datebar" id="ma"><div className="orbit-datebar-title"><span>PROGRAMOK</span><b>következő napok</b></div><div className="orbit-dates">{dates.map((date, index) => <a href="#esemenyfal" className={index === 0 ? "is-selected" : ""} key={date}><strong>{date.split(" ")[1] ?? date}</strong><small>{date.split(" ")[0]}</small></a>)}<a href="#esemenyfal" className="orbit-date-more"><SlidersHorizontal size={15} /> Szűrés</a></div></section>

      <section className="orbit-wall" id="esemenyfal"><div className="orbit-wall-heading"><div><span className="orbit-label">AMIKOR ELINDULSZ</span><h2>Válassz egy programot.</h2></div><span className="orbit-wall-count">{events.length || "—"} esemény<br />folyamatosan frissítve</span></div><div className="orbit-wall-grid">{visibleEvents.map((event, index) => <Link href={`/esemeny/${event.id}`} className={`orbit-wall-card orbit-wall-card-${index + 1}`} key={event.id}><div className="orbit-wall-image" style={imageStyle(event, index + 1)}><span>{formatShortDate(event.startDate)}</span><b>{formatTime(event.startDate)}</b><i>{String(index + 1).padStart(2, "0")}</i></div><div className="orbit-wall-body"><span>{event.category?.name ?? "PROGRAM"}</span><h3>{event.title}</h3><p><MapPin size={13} /> {event.location || "Székelyföld"}</p></div><ArrowUpRight className="orbit-wall-arrow" size={17} /></Link>)}{!isLoading && visibleEvents.length === 0 && <div className="orbit-empty">Még nincs több közelgő esemény. <Link href="/bekuldese">Program beküldése <ArrowUpRight size={14} /></Link></div>}</div></section>

      <section className="orbit-city-section" id="varosok"><div className="orbit-city-intro"><span className="orbit-label">HELYSZÍNEK</span><h2>Hol történik?</h2><p>Fedezd fel a városokat egyenként.</p><Link href="/helyszinek">Összes helyszín <ArrowUpRight size={15} /></Link></div><div className="orbit-city-list">{CITY_NAMES.map((city, index) => <a href="#ma" key={city}><span>0{index + 1}</span><strong>{city}</strong><ArrowUpRight size={16} /></a>)}</div></section>
      <section className="orbit-invite"><span className="orbit-invite-number">+</span><div><span className="orbit-label">SAJÁT PROGRAMOD VAN?</span><h2>Küldd be egy perc alatt.</h2></div><Link href="/bekuldese" className="orbit-btn orbit-btn-dark">Beküldés <ArrowUpRight size={16} /></Link></section>
    </main>
    <footer className="orbit-footer"><span className="orbit-footer-logo">programok.ro</span><span>Székelyföld programjai egy helyen.</span><span>© 2026</span></footer>
  </div>;
}
