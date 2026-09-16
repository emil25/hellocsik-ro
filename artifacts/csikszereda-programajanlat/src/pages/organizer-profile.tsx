import { useMemo } from "react";
import { ArrowLeft, ArrowUpRight, CalendarDays, ExternalLink, MapPin, Plus, Users } from "lucide-react";
import { Link, useParams } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { formatShortDate } from "@/utils/date-format";
import { getOrganizer } from "@/data/organizers";
import { OrganizerEventCard } from "@/pages/organizers";
import "@/components/organizer-portal.css";

export default function OrganizerProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const organizer = getOrganizer(slug);
  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const events = useMemo(() => {
    if (!organizer) return [];
    const matches = organizer.matches.map((item) => item.toLocaleLowerCase("hu-HU"));
    return (data?.events ?? []).filter((event) => `${event.title} ${event.location}`.toLocaleLowerCase("hu-HU") && matches.some((match) => `${event.title} ${event.location}`.toLocaleLowerCase("hu-HU").includes(match)));
  }, [data?.events, organizer]);

  if (!organizer) {
    return <div className="organizer-not-found"><Users size={28} /><h1>Szervező nem található</h1><p>Ez a profil már nem elérhető.</p><Link href="/szervezok">Vissza a szervezőkhöz</Link></div>;
  }

  return (
    <div className="organizer-profile-page">
      <section className="organizer-profile-hero">
        <Link href="/szervezok" className="organizer-back-link"><ArrowLeft size={15} /> Szervezők</Link>
        <div className="organizer-profile-identity"><div className="organizer-profile-avatar" style={{ background: organizer.accent }}>{organizer.initials}</div><div><span className="organizer-kicker"><Users size={14} /> SZERVEZŐI PROFIL</span><h1>{organizer.name}</h1><p><MapPin size={15} /> {organizer.city}</p></div></div>
        <p className="organizer-profile-description">{organizer.description}</p>
        <div className="organizer-profile-actions">
          {organizer.website && <a href={organizer.website} target="_blank" rel="noopener noreferrer" className="organizer-secondary-button">Weboldal <ExternalLink size={14} /></a>}
          <Link href={`/bekuldese?organizer=${organizer.slug}`} className="organizer-primary-button"><Plus size={16} /> Esemény beküldése</Link>
        </div>
        <div className="organizer-profile-tags">{organizer.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </section>

      <main className="organizer-profile-main">
        <div className="organizer-section-heading"><div><span>AKTUÁLIS PROGRAMOK</span><h2>{organizer.name} eseményei</h2></div><p>{isLoading ? "Betöltés…" : `${events.length} közelgő program`}</p></div>
        {events.length > 0 ? <div className="organizer-event-grid">{events.map((event) => <OrganizerEventCard key={event.id} event={event} />)}</div> : <div className="organizer-empty"><CalendarDays size={25} /><h3>{isLoading ? "Programok betöltése…" : "Még nincs közelgő program"}</h3><p>Az új események itt jelennek meg, amint közzétesszük őket.</p><Link href={`/bekuldese?organizer=${organizer.slug}`} className="organizer-primary-button"><Plus size={15} /> Program beküldése</Link></div>}
        <section className="organizer-profile-footer"><div><span>EGYÜTTMŰKÖDÉS</span><h2>Szervezőként te is itt lehetsz.</h2><p>Mutasd meg a programjaidat saját profillal, és kezeld őket egy helyen.</p></div><Link href="/szervezoi-felulet" className="organizer-secondary-button">Szervezői felület <ArrowUpRight size={15} /></Link></section>
      </main>
    </div>
  );
}

