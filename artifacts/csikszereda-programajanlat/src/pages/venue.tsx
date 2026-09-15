import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Building2, CalendarDays, MapPin } from "lucide-react";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { EventCard } from "@/components/events/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { eventMatchesVenue, getVenueInfo, VENUE_DIRECTORY } from "@/lib/venues";

export default function VenuePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const events = useMemo(
    () => (data?.events ?? []).filter((event) => eventMatchesVenue(event.location, slug)),
    [data, slug],
  );
  const firstEvent = events[0];
  const venue = VENUE_DIRECTORY.find((item) => item.slug === slug)
    ?? (firstEvent ? getVenueInfo(firstEvent.location) : null);

  if (!isLoading && !venue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <Building2 className="w-10 h-10 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-3">A helyszín nem található</h1>
        <Link href="/#helyszinek" className="inline-flex items-center gap-2 text-primary font-semibold">
          <ArrowLeft className="w-4 h-4" /> Vissza a helyszínekhez
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <section className="relative overflow-hidden border-b border-border bg-[#10251c] text-white">
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 78% 20%, #4ade80 0%, transparent 32%), radial-gradient(circle at 15% 80%, #fbbf24 0%, transparent 28%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <Link href="/#helyszinek" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white mb-8">
            <ArrowLeft className="w-4 h-4" /> Összes helyszín
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300 mb-3">
                <Building2 className="w-4 h-4" /> Helyszínoldal
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">{venue?.name ?? "Helyszín"}</h1>
              {(venue?.address || firstEvent?.locationAddress) && (
                <p className="flex items-center gap-2 text-white/65 mt-4 text-sm">
                  <MapPin className="w-4 h-4" /> {venue?.address ?? firstEvent?.locationAddress}
                </p>
              )}
            </div>
            <div className="inline-flex items-center gap-3 self-start md:self-auto rounded-2xl bg-white/10 border border-white/15 px-5 py-4 backdrop-blur-sm">
              <CalendarDays className="w-5 h-5 text-emerald-300" />
              <div><strong className="text-xl">{events.length}</strong><span className="text-sm text-white/65 ml-2">közelgő program</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">Programok</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">A helyszín következő eseményei</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-[430px] rounded-2xl" />)}
          </div>
        ) : events.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
            <CalendarDays className="w-9 h-9 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground">Ehhez a helyszínhez most nincs közelgő program.</p>
            <Link href="/#kozelgo" className="inline-flex mt-5 text-sm font-bold text-primary">Összes program megtekintése</Link>
          </div>
        )}
      </section>
    </div>
  );
}
