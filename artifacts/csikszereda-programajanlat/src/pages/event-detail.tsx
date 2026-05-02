import { useParams } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Clock, Ticket, Tag, ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useGetEvent, getGetEventQueryKey, useListEvents } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/events/EventCard";
import { formatDate } from "@/utils/date-format";

export default function EventDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: event, isLoading } = useGetEvent(id, {
    query: { enabled: !!id, queryKey: getGetEventQueryKey(id) },
  });

  const { data: relatedData } = useListEvents(
    event?.categoryId ? { categoryId: event.categoryId, limit: 3 } : undefined,
    { query: { enabled: !!event?.categoryId } }
  );

  const related = (relatedData?.events ?? []).filter((e) => e.id !== id).slice(0, 3);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="w-full h-80 rounded-3xl" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Esemény nem található</h1>
        <p className="text-muted-foreground mb-6">Ez az esemény nem létezik vagy törölték.</p>
        <Link href="/">
          <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            Vissza a főoldalra
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Vissza
        </button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative rounded-3xl overflow-hidden mb-8">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-72 md:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {event.category && (
            <span
              className="absolute top-5 left-5 text-xs font-bold px-3 py-1.5 rounded-full text-white shadow"
              style={{ backgroundColor: event.category.color }}
            >
              {event.category.name}
            </span>
          )}
          {event.price && (
            <span className="absolute top-5 right-5 text-xs font-bold px-3 py-1.5 rounded-full bg-background/90 text-foreground shadow flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" />
              {event.price}
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              {event.title}
            </h1>
            <p className="text-muted-foreground leading-relaxed text-base mb-6">
              {event.description}
            </p>

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Időpont
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{formatDate(event.startDate)}</span>
                </div>
                {event.endDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4 flex-shrink-0 opacity-0" />
                    <span>– {formatDate(event.endDate)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Helyszín
                </div>
                <div className="flex items-start gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div>{event.location}</div>
                    {event.locationAddress && (
                      <div className="text-muted-foreground text-xs mt-0.5">{event.locationAddress}</div>
                    )}
                  </div>
                </div>
              </div>

              {event.price && (
                <div className="border-t border-border pt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Belépő
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Ticket className="w-4 h-4 text-primary" />
                    {event.price}
                  </div>
                </div>
              )}
            </div>

            {event.ticketUrl && (
              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="block">
                <button className="w-full px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Ticket className="w-4 h-4" />
                  Jegyvasárlás
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </a>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold mb-5">Hasonló események</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((ev, i) => (
                <EventCard key={ev.id} event={ev} index={i} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
