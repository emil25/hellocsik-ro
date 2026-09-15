import { ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { eventCountyMatches, REGION_COUNTIES, type RegionCounty } from "@/lib/region";
import type { ReactNode } from "react";
import "./region-atlas-home.css";

const countyStyles: Record<RegionCounty, string> = {
  Hargita: "atlas-county-harghita",
  Kovászna: "atlas-county-covasna",
  Maros: "atlas-county-mures",
};

export function RegionAtlasHero({ viewSwitch }: { viewSwitch: ReactNode }) {
  const { data, isLoading, isError, refetch } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events.find(event => event.featured && event.imageUrl) ?? events.find(event => event.imageUrl) ?? events[0];
  const next = events.filter(event => event.id !== lead?.id).slice(0, 4);
  const countFor = (county: RegionCounty) => events.filter(event => eventCountyMatches(`${event.title} ${event.location} ${event.locationAddress ?? ""} ${event.description ?? ""}`, county)).length;

  return (
    <section className="region-atlas" aria-label="Székelyföldi eseménynaptár">
      <div className="region-atlas-shell">
        <header className="atlas-topbar">
          <div className="atlas-brand"><span className="atlas-brand-dot" /> HELLOCSÍK <b>/ SZÉKELYFÖLD</b></div>
          <div className="atlas-top-actions"><span>2026 · 3 MEGYE · EGY KÖZÖS RITMUS</span>{viewSwitch}</div>
        </header>

        <div className="atlas-hero-grid">
          <div className="atlas-intro">
            <span className="atlas-kicker"><Sparkles size={14} /> PROGRAMRADAR</span>
            <h1>Három megye.<br /><em>Egy helyen.</em></h1>
            <p>Székelyföld következő koncertjei, vásárai, előadásai és közösségi programjai egy gyorsan átnézhető térképen.</p>
            <div className="atlas-actions">
              <a href="#kozelgo" className="atlas-primary">Mai programok <ArrowRight size={17} /></a>
              <Link href="/naptar" className="atlas-secondary"><CalendarDays size={17} /> Naptár</Link>
            </div>
            <div className="atlas-county-rail" aria-label="Megyék szerinti programok">
              {REGION_COUNTIES.map(county => <div className={`atlas-county-pill ${countyStyles[county]}`} key={county}><strong>{countFor(county)}</strong><span>{county} megye</span></div>)}
            </div>
          </div>

          <div className="atlas-radar" aria-label="Székelyföld programradar">
            <div className="atlas-radar-grid" />
            <div className="atlas-radar-heading"><span>RÉGIÓS RADAR</span><small>frissítve ma</small></div>
            {REGION_COUNTIES.map((county, index) => <div className={`atlas-node atlas-node-${index + 1}`} key={county}><i /><b>{county}</b><span>{countFor(county)} program</span></div>)}
            <div className="atlas-radar-center"><span>SF</span><small>Székelyföld</small></div>
            <div className="atlas-radar-footer"><MapPin size={14} /> Hargita · Kovászna · Maros</div>
          </div>
        </div>

        <div className="atlas-feature-row">
          <div className="atlas-feature-label"><span>KIEMELT</span><p>A következő nagy élmény</p></div>
          {lead ? <Link href={`/esemeny/${lead.id}`} className="atlas-feature-card">
            <img src={lead.imageUrl} alt="" />
            <div className="atlas-feature-overlay" />
            <div className="atlas-feature-copy"><span>{lead.category?.name ?? "Program"} · {formatShortDate(lead.startDate)}</span><h2>{lead.title}</h2><p><MapPin size={14} /> {lead.location} <b>·</b> {formatTime(lead.startDate)}</p></div><ArrowRight className="atlas-feature-arrow" size={22} />
          </Link> : <div className="atlas-feature-card atlas-feature-empty"><div><span>HELLO, SZÉKELYFÖLD!</span><h2>{isLoading ? "Eseményeket keresünk…" : "Hamarosan új programok érkeznek."}</h2>{isError && <button onClick={() => refetch()}>Újrapróbálom</button>}</div></div>}
        </div>

        {next.length > 0 && <div className="atlas-next"><div className="atlas-next-title"><span>AMIT MÉG ÉRDEMES LÁTNI</span><p>Programok a következő napokra</p></div><div className="atlas-next-list">{next.map((event, index) => <Link href={`/esemeny/${event.id}`} className="atlas-next-card" key={event.id}><span className="atlas-next-index">0{index + 1}</span><div><small>{formatShortDate(event.startDate)} · {formatTime(event.startDate)}</small><h3>{event.title}</h3><p><MapPin size={12} /> {event.location}</p></div><ArrowRight size={17} /></Link>)}</div></div>}
      </div>
    </section>
  );
}
