import { useParams } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Clock, Ticket, Tag, ArrowLeft, ExternalLink, Calendar, Newspaper } from "lucide-react";
import { Link } from "wouter";
import { useGetEvent, getGetEventQueryKey, useListEvents } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatShortDate } from "@/utils/date-format";
import { useQuery } from "@tanstack/react-query";

function EventCard({ event, index = 0 }: { event: any; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <Link href={`/esemeny/${event.id}`}>
        <div className="group cursor-pointer bg-card rounded-2xl overflow-hidden border border-card-border hover:shadow-lg transition-all duration-300">
          <div className="relative overflow-hidden aspect-video">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {event.category && (
              <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: event.category.color }}>
                {event.category.name}
              </span>
            )}
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" />{formatShortDate(event.startDate)} · {event.location}</p>
            <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">{event.title}</h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function EventDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: event, isLoading } = useGetEvent(id, {
    query: { enabled: !!id, queryKey: getGetEventQueryKey(id) },
  });

  const { data: relatedData } = useListEvents(
    event?.categoryId ? { categoryId: event.categoryId, limit: 4 } : undefined,
    { query: { enabled: !!event?.categoryId } }
  );
  const related = (relatedData?.events ?? []).filter(e => e.id !== id).slice(0, 3);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="w-full h-72 rounded-3xl" />
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
        <Link href="/"><button className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold">Vissza a főoldalra</button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Vissza
        </button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left: image + info */}
          <div className="md:col-span-3">
            <div className="relative rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: "16/9" }}>
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              {event.category && (
                <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full text-white shadow" style={{ backgroundColor: event.category.color }}>
                  {event.category.name}
                </span>
              )}
              {event.price && (
                <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full bg-white/95 text-foreground shadow flex items-center gap-1.5">
                  <Ticket className="w-3 h-3" />{event.price}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight">{event.title}</h1>
            <div className="text-muted-foreground leading-relaxed text-sm mb-5 space-y-3">
              {(event.description ?? "").split(/\n\n+/).map((para, i) => (
                <p key={i}>
                  {para.split(/\n/).map((line, j, arr) => (
                    <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                  ))}
                </p>
              ))}
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: details card */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Időpont</p>
                  <p className="font-semibold text-sm text-foreground">{formatDate(event.startDate)}</p>
                  {event.endDate && (
                    <p className="text-xs text-muted-foreground mt-0.5">– {formatDate(event.endDate)}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Helyszín</p>
                  <p className="font-semibold text-sm text-foreground">{event.location}</p>
                  {event.locationAddress && (
                    <p className="text-xs text-muted-foreground mt-0.5">{event.locationAddress}</p>
                  )}
                </div>
              </div>

              {event.price && (
                <div className="border-t border-border pt-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Ticket className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Belépő</p>
                    <p className="font-semibold text-sm text-foreground">{event.price}</p>
                  </div>
                </div>
              )}
            </div>

            {event.ticketUrl && (
              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="block">
                <button className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Ticket className="w-4 h-4" /> Jegyvasárlás <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </a>
            )}

            <Link href="/" className="block">
              <button className="w-full py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors text-sm">
                Vissza az összes programhoz
              </button>
            </Link>
          </div>
        </div>

        {/* Related news */}
        <RelatedNews eventId={id} eventTitle={event.title} />

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold mb-5">Hasonló események</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

type NewsArticle = { title: string; link: string; pubDate: string; description: string; source: string };

function RelatedNews({ eventId, eventTitle }: { eventId: number; eventTitle: string }) {
  const { data, isLoading } = useQuery<{ articles: NewsArticle[] }>({
    queryKey: ["event-news", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/news`);
      if (!res.ok) return { articles: [] };
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!eventId,
  });

  const articles = data?.articles ?? [];

  if (isLoading) {
    return (
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Kapcsolódó hírek</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mt-12"
    >
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Kapcsolódó hírek</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {articles.map((article, i) => (
          <motion.a
            key={i}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="group bg-card border border-card-border rounded-2xl p-4 hover:shadow-md transition-all duration-200 block"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold text-primary/80 bg-primary/8 px-2 py-0.5 rounded-full">
                {article.source}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug mb-1.5 line-clamp-2">
              {article.title}
            </h3>
            {article.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{article.description}</p>
            )}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
