import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, MapPin, Radio, Zap } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import type { ReactNode } from "react";
import "./pulse-home.css";

function pulseDate() {
  return new Intl.DateTimeFormat("hu-HU", { weekday: "short", day: "2-digit", month: "short" }).format(new Date()).replaceAll(".", "");
}

export function PulseHero({ viewSwitch }: { viewSwitch: ReactNode }) {
  const { data, isLoading, isError, refetch } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events.find((event) => event.featured && event.imageUrl) ?? events.find((event) => event.imageUrl) ?? events[0];
  const queue = events.filter((event) => event.id !== lead?.id).slice(0, 4);
  const categoryCount = new Set(events.map((event) => event.category?.name).filter(Boolean)).size;

  return (
    <section className="pulse-hero" aria-label="HelloCsík Pulzus városi programradar">
      <div className="pulse-grid-lines" />
      <div className="pulse-glow pulse-glow-pink" />
      <div className="pulse-glow pulse-glow-lime" />
      <div className="pulse-shell">
        <header className="pulse-topline">
          <div className="pulse-identity"><span className="pulse-logo"><span className="pulse-live-dot" /> HELLOCSÍK / PULZUS</span><span className="pulse-city">CSÍKSZEREDA · {pulseDate()}</span></div>
          <div className="pulse-view-row"><span>nézet</span>{viewSwitch}</div>
        </header>

        <div className="pulse-main-grid">
          <div className="pulse-copy">
            <div className="pulse-index"><span>01</span><i /> CITY SIGNAL</div>
            <h1>Mi mozgatja<br /><em>a várost?</em></h1>
            <p className="pulse-lead">Egy helyen minden, ami ma este történik. Válassz egy programot, és kapcsold be a Csík-pulzust.</p>
            <div className="pulse-actions">
              <a href="#kozelgo" className="pulse-primary">Induljon a felfedezés <ArrowRight size={18} /></a>
              <Link href="/naptar" className="pulse-secondary"><CalendarDays size={17} /> Naptár</Link>
            </div>
            <div className="pulse-metrics">
              <div><strong>{events.length || "—"}</strong><span>közelgő jel</span></div>
              <div><strong>{categoryCount || "—"}</strong><span>hangulat</span></div>
              <div><strong>24/7</strong><span>városi radar</span></div>
            </div>
          </div>

          <div className="pulse-radar">
            <div className="pulse-radar-ring pulse-radar-ring-a" />
            <div className="pulse-radar-ring pulse-radar-ring-b" />
            <span className="pulse-radar-label"><Radio size={13} /> LIVE BOARD</span>
            {lead ? (
              <Link href={`/esemeny/${lead.id}`} className="pulse-feature">
                <img src={lead.imageUrl || `${import.meta.env.BASE_URL}reference/city-center.jpg`} alt={lead.title} fetchPriority="high" />
                <div className="pulse-feature-shade" />
                <div className="pulse-feature-top"><span>{lead.category?.name ?? "MAI JEL"}</span><span>{formatShortDate(lead.startDate)}</span></div>
                <div className="pulse-feature-copy"><p><Zap size={13} /> KIEMELT PROGRAM</p><h2>{lead.title}</h2><span><MapPin size={14} /> {lead.location}</span></div>
                <span className="pulse-feature-arrow"><ArrowUpRight size={21} /></span>
              </Link>
            ) : (
              <div className="pulse-feature pulse-empty"><Radio size={34} /><h2>{isLoading ? "Hangoljuk a radart…" : "Hamarosan új jel érkezik."}</h2>{isError && <button onClick={() => refetch()}>Újrapróbálom</button>}</div>
            )}
            {lead && <FavoriteButton eventId={lead.id} className="pulse-feature-favorite" />}
            <span className="pulse-radar-coord">46°21' N<br />25°48' E</span>
          </div>
        </div>

        {queue.length > 0 && <div className="pulse-queue">
          <div className="pulse-queue-heading"><span className="pulse-queue-live"><i /> KÖVETKEZŐ JELEK</span><span>Csúsztasd végig a városon →</span></div>
          <div className="pulse-queue-grid">
            {queue.map((event, index) => <div className="pulse-queue-item" key={event.id}>
              <Link href={`/esemeny/${event.id}`} className="pulse-queue-link">
                <span className="pulse-queue-number">0{index + 2}</span>
                <div className="pulse-queue-image"><img src={event.imageUrl || `${import.meta.env.BASE_URL}reference/city-center.jpg`} alt="" loading="lazy" /></div>
                <div className="pulse-queue-copy"><span>{formatShortDate(event.startDate)} · {formatTime(event.startDate)}</span><h3>{event.title}</h3><p><Clock3 size={11} /> {event.location}</p></div>
                <ArrowUpRight className="pulse-queue-arrow" size={17} />
              </Link>
              <FavoriteButton eventId={event.id} className="pulse-queue-favorite" />
            </div>)}
          </div>
        </div>}
      </div>
      <div className="pulse-marquee" aria-hidden="true"><span>MA ESTE · CSÍK PULZUSA · KONCERT · MOZI · SZÍNHÁZ · KIÁLLÍTÁS · KÖZÖSSÉG · SPORT · MA ESTE · CSÍK PULZUSA · KONCERT · MOZI · SZÍNHÁZ ·</span></div>
    </section>
  );
}
