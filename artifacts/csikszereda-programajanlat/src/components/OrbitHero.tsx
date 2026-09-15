import { ArrowRight, CalendarDays, Clock3, MapPin, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import type { ReactNode } from "react";
import "./orbit-home.css";

function currentDay() {
  return new Intl.DateTimeFormat("hu-HU", { day: "numeric" }).format(new Date());
}

function currentMonth() {
  return new Intl.DateTimeFormat("hu-HU", { month: "short" }).format(new Date()).replace(".", "");
}

export function OrbitHero({ viewSwitch }: { viewSwitch: ReactNode }) {
  const { data, isLoading, isError, refetch } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const featured = events.find((event) => event.featured && event.imageUrl) ?? events.find((event) => event.imageUrl) ?? events[0];
  const nearby = events.filter((event) => event.id !== featured?.id).slice(0, 2);
  const venueCount = new Set(events.map((event) => event.location)).size;

  return (
    <section className="orbit-hero" aria-label="HelloCsík városi programtervező">
      <div className="orbit-blob orbit-blob-one" />
      <div className="orbit-blob orbit-blob-two" />
      <div className="orbit-shell">
        <div className="orbit-intro">
          <span className="orbit-kicker"><Sparkles size={15} /> PROGRAMOK CSÍKSZEREDÁBAN</span>
          <h1>Találd meg<br />a <em>mai</em><br />élményed.</h1>
          <p>Koncertek, mozi, színház és közösségi programok, egyszerűen válogatva.</p>
          <div className="orbit-actions">
            <a href="#kozelgo">Felfedezem <ArrowRight size={18} /></a>
            <Link href="/naptar"><CalendarDays size={18} /> Naptár</Link>
          </div>
          <div className="orbit-view-row">
            <span>Főoldal nézete</span>
            {viewSwitch}
          </div>
          <div className="orbit-facts">
            <span><b>{events.length}</b> közelgő program</span>
            <span><b>{venueCount}</b> helyszín</span>
          </div>
        </div>

        <div className="orbit-stage">
          <div className="orbit-date-bubble"><strong>{currentDay()}</strong><span>{currentMonth()}</span></div>
          <span className="orbit-city-note">MA CSÍKBAN</span>
          {featured ? (
            <div className="orbit-featured-wrap">
              <Link href={`/esemeny/${featured.id}`} className="orbit-featured">
                <img src={featured.imageUrl || `${import.meta.env.BASE_URL}reference/city-center.jpg`} alt={featured.title} fetchPriority="high" />
                <div className="orbit-featured-shade" />
                <span className="orbit-featured-tag">{featured.category?.name ?? "Ajánló"}</span>
                <div className="orbit-featured-copy">
                  <p>{formatShortDate(featured.startDate)} · {formatTime(featured.startDate)}</p>
                  <h2>{featured.title}</h2>
                  <span><MapPin size={14} /> {featured.location}</span>
                </div>
                <span className="orbit-featured-arrow"><ArrowRight size={20} /></span>
              </Link>
              <FavoriteButton eventId={featured.id} className="orbit-favorite" />
            </div>
          ) : (
            <div className="orbit-featured orbit-empty">
              <CalendarDays size={34} />
              <h2>{isLoading ? "Keressük a programokat…" : "Hamarosan új programok érkeznek."}</h2>
              {isError && <button onClick={() => refetch()}>Újrapróbálom</button>}
            </div>
          )}

          <div className="orbit-nearby">
            {nearby.map((event, index) => (
              <div className={`orbit-mini-wrap orbit-mini-${index + 1}`} key={event.id}>
                <Link href={`/esemeny/${event.id}`} className="orbit-mini">
                  <img src={event.imageUrl || `${import.meta.env.BASE_URL}reference/city-center.jpg`} alt="" loading="lazy" />
                  <div>
                    <span>{formatShortDate(event.startDate)}</span>
                    <h3>{event.title}</h3>
                    <p><Clock3 size={12} /> {formatTime(event.startDate)}</p>
                  </div>
                </Link>
                <FavoriteButton eventId={event.id} className="orbit-mini-favorite" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="orbit-ticker" aria-hidden="true">
        <div>MA ESTE · HÉTVÉGI TERVEK · CSALÁDI PROGRAM · KONCERT · SZÍNHÁZ · MOZI · KIÁLLÍTÁS ·</div>
      </div>
    </section>
  );
}
