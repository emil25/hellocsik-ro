import { ArrowUpRight, CalendarDays, ChevronRight, MapPin, Search, Sparkles } from "lucide-react";
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
    document.title = "programok.ro – Események Székelyföldön";
    return () => { document.title = previousTitle; };
  }, []);

  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events[0];
  const today = events.slice(0, 3);
  const next = events.slice(1, 6);
  const dates = [...new Set(events.slice(0, 8).map(event => formatShortDate(event.startDate)))];
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

  return <div className="scene-page poster-page">
    <header className="poster-header">
      <Link href="/" className="poster-logo" aria-label="programok.ro főoldal">
        <span className="poster-logo-mark"><i /><i /><i /></span>
        <span>programok<span>.ro</span></span>
      </Link>
      <nav className="poster-nav" aria-label="Fő navigáció">
        <a href="#felfedezes" className="poster-nav-active">Felfedezés</a>
        <a href="#ma">Ma</a>
        <a href="#varosok">Városok</a>
        <Link href="/naptar">Naptár</Link>
      </nav>
      <div className="poster-header-actions">
        <div className="poster-search"><Search size={16} /><span>Keresés</span></div>
        <Link href="/bekuldese" className="poster-submit">+ Esemény beküldése</Link>
      </div>
    </header>

    <main>
      <section className="poster-hero" id="felfedezes">
        <div className="poster-hero-copy">
          <div className="poster-issue"><span>PROGRAMOK.RO</span><b>01 / 06</b></div>
          <div className="poster-date"><span>2026</span><strong>16</strong><span>SZEPTEMBER<br />SZERDA</span></div>
          <h1>MA<br /><em>ESTE</em><b>.</b></h1>
          <p>{events.length || "—"} program Székelyföldön. Koncert, film, színház, vásár és minden, amiért érdemes elindulni.</p>
          <div className="poster-hero-actions">
            <a href="#ma" className="poster-btn poster-btn-primary">Mai programok <ChevronRight size={17} /></a>
            <Link href="/naptar" className="poster-btn poster-btn-ghost"><CalendarDays size={16} /> Naptár</Link>
          </div>
        </div>
        <div className="poster-hero-art">
          <div className="poster-shape poster-shape-yellow" />
          <div className="poster-shape poster-shape-coral" />
          <div className="poster-shape poster-shape-blue" />
          <div className="poster-stamp"><Sparkles size={12} /><span>HELYBEN<br />TÖRTÉNIK</span></div>
          <div className="poster-main-art" style={imageStyle(lead, 0)}>
            <div className="poster-main-art-overlay" />
            <div className="poster-art-top"><span>KIEMELT PROGRAM</span><b>{lead?.category?.name ?? "MAI ESEMÉNY"}</b></div>
            <div className="poster-art-bottom">
              <span>{lead ? formatTime(lead.startDate) : "—"} · {lead?.location || "Székelyföld"}</span>
              <h2>{lead?.title ?? (isLoading ? "Programok betöltése…" : "Nincs kiemelt program")}</h2>
              <Link href={lead ? "/esemeny/" + lead.id : "/naptar"} aria-label="Kiemelt esemény megnyitása"><ArrowUpRight size={19} /></Link>
            </div>
          </div>
          <div className="poster-art-number">16<span>SEP</span></div>
          <div className="poster-art-caption">CSÍK · UDV · GYERGYÓ<br />KULTÚRA / ZENE / MOZGÁS</div>
        </div>
        <div className="poster-hero-index" aria-hidden="true"><span>SCROLL</span><i /></div>
      </section>

      <div className="poster-ticker" aria-label="Mai események">
        <div><span>MA ESTE</span><b>ÉLŐ PROGRAMOK</b><i>✦</i><span>CSÍKSZEREDA</span><b>SZÉKELYUDVARHELY</b><i>✦</i><span>GYERGYÓ</span><b>SEPSI</b><i>✦</i></div>
      </div>

      <section className="poster-today" id="ma">
        <div className="poster-section-head">
          <div><span className="poster-section-kicker">01 / MOST TÖRTÉNIK</span><h2>Válassz<br /><em>programot.</em></h2></div>
          <div className="poster-head-note"><span>Ma, szeptember 16.</span><strong>{events.length || "—"} esemény</strong><Link href="/naptar">Teljes naptár <ArrowUpRight size={15} /></Link></div>
        </div>
        <div className="poster-showcase">
          <div className="poster-primary-list">
            {today.map((event, index) => <Link href={"/esemeny/" + event.id} className={"poster-event-poster poster-event-" + (index + 1)} key={event.id}>
              <div className="poster-event-image" style={imageStyle(event, index + 1)}>
                <span className="poster-event-date">{formatShortDate(event.startDate)}</span>
                <b className="poster-event-time">{formatTime(event.startDate)}</b>
              </div>
              <div className="poster-event-copy"><span>{event.category?.name ?? "PROGRAM"}</span><h3>{event.title}</h3><p><MapPin size={13} /> {event.location || "Székelyföld"}</p><ArrowUpRight size={18} /></div>
            </Link>)}
          </div>
          <aside className="poster-next-panel">
            <span className="poster-section-kicker">KÖVETKEZIK</span>
            <strong>{next[0] ? formatShortDate(next[0].startDate) : "—"}</strong>
            <h3>{next[0]?.title ?? "Programok betöltése…"}</h3>
            <p><MapPin size={13} /> {next[0]?.location || "Székelyföld"}</p>
            <Link href={next[0] ? "/esemeny/" + next[0].id : "/naptar"}>Megnyitás <ArrowUpRight size={15} /></Link>
            <div className="poster-next-list">{next.slice(1, 4).map(event => <Link href={"/esemeny/" + event.id} key={event.id}><span>{formatTime(event.startDate)}</span><b>{event.title}</b><ArrowUpRight size={13} /></Link>)}</div>
          </aside>
        </div>
      </section>

      <section className="poster-dates">
        <div className="poster-section-head poster-dates-head"><div><span className="poster-section-kicker">02 / NAPTÁR</span><h2>Mikor<br /><em>érsz rá?</em></h2></div><span className="poster-date-hint">A következő napok programjai</span></div>
        <div className="poster-date-row">
          {dates.map((date, index) => <a href="#ma" className={index === 0 ? "poster-date-active" : ""} key={date}><span>{String(index + 16).padStart(2, "0")}</span><b>{date.split(" ")[0]}</b><small>{date.split(" ")[1] || ""}</small><i>{events.filter(event => formatShortDate(event.startDate) === date).length}</i></a>)}
          <Link href="/naptar" className="poster-date-calendar">Naptár <ArrowUpRight size={16} /></Link>
        </div>
      </section>

      <section className="poster-cities" id="varosok">
        <div className="poster-section-head poster-cities-head"><div><span className="poster-section-kicker">03 / ÚTVONAL</span><h2>Merre<br /><em>indulsz?</em></h2></div><Link href="/helyszinek">Minden helyszín <ArrowUpRight size={15} /></Link></div>
        <div className="poster-city-lines">{CITY_NAMES.map((city, index) => <a href="#ma" key={city}><span>0{index + 1}</span><strong>{city}</strong><small>{cityCount(city)} program</small><ArrowUpRight size={17} /></a>)}</div>
      </section>

      <section className="poster-invite"><div className="poster-invite-shape">+</div><div><span className="poster-section-kicker">SAJÁT ESEMÉNY?</span><h2>Tedd fel a programod.</h2></div><Link href="/bekuldese" className="poster-btn poster-btn-primary">Beküldés <ArrowUpRight size={16} /></Link></section>
    </main>
    <footer className="poster-footer"><span className="poster-footer-logo">programok<span>.ro</span></span><span>Székelyföld programjai egy helyen.</span><span>© 2026</span></footer>
  </div>;
}
