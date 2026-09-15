import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, MapPin, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import type { ReactNode } from "react";
import "./spark-home.css";

function todayLabel() {
  return new Intl.DateTimeFormat("hu-HU", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
}

export function SparkHero({ viewSwitch }: { viewSwitch: ReactNode }) {
  const { data, isLoading, isError, refetch } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events.find((event) => event.featured && event.imageUrl) ?? events.find((event) => event.imageUrl) ?? events[0];
  const board = events.filter((event) => event.id !== lead?.id).slice(0, 4);
  const venues = new Set(events.map((event) => event.location)).size;

  return (
    <section className="spark-hero" aria-label="HelloCsík Szikra programajánló">
      <div className="spark-confetti spark-confetti-one" />
      <div className="spark-confetti spark-confetti-two" />
      <div className="spark-shell">
        <header className="spark-mast">
          <div className="spark-brand"><span className="spark-brand-mark"><Sparkles size={15} /></span><span>HELLOCSÍK</span><small>PROGRAMOK · HELYEK · ÉLMÉNYEK</small></div>
          <div className="spark-mast-meta"><span>{todayLabel()} · Csíkszereda</span><div className="spark-view-row"><span>nézet</span>{viewSwitch}</div></div>
        </header>

        <div className="spark-intro-grid">
          <div className="spark-intro">
            <span className="spark-eyebrow">✦ MAI VÁROSI ADAG</span>
            <h1>A város ma<br /><em>neked játszik.</em></h1>
            <p>Programok, amikről jó tudni. Válassz gyorsan, indulj könnyedén, és ne maradj le arról, ami Csíkban történik.</p>
            <div className="spark-actions"><a href="#kozelgo" className="spark-primary">Nézd a programokat <ArrowRight size={18} /></a><Link href="/naptar" className="spark-secondary"><CalendarDays size={17} /> Naptár</Link></div>
            <div className="spark-stats"><span><b>{events.length || "—"}</b> program a radarban</span><span><b>{venues || "—"}</b> helyszín</span></div>
          </div>

          <div className="spark-stage">
            <span className="spark-note spark-note-top">Kiemelt mai tipp</span>
            {lead ? (
              <Link href={`/esemeny/${lead.id}`} className="spark-lead-card">
                <img src={lead.imageUrl || `${import.meta.env.BASE_URL}reference/city-center.jpg`} alt={lead.title} fetchPriority="high" />
                <div className="spark-lead-shade" />
                <span className="spark-date-badge"><b>{new Intl.DateTimeFormat("hu-HU", { day: "2-digit" }).format(new Date(lead.startDate))}</b><small>{new Intl.DateTimeFormat("hu-HU", { month: "short" }).format(new Date(lead.startDate)).replace(".", "")}</small></span>
                <span className="spark-category">{lead.category?.name ?? "Ajánló"}</span>
                <div className="spark-lead-copy"><span>{formatShortDate(lead.startDate)} · {formatTime(lead.startDate)}</span><h2>{lead.title}</h2><p><MapPin size={14} /> {lead.location}</p></div>
                <span className="spark-lead-arrow"><ArrowUpRight size={21} /></span>
              </Link>
            ) : (
              <div className="spark-lead-card spark-empty"><Sparkles size={34} /><h2>{isLoading ? "Keressük a programokat…" : "Hamarosan új program érkezik."}</h2>{isError && <button onClick={() => refetch()}>Újrapróbálom</button>}</div>
            )}
            {lead && <FavoriteButton eventId={lead.id} className="spark-favorite" />}
            <span className="spark-note spark-note-bottom">#csikbanma</span>
          </div>
        </div>

        <div className="spark-board-head"><div><span>PROGRAMTÁBLA</span><h2>Mi legyen ma?</h2></div><a href="#kozelgo">Összes program <ArrowRight size={16} /></a></div>
        {board.length > 0 && <div className="spark-board">
          {board.map((event, index) => <div className={`spark-board-card spark-board-card-${index + 1}`} key={event.id}>
            <Link href={`/esemeny/${event.id}`} className="spark-board-link">
              <div className="spark-board-image"><img src={event.imageUrl || `${import.meta.env.BASE_URL}reference/city-center.jpg`} alt="" loading="lazy" /><span>{String(index + 2).padStart(2, "0")}</span></div>
              <div className="spark-board-copy"><span>{formatShortDate(event.startDate)} · {formatTime(event.startDate)}</span><h3>{event.title}</h3><p><Clock3 size={12} /> {event.location}</p></div>
              <ArrowUpRight className="spark-board-arrow" size={17} />
            </Link>
            <FavoriteButton eventId={event.id} className="spark-board-favorite" />
          </div>)}
        </div>}
      </div>
      <div className="spark-ticker" aria-hidden="true"><span>CSÍK MA · KERESS EGY JÓ PROGRAMOT · TALÁLKOZZUNK A VÁROSBAN · KONCERT · MOZI · KIÁLLÍTÁS · CSALÁDI NAP ·</span></div>
    </section>
  );
}
