import { ArrowUpRight, CalendarDays, ChevronRight, MapPin, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { useEffect } from "react";
import "./scene-portal.css";

const FALLBACK_IMAGES = [
  "cloud-hero.jpg",
  "city-center.jpg",
  "visit-aktiv-szekelyfold.png",
  "visit-halottember.jpg",
  "visit-kamarazenekar.JPG",
  "visit-masok-elete.png",
  "visit-otthont.png",
];
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
    document.title = "programok.ro – Eseményplakátok Székelyföldön";
    return () => { document.title = previousTitle; };
  }, []);

  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const wallEvents = events.slice(0, 6);
  const rackEvents = events.slice(0, 8);
  const dates = [...new Set(events.slice(0, 9).map(event => formatShortDate(event.startDate)))];
  const lead = events[0];
  const imageStyle = (event: typeof lead | undefined, index: number) => {
    const fallback = import.meta.env.BASE_URL + "reference/" + FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    return {
      backgroundImage: event?.imageUrl
        ? 'url("' + event.imageUrl + '"), url("' + fallback + '")'
        : 'url("' + fallback + '")',
    };
  };
  const cityCount = (city: string) => new Set(
    events
      .filter(event => cityLabel((event.title || "") + " " + (event.location || "")) === cityLabel(city))
      .map(event => event.id),
  ).size;

  return <div className="scene-page wall-page">
    <header className="wall-header">
      <Link href="/" className="wall-logo" aria-label="programok.ro főoldal">
        <span className="wall-logo-mark"><i /><i /><i /></span>
        <span>programok<span>.ro</span></span>
      </Link>
      <nav className="wall-nav" aria-label="Fő navigáció">
        <a href="#felfedezes" className="wall-nav-active">Felfedezés</a>
        <a href="#ma">Ma</a>
        <a href="#napok">Napok</a>
        <a href="#varosok">Városok</a>
        <Link href="/naptar">Naptár</Link>
      </nav>
      <div className="wall-header-actions">
        <div className="wall-search"><Search size={16} /><span>Keresés</span></div>
        <Link href="/bekuldese" className="wall-submit">+ Esemény beküldése</Link>
      </div>
    </header>

    <main>
      <section className="wall-hero" id="felfedezes">
        <div className="wall-hero-top">
          <div className="wall-hero-title">
            <div className="wall-topline"><span>16 SZEPTEMBER 2026</span><b>SZÉKELYFÖLD</b><i /></div>
            <h1>MAI<br /><em>PLAKÁTOK</em></h1>
            <p>Az események képei, időpontjai és helyszínei egy falon.</p>
          </div>
          <div className="wall-hero-tools">
            <div className="wall-total"><strong>{events.length || "—"}</strong><span>közelgő<br />esemény</span></div>
            <div className="wall-filter-row"><a href="#ma" className="wall-filter-active">Ma</a><a href="#ma">Ezen a héten</a><a href="#varosok">Város szerint</a></div>
          </div>
        </div>

        <div className="wall-mosaic" aria-label="Eseményplakátok">
          {wallEvents.map((event, index) => <Link href={"/esemeny/" + event.id} className={"wall-poster wall-poster-" + (index + 1)} key={event.id}>
            <div className="wall-poster-image" style={imageStyle(event, index)} />
            <div className="wall-poster-shade" />
            <div className={"wall-tape wall-tape-" + (index % 4)}>{index === 0 ? "KIEMELT" : event.category?.name ?? "PROGRAM"}</div>
            <span className="wall-poster-number">0{index + 1}</span>
            <div className="wall-poster-copy">
              <span>{formatShortDate(event.startDate)} · {formatTime(event.startDate)}</span>
              <h2>{event.title}</h2>
              <p><MapPin size={12} /> {event.location || "Székelyföld"}</p>
            </div>
            <span className="wall-poster-arrow"><ArrowUpRight size={18} /></span>
          </Link>)}
          {!wallEvents.length && <div className="wall-empty">{isLoading ? "A plakátok betöltése…" : "Még nincs közelgő esemény."}</div>}
        </div>
        <div className="wall-scroll"><span>GÖRGESS A PLAKÁTFALON</span><ChevronRight size={15} /></div>
      </section>

      <div className="wall-marquee" aria-label="Programtípusok">
        <div><span>KONCERT</span><i>✦</i><span>SZÍNHÁZ</span><i>✦</i><span>FILM</span><i>✦</i><span>VÁSÁR</span><i>✦</i><span>KIÁLLÍTÁS</span><i>✦</i><span>KÖZÖSSÉG</span><i>✦</i></div>
      </div>

      <section className="wall-feed" id="ma">
        <div className="wall-feed-head">
          <div><span className="wall-kicker">01 / PROGRAMFAL</span><h2>Válassz<br /><em>egy plakátot.</em></h2></div>
          <div className="wall-feed-side"><span>Folyamatosan frissülő események</span><Link href="/naptar">Teljes naptár <ArrowUpRight size={15} /></Link></div>
        </div>
        <div className="wall-feed-tools"><span><SlidersHorizontal size={14} /> SZŰRÉS</span><a className="wall-chip-active" href="#ma">Összes</a><a href="#ma">Zene</a><a href="#ma">Színház</a><a href="#ma">Film</a><a href="#ma">Közösség</a></div>
        <div className="wall-rack">
          {rackEvents.map((event, index) => <Link href={"/esemeny/" + event.id} className={"wall-rack-poster wall-rack-" + (index % 4)} key={event.id}>
            <div className="wall-rack-image" style={imageStyle(event, index + 1)}><span>{formatTime(event.startDate)}</span><b>{formatShortDate(event.startDate)}</b></div>
            <div className="wall-rack-copy"><small>{event.category?.name ?? "PROGRAM"}</small><h3>{event.title}</h3><p>{event.location || "Székelyföld"}</p><ArrowUpRight size={16} /></div>
          </Link>)}
        </div>
      </section>

      <section className="wall-days" id="napok">
        <div className="wall-days-head"><div><span className="wall-kicker">02 / IDŐVONAL</span><h2>Melyik<br /><em>napon?</em></h2></div><span><CalendarDays size={15} /> A következő napok programjai</span></div>
        <div className="wall-day-strip">
          {dates.map((date, index) => <a href="#ma" className={index === 0 ? "wall-day-active" : ""} key={date}><strong>{String(index + 16).padStart(2, "0")}</strong><span>{date.split(" ")[0]}</span><small>{date.split(" ")[1] || ""}</small><b>{events.filter(event => formatShortDate(event.startDate) === date).length}</b></a>)}
          <Link href="/naptar" className="wall-day-more">Naptár <ArrowUpRight size={15} /></Link>
        </div>
      </section>

      <section className="wall-cities" id="varosok">
        <div className="wall-cities-head"><div><span className="wall-kicker">03 / HELYSZÍNEK</span><h2>Honnan<br /><em>indulsz?</em></h2></div><Link href="/helyszinek">Minden helyszín <ArrowUpRight size={15} /></Link></div>
        <div className="wall-city-grid">{CITY_NAMES.map((city, index) => <a href="#ma" key={city}><span>0{index + 1}</span><strong>{city}</strong><small>{cityCount(city)} plakát</small><ArrowUpRight size={17} /></a>)}</div>
      </section>

      <section className="wall-invite"><div className="wall-invite-burst">+</div><div><span className="wall-kicker">SAJÁT ESEMÉNY?</span><h2>Küldd el a plakátod.</h2></div><Link href="/bekuldese" className="wall-btn">Beküldés <ArrowUpRight size={16} /></Link></section>
    </main>
    <footer className="wall-footer"><span className="wall-footer-logo">programok<span>.ro</span></span><span>Székelyföld programjai egy helyen.</span><span>© 2026</span></footer>
  </div>;
}
