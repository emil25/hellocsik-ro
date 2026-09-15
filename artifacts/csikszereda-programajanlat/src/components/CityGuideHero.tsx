import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, Compass, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import type { ReactNode } from "react";
import "./city-guide-home.css";

function issueLabel() {
  return new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(new Date());
}

export function CityGuideHero({ viewSwitch }: { viewSwitch: ReactNode }) {
  const { data, isLoading, isError, refetch } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events.find((event) => event.featured && event.imageUrl) ?? events.find((event) => event.imageUrl) ?? events[0];
  const next = events.filter((event) => event.id !== lead?.id).slice(0, 3);
  const categories = Array.from(new Set(events.map((event) => event.category?.name).filter(Boolean))).slice(0, 4);

  return (
    <section className="city-guide" aria-label="HelloCsík székelyföldi programkalauz">
      <div className="city-guide-shell">
        <header className="city-guide-mast">
          <span className="city-guide-mark"><Compass size={17} /> HELLOCSÍK · SZÉKELYFÖLD FELFEDEZŐ</span>
          <div className="city-guide-mast-right">
            <span className="city-guide-today">{issueLabel()} · Székelyföld</span>
            <div className="city-guide-view-row"><span>Főoldal nézete</span>{viewSwitch}</div>
          </div>
        </header>

        <div className="city-guide-layout">
          <div className="city-guide-intro">
            <span className="city-guide-kicker"><i /> MA IS TÖRTÉNIK VALAMI</span>
            <h1>Kapcsolódj ki.<br /><em>Itt, Székelyföldön.</em></h1>
            <p>Székelyföld városainak programjai egy friss, gyorsan átlátható listában.</p>
            <div className="city-guide-actions">
              <a href="#kozelgo" className="city-guide-primary">Mutasd a programokat <ArrowRight size={18} /></a>
              <Link href="/naptar" className="city-guide-calendar"><CalendarDays size={18} /> Naptár</Link>
            </div>
            {categories.length > 0 && <div className="city-guide-categories" aria-label="Népszerű kategóriák">
              {categories.map((category) => <a key={category} href="#kozelgo">{category}</a>)}
            </div>}
            <div className="city-guide-stats">
              <div><strong>{events.length}</strong><span>közelgő program</span></div>
              <div><strong>{new Set(events.map((event) => event.location)).size}</strong><span>helyszín</span></div>
            </div>
          </div>

          {lead ? (
            <div className="city-guide-feature-wrap">
              <span className="city-guide-sticker">EZT NÉZD!</span>
              <Link href={`/esemeny/${lead.id}`} className="city-guide-feature">
                <img src={lead.imageUrl || `${import.meta.env.BASE_URL}reference/city-center.jpg`} alt={lead.title} fetchPriority="high" />
                <div className="city-guide-feature-shade" />
                <div className="city-guide-date-block">
                  <strong>{new Intl.DateTimeFormat("hu-HU", { day: "2-digit" }).format(new Date(lead.startDate))}</strong>
                  <span>{new Intl.DateTimeFormat("hu-HU", { month: "short" }).format(new Date(lead.startDate)).replace(".", "")}</span>
                </div>
                <div className="city-guide-feature-copy">
                  <span>{lead.category?.name ?? "Programajánló"}</span>
                  <h2>{lead.title}</h2>
                  <p><MapPin size={15} /> {lead.location}</p>
                  <p><Clock3 size={15} /> {formatShortDate(lead.startDate)} · {formatTime(lead.startDate)}</p>
                </div>
                <span className="city-guide-open"><ArrowUpRight size={22} /></span>
              </Link>
              <FavoriteButton eventId={lead.id} className="city-guide-favorite" />
            </div>
          ) : (
            <div className="city-guide-feature city-guide-empty">
              <img src={`${import.meta.env.BASE_URL}reference/city-center.jpg`} alt="Csíkszereda belvárosa" />
              <div className="city-guide-feature-shade" />
              <div className="city-guide-feature-copy">
                <span>HELLO, SZÉKELYFÖLD!</span>
                <h2>{isLoading ? "Keressük a következő programot…" : "Hamarosan új programok érkeznek."}</h2>
                {isError && <button className="city-guide-primary" onClick={() => refetch()}>Újrapróbálom</button>}
              </div>
            </div>
          )}
        </div>

        {next.length > 0 && <div className="city-guide-next">
          <div className="city-guide-next-heading"><span>NE MARADJ LE</span><p>A következő napok válogatása</p></div>
          <div className="city-guide-next-grid">
            {next.map((event, index) => <div className="city-guide-card-wrap" key={event.id}>
              <Link href={`/esemeny/${event.id}`} className="city-guide-card">
                <span className="city-guide-card-no">0{index + 1}</span>
                <div className="city-guide-card-image"><img src={event.imageUrl || `${import.meta.env.BASE_URL}reference/city-center.jpg`} alt="" loading="lazy" /></div>
                <div className="city-guide-card-copy"><span>{formatShortDate(event.startDate)}</span><h3>{event.title}</h3><p>{event.location}</p></div>
                <ArrowUpRight className="city-guide-card-arrow" size={18} />
              </Link>
              <FavoriteButton eventId={event.id} className="city-guide-card-favorite" />
            </div>)}
          </div>
        </div>}
      </div>
    </section>
  );
}
