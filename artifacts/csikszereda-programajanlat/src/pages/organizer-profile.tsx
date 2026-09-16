import { useEffect, useMemo, useState } from "react";
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
  const [remoteData, setRemoteData] = useState<{ organizer: { slug: string; name: string; bio: string; city: string; website?: string | null }; events: any[] } | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(!organizer);
  useEffect(() => {
    if (organizer || !slug) return;
    let active = true;
    fetch(`/api/organizers/${encodeURIComponent(slug)}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("not-found")))
      .then((value) => { if (active) setRemoteData(value); })
      .catch(() => { if (active) setRemoteData(null); })
      .finally(() => { if (active) setRemoteLoading(false); });
    return () => { active = false; };
  }, [organizer, slug]);
  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const activeOrganizer = organizer ?? (remoteData ? {
    ...remoteData.organizer,
    description: remoteData.organizer.bio,
    initials: remoteData.organizer.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    accent: "#39714d",
    tags: ["programok", "Székelyföld"],
    matches: [],
  } : undefined);
  const events = useMemo(() => {
    if (!activeOrganizer) return [];
    if (!organizer && remoteData) return remoteData.events;
    if (!organizer) return [];
    const matches = organizer.matches.map((item) => item.toLocaleLowerCase("hu-HU"));
    return (data?.events ?? []).filter((event) => `${event.title} ${event.location}`.toLocaleLowerCase("hu-HU") && matches.some((match) => `${event.title} ${event.location}`.toLocaleLowerCase("hu-HU").includes(match)));
  }, [data?.events, organizer, activeOrganizer, remoteData]);

  if (!activeOrganizer && remoteLoading) {
    return <div className="organizer-not-found"><Users size={28} /><h1>Profil betöltése…</h1><p>Egy pillanat, betöltjük a szervezői adatokat.</p></div>;
  }
  if (!activeOrganizer) {
    return <div className="organizer-not-found"><Users size={28} /><h1>Szervező nem található</h1><p>Ez a profil már nem elérhető.</p><Link href="/szervezok">Vissza a szervezőkhöz</Link></div>;
  }

  return (
    <div className="organizer-profile-page">
      <section className="organizer-profile-hero">
        <Link href="/szervezok" className="organizer-back-link"><ArrowLeft size={15} /> Szervezők</Link>
        <div className="organizer-profile-identity"><div className="organizer-profile-avatar" style={{ background: activeOrganizer.accent }}>{activeOrganizer.initials}</div><div><span className="organizer-kicker"><Users size={14} /> SZERVEZŐI PROFIL</span><h1>{activeOrganizer.name}</h1><p><MapPin size={15} /> {activeOrganizer.city}</p></div></div>
        <p className="organizer-profile-description">{activeOrganizer.description}</p>
        <div className="organizer-profile-actions">
          {activeOrganizer.website && <a href={activeOrganizer.website} target="_blank" rel="noopener noreferrer" className="organizer-secondary-button">Weboldal <ExternalLink size={14} /></a>}
          <Link href={`/bekuldese?organizer=${activeOrganizer.slug}`} className="organizer-primary-button"><Plus size={16} /> Esemény beküldése</Link>
        </div>
        <div className="organizer-profile-tags">{activeOrganizer.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </section>

      <main className="organizer-profile-main">
        <div className="organizer-section-heading"><div><span>AKTUÁLIS PROGRAMOK</span><h2>{activeOrganizer.name} eseményei</h2></div><p>{isLoading && !remoteData ? "Betöltés…" : `${events.length} közelgő program`}</p></div>
        {events.length > 0 ? <div className="organizer-event-grid">{events.map((event) => <OrganizerEventCard key={event.id} event={event} />)}</div> : <div className="organizer-empty"><CalendarDays size={25} /><h3>{isLoading && !remoteData ? "Programok betöltése…" : "Még nincs közelgő program"}</h3><p>Az új események itt jelennek meg, amint közzétesszük őket.</p><Link href={`/bekuldese?organizer=${activeOrganizer.slug}`} className="organizer-primary-button"><Plus size={15} /> Program beküldése</Link></div>}
        <section className="organizer-profile-footer"><div><span>EGYÜTTMŰKÖDÉS</span><h2>Szervezőként te is itt lehetsz.</h2><p>Mutasd meg a programjaidat saját profillal, és kezeld őket egy helyen.</p></div><Link href="/szervezoi-felulet" className="organizer-secondary-button">Szervezői felület <ArrowUpRight size={15} /></Link></section>
      </main>
    </div>
  );
}
