import { useMemo } from "react";
import { ArrowRight, CalendarDays, Check, Plus, Sparkles, Users } from "lucide-react";
import { Link } from "wouter";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { ORGANIZERS, organizerForEvent, type Organizer } from "@/data/organizers";
import "@/components/organizer-portal.css";
import { usePortalEvents } from "@/lib/regional-events";

export function OrganizerEventCard({ event }: { event: any }) {
  const organizer = organizerForEvent(event);
  return (
    <Link href={`/esemeny/${event.id}`} className="organizer-event-card">
      <div className="organizer-event-image" style={{ backgroundImage: event.imageUrl ? `url("${event.imageUrl}"), url("${import.meta.env.BASE_URL}reference/city-center.jpg")` : `url("${import.meta.env.BASE_URL}reference/city-center.jpg")` }}>
        <span>{event.category?.name ?? "Program"}</span>
      </div>
      <div className="organizer-event-content">
        <p className="organizer-event-date"><CalendarDays size={13} /> {formatShortDate(event.startDate)} · {formatTime(event.startDate)}</p>
        <h3>{event.title}</h3>
        <p className="organizer-event-place">{event.location}</p>
        {organizer && <small>{organizer.name}</small>}
      </div>
    </Link>
  );
}

function OrganizerCard({ organizer, eventCount }: { organizer: Organizer; eventCount: number }) {
  return (
    <Link href={`/szervezo/${organizer.slug}`} className="organizer-directory-card">
      <div className="organizer-card-top">
        <div className="organizer-avatar" style={{ background: organizer.accent }}>{organizer.initials}</div>
        <ArrowRight className="organizer-card-arrow" size={19} />
      </div>
      <p className="organizer-card-city">{organizer.city}</p>
      <h2>{organizer.name}</h2>
      <p className="organizer-card-description">{organizer.description}</p>
      <div className="organizer-card-bottom"><span>{eventCount} közelgő program</span><span>{organizer.tags.slice(0, 2).join(" · ")}</span></div>
    </Link>
  );
}

export default function OrganizersPage() {
  const { data: events = [], isLoading } = usePortalEvents();
  const { directory, counts } = useMemo(() => {
    const map = new Map<string, number>();
    const directory = new Map(ORGANIZERS.map(organizer => [organizer.slug, organizer]));
    for (const event of events) {
      const registered = event.organizer;
      const organizer = registered ?? organizerForEvent(event);
      if (organizer) map.set(organizer.slug, (map.get(organizer.slug) ?? 0) + 1);
      if (registered && !directory.has(registered.slug)) directory.set(registered.slug, {
        slug: registered.slug, name: registered.name, city: registered.city ?? "Székelyföld",
        description: "A szervező aktuális eseményei és programjai.", website: registered.website ?? undefined,
        initials: registered.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
        accent: "#df523e", tags: ["szervező"], matches: [],
      });
    }
    return { directory: [...directory.values()], counts: map };
  }, [events]);

  return (
    <div className="organizer-page">
      <header className="organizer-page-header">
        <div className="organizer-kicker"><Users size={15} /> SZERVEZŐK</div>
        <h1>Akik megtöltik<br /><em>programmal</em> a városokat.</h1>
        <p>Ismerd meg a helyi szervezőket, és nézd meg egy helyen az összes eseményüket.</p>
        <div className="organizer-header-actions">
          <Link href="/szervezoi-felulet" className="organizer-primary-button"><Plus size={16} /> Szervezői felület</Link>
          <Link href="/arak" className="organizer-secondary-button">Árak és csomagok <ArrowRight size={15} /></Link>
        </div>
      </header>

      <div className="organizer-page-main">
        <div className="organizer-section-heading"><div><span>HELYI PARTNEREK</span><h2>Szervezők a programok mögött</h2></div><p>{isLoading ? "Betöltés…" : `${directory.length} szervezői profil`}</p></div>
        <div className="organizer-directory-grid">
          {directory.map((organizer) => <OrganizerCard key={organizer.slug} organizer={organizer} eventCount={counts.get(organizer.slug) ?? 0} />)}
        </div>

        <section className="organizer-join-card">
          <div className="organizer-join-icon"><Sparkles size={21} /></div>
          <div><span className="organizer-join-label">SZERVEZŐI PROFIL</span><h2>Több eseményt szervezel?</h2><p>Hozz létre egy profilt, tölts fel több programot, és legyen minden eseményed egy helyen.</p></div>
          <Link href="/szervezoi-felulet" className="organizer-primary-button">Profil indítása <ArrowRight size={16} /></Link>
        </section>
      </div>
    </div>
  );
}

