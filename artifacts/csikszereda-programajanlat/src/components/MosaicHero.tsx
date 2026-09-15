import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import "./mosaic-home.css";

const now = () => new Date();

function dayNumber() {
  return new Intl.DateTimeFormat("hu-HU", { day: "2-digit" }).format(now());
}

function monthAndDay() {
  return new Intl.DateTimeFormat("hu-HU", { month: "long", weekday: "long" }).format(now());
}

export function MosaicHero() {
  const { data, isLoading, isError, refetch } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events.find((event) => event.featured && event.imageUrl) ?? events.find((event) => event.imageUrl) ?? events[0];
  const picks = events.filter((event) => event.id !== lead?.id).slice(0, 3);
  const categoryCount = new Set(events.map((event) => event.categoryId).filter(Boolean)).size;

  return (
    <section className="mosaic-hero" aria-label="HelloCsík városi programtérkép">
      <div className="mosaic-shell">
        <div className="mosaic-kicker">
          <span><i /> HELLOCSÍK · VÁROSI NAPIRÉSZ</span>
          <span>{events.length} KÖZELGŐ ESEMÉNY</span>
        </div>

        <div className="mosaic-grid">
          <div className="mosaic-intro">
            <div className="mosaic-date" aria-label={`${dayNumber()}. ${monthAndDay()}`}>
              <strong>{dayNumber()}</strong>
              <span>{monthAndDay()}</span>
            </div>
            <h1>Mit csinálunk<br /><em>ma?</em></h1>
            <p>Csíkszereda programjai egyetlen, gyorsan átlátható városi napirendben.</p>
            <div className="mosaic-actions">
              <a href="#kozelgo">Programok <ArrowRight size={18} /></a>
              <Link href="/naptar"><CalendarDays size={18} /> Havi naptár</Link>
            </div>
            <div className="mosaic-stats">
              <span><b>{events.length}</b> program</span>
              <span><b>{categoryCount}</b> kategória</span>
            </div>
          </div>

          {lead ? (
            <div className="mosaic-lead-wrap">
              <Link href={`/esemeny/${lead.id}`} className="mosaic-lead">
                <img src={lead.imageUrl || `${import.meta.env.BASE_URL}reference/city-center.jpg`} alt={lead.title} fetchPriority="high" />
                <div className="mosaic-lead-overlay" />
                <span className="mosaic-index">01</span>
                <span className="mosaic-category">{lead.category?.name ?? "Kiemelt"}</span>
                <div className="mosaic-lead-copy">
                  <p>{formatShortDate(lead.startDate)} · {formatTime(lead.startDate)}</p>
                  <h2>{lead.title}</h2>
                  <span><MapPin size={14} /> {lead.location}</span>
                </div>
                <span className="mosaic-open"><ArrowUpRight size={22} /></span>
              </Link>
              <FavoriteButton eventId={lead.id} className="mosaic-favorite" />
            </div>
          ) : (
            <div className="mosaic-lead mosaic-empty">
              <CalendarDays size={35} />
              <h2>{isLoading ? "Érkeznek a programok…" : "Hamarosan új programok érkeznek."}</h2>
              {isError && <button onClick={() => refetch()}>Újrapróbálom</button>}
            </div>
          )}

          <div className="mosaic-picks">
            <div className="mosaic-picks-heading">
              <span>KÖVETKEZIK</span>
              <i />
            </div>
            {picks.map((event, index) => (
              <div className="mosaic-pick-wrap" key={event.id}>
                <Link href={`/esemeny/${event.id}`} className="mosaic-pick">
                  <span className="mosaic-pick-number">0{index + 2}</span>
                  <img src={event.imageUrl || `${import.meta.env.BASE_URL}reference/city-center.jpg`} alt="" loading="lazy" />
                  <div>
                    <p>{formatShortDate(event.startDate)}</p>
                    <h3>{event.title}</h3>
                    <span><Clock3 size={12} /> {formatTime(event.startDate)}</span>
                  </div>
                  <ArrowUpRight size={17} />
                </Link>
                <FavoriteButton eventId={event.id} className="mosaic-pick-favorite" />
              </div>
            ))}
          </div>
        </div>

        <div className="mosaic-bottomline">
          <span>MA · HOLNAP · HÉTVÉGE</span>
          <a href="#kozelgo">Minden program egy helyen <ArrowRight size={15} /></a>
        </div>
      </div>
    </section>
  );
}
