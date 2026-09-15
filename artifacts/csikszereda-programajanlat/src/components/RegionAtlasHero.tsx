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

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("hu-HU");
}

export function RegionAtlasHero({ viewSwitch }: { viewSwitch: ReactNode }) {
  const { data, isLoading, isError, refetch } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events.find(event => event.featured && event.imageUrl) ?? events.find(event => event.imageUrl) ?? events[0];
  const next = events.filter(event => event.id !== lead?.id).slice(0, 4);
  const cityCount = (city: typeof CITIES[number]) => events.filter(event => city.keys.some(key => normalized(`${event.title} ${event.location} ${event.locationAddress ?? ""} ${event.description ?? ""}`).includes(normalized(key)))).length;

  return (
    <section className="region-atlas" aria-label="Székelyföldi események">
      <div className="region-atlas-shell">
        <header className="atlas-topbar">
          <div className="atlas-brand"><span className="atlas-brand-dot" /> HELLOCSÍK <b>/ ESEMÉNYEK</b></div>
          <div className="atlas-top-actions"><span>CSÍKSZEREDA · SZÉKELYUDVARHELY · GYERGYÓ · SEPSISZENTGYÖRGY · MAROSVÁSÁRHELY</span>{viewSwitch}</div>
        </header>

        <div className="atlas-hero-grid">
          <div className="atlas-intro">
            <span className="atlas-kicker"><Search size={14} /> ESEMÉNYEK VÁROSOK SZERINT</span>
            <h1>Programok<br /><em>Székelyföldön.</em></h1>
            <p>Koncertek, előadások, kiállítások és közösségi programok a környék városaiból.</p>
            <div className="atlas-actions">
              <a href="#kozelgo" className="atlas-primary">Programok listája <ArrowRight size={17} /></a>
              <Link href="/naptar" className="atlas-secondary"><CalendarDays size={17} /> Naptár</Link>
            </div>
            <div className="atlas-city-rail" aria-label="Városok szerinti programok">
              {CITIES.slice(0, 4).map(city => <div className="atlas-city-pill" key={city.name}><strong>{cityCount(city)}</strong><span>{city.name}</span></div>)}
            </div>
          </div>

          <div className="atlas-city-panel" aria-label="Városi programok">
            <div className="atlas-panel-heading"><span>VÁROSOK</span><small>{events.length} közelgő program</small></div>
            <div className="atlas-city-list">
              {CITIES.map(city => <div className="atlas-city-row" key={city.name}><span className="atlas-city-mark" /><b>{city.name}</b><span className="atlas-city-count">{cityCount(city)}</span></div>)}
            </div>
            <div className="atlas-panel-footer"><MapPin size={14} /> Székelyföld</div>
          </div>
        </div>

        <div className="atlas-feature-row">
          <div className="atlas-feature-label"><span>KIEMELT ESEMÉNY</span><p>Részletek és időpont</p></div>
          {lead ? <Link href={`/esemeny/${lead.id}`} className="atlas-feature-card">
            <img src={lead.imageUrl} alt="" />
            <div className="atlas-feature-overlay" />
            <div className="atlas-feature-copy"><span>{lead.category?.name ?? "Program"} · {formatShortDate(lead.startDate)}</span><h2>{lead.title}</h2><p><MapPin size={14} /> {lead.location} <b>·</b> {formatTime(lead.startDate)}</p></div><ArrowRight className="atlas-feature-arrow" size={22} />
          </Link> : <div className="atlas-feature-card atlas-feature-empty"><div><span>PROGRAMOK</span><h2>{isLoading ? "Események betöltése…" : "Nincs közelgő esemény."}</h2>{isError && <button onClick={() => refetch()}>Újrapróbálom</button>}</div></div>}
        </div>

        {next.length > 0 && <div className="atlas-next"><div className="atlas-next-title"><span>KÖVETKEZŐ PROGRAMOK</span><p>Időpont és helyszín</p></div><div className="atlas-next-list">{next.map((event, index) => <Link href={`/esemeny/${event.id}`} className="atlas-next-card" key={event.id}><span className="atlas-next-index">0{index + 1}</span><div><small>{formatShortDate(event.startDate)} · {formatTime(event.startDate)}</small><h3>{event.title}</h3><p><MapPin size={12} /> {event.location}</p></div><ArrowRight size={17} /></Link>)}</div></div>}
      </div>
    </section>
  );
}
