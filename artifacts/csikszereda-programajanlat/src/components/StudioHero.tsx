import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import type { ReactNode } from "react";
import "./studio-home.css";

function editionDate() {
  return new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).replaceAll(".", "");
}

export function StudioHero({ viewSwitch }: { viewSwitch: ReactNode }) {
  const { data, isLoading, isError, refetch } = useListUpcomingEvents({ limit: 100 });
  const events = data?.events ?? [];
  const lead = events.find((event) => event.featured && event.imageUrl) ?? events.find((event) => event.imageUrl) ?? events[0];
  const rows = events.filter((event) => event.id !== lead?.id).slice(0, 5);

  return (
    <section className="studio-hero" aria-label="HelloCsík Studio szerkesztett programajánló">
      <div className="studio-shell">
        <header className="studio-header">
          <div className="studio-wordmark"><span>HELLOCSÍK</span><small>STUDIO / CITY AGENDA</small></div>
          <div className="studio-header-meta"><span>EDITION {editionDate()}</span><div className="studio-view-row"><span>nézet</span>{viewSwitch}</div></div>
        </header>

        <div className="studio-lead-grid">
          <div className="studio-lead-copy">
            <span className="studio-kicker">CSÍKSZEREDA / PROGRAMIRODA</span>
            <h1>Programok,<br /><em>jókor.</em></h1>
            <p>Áttekinthető városi agenda azoknak, akik szeretik előre tudni, mi történik és hol.</p>
            <div className="studio-actions"><a href="#kozelgo" className="studio-primary">Agenda megnyitása <ArrowRight size={17} /></a><Link href="/naptar" className="studio-secondary"><CalendarDays size={17} /> Havi naptár</Link></div>
            <div className="studio-rule"><span>FRISSÍTVE</span><strong>MA · 09:40</strong><span>PROGRAMOK</span><strong>{events.length || "—"}</strong></div>
          </div>

          {lead ? (
            <div className="studio-feature-wrap">
              <div className="studio-feature-label"><span>KIEMELT / 01</span><span>{formatShortDate(lead.startDate)}</span></div>
              <Link href={`/esemeny/${lead.id}`} className="studio-feature">
                <div className="studio-feature-image"><img src={lead.imageUrl || `${import.meta.env.BASE_URL}reference/city-center.jpg`} alt={lead.title} fetchPriority="high" /><span className="studio-feature-index">01</span></div>
                <div className="studio-feature-info"><span className="studio-category">{lead.category?.name ?? "PROGRAM"}</span><h2>{lead.title}</h2><p><Clock3 size={14} /> {formatShortDate(lead.startDate)} · {formatTime(lead.startDate)}</p><p><MapPin size={14} /> {lead.location}</p><span className="studio-open">Részletek <ArrowUpRight size={16} /></span></div>
              </Link>
              <FavoriteButton eventId={lead.id} className="studio-favorite" />
            </div>
          ) : (
            <div className="studio-empty"><h2>{isLoading ? "Programok betöltése…" : "Még nincs kiemelt program."}</h2>{isError && <button onClick={() => refetch()}>Újrapróbálom</button>}</div>
          )}
        </div>

        <div className="studio-agenda-head"><div><span>FOLYTATÁS</span><h2>A következő napok</h2></div><a href="#kozelgo">Teljes programlista <ArrowRight size={15} /></a></div>
        <div className="studio-agenda" role="list">
          {rows.map((event, index) => <div className="studio-row" role="listitem" key={event.id}>
            <span className="studio-row-number">{String(index + 2).padStart(2, "0")}</span>
            <span className="studio-row-date">{formatShortDate(event.startDate)}<b>{formatTime(event.startDate)}</b></span>
            <Link href={`/esemeny/${event.id}`} className="studio-row-title">{event.title}</Link>
            <span className="studio-row-place"><MapPin size={13} /> {event.location}</span>
            <Link href={`/esemeny/${event.id}`} className="studio-row-arrow" aria-label={`${event.title} részletei`}><ArrowUpRight size={17} /></Link>
            <FavoriteButton eventId={event.id} className="studio-row-favorite" />
          </div>)}
        </div>
      </div>
      <div className="studio-footer-line"><span>HELLOCSÍK / HELYI PROGRAMOK, KÖZÖS ÉLMÉNYEK.</span><span>CSÍKSZEREDA · {editionDate()}</span></div>
    </section>
  );
}
