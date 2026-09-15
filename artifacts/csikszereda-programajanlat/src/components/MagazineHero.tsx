import { ArrowRight, ArrowUpRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate } from "@/utils/date-format";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import "./magazine-home.css";

function issueLabel() {
  return new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long" })
    .format(new Date())
    .toUpperCase();
}

export function MagazineHero() {
  const { data, isLoading, isError, refetch } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events.find((event) => event.featured) ?? events[0];
  const next = events.filter((event) => event.id !== lead?.id).slice(0, 3);

  return (
    <section className="editorial-hero" aria-label="HelloCsík programmagazin">
      <div className="editorial-glow editorial-glow-one" />
      <div className="editorial-glow editorial-glow-two" />

      <div className="editorial-shell">
        <header className="editorial-topline">
          <span className="editorial-brand"><Sparkles size={14} /> HELLOCSÍK VÁROSI MAGAZIN</span>
          <span>{issueLabel()} · CSÍKSZEREDA</span>
        </header>

        <div className="editorial-main">
          <div className="editorial-intro">
            <span className="editorial-kicker">A VÁROS MOST</span>
            <h1>Menjünk<br /><em>valahová.</em></h1>
            <p>Koncertek, előadások, filmek és találkozások. Egy helyen mindaz, amiért ma érdemes kimozdulni.</p>
            <div className="editorial-actions">
              <a href="#kozelgo" className="editorial-primary">Programot keresek <ArrowRight size={18} /></a>
              <Link href="/naptar" className="editorial-secondary"><CalendarDays size={17} /> Teljes naptár</Link>
            </div>
            <div className="editorial-facts">
              <div><strong>{events.length}</strong><span>közelgő program</span></div>
              <div><strong>{new Set(events.map((event) => event.location)).size}</strong><span>helyszín</span></div>
            </div>
          </div>

          {lead ? (
            <div className="editorial-cover-wrap">
              <Link href={`/esemeny/${lead.id}`} className="editorial-cover">
                <img src={lead.imageUrl} alt={lead.title} fetchPriority="high" />
                <div className="editorial-cover-shade" />
                <span className="editorial-cover-badge">{lead.featured ? "A HÉT PROGRAMJA" : "KIEMELT AJÁNLAT"}</span>
                <div className="editorial-cover-copy">
                  <span className="editorial-cover-meta">{lead.category?.name ?? "Program"} · {formatShortDate(lead.startDate)}</span>
                  <h2>{lead.title}</h2>
                  <p><MapPin size={15} /> {lead.location}</p>
                </div>
                <span className="editorial-cover-open"><ArrowUpRight size={23} /></span>
              </Link>
              <FavoriteButton eventId={lead.id} className="editorial-favorite" />
            </div>
          ) : (
            <div className="editorial-cover editorial-empty">
              <CalendarDays size={34} />
              <h2>{isLoading ? "Betöltjük a programokat…" : "Most nincs kiemelt program."}</h2>
              {isError && <button className="editorial-primary" onClick={() => refetch()}>Újrapróbálom</button>}
            </div>
          )}
        </div>

        {next.length > 0 && (
          <div className="editorial-next">
            <div className="editorial-next-title">
              <span>KÖVETKEZIK</span>
              <small>Szerkesztőségi válogatás</small>
            </div>
            <div className="editorial-next-grid">
              {next.map((event, index) => (
                <div className="editorial-card-wrap" key={event.id}>
                  <Link href={`/esemeny/${event.id}`} className="editorial-card">
                    <span className="editorial-card-index">0{index + 1}</span>
                    <img src={event.imageUrl} alt="" loading="lazy" />
                    <div>
                      <span className="editorial-card-date">{formatShortDate(event.startDate)}</span>
                      <h3>{event.title}</h3>
                      <p>{event.location}</p>
                    </div>
                    <ArrowUpRight className="editorial-card-arrow" size={18} />
                  </Link>
                  <FavoriteButton eventId={event.id} className="editorial-card-favorite" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
