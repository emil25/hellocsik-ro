import { useParams } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Clock, Ticket, Tag, ArrowLeft, ExternalLink, Calendar, Newspaper, Share2 } from "lucide-react";
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
        <div className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {event.category && (
              <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full text-white shadow-sm" style={{ backgroundColor: event.category.color }}>
                {event.category.name}
              </span>
            )}
          </div>
          <div className="p-4">
            <p className="text-xs text-stone-400 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />{formatShortDate(event.startDate)}
              <span className="text-stone-300">·</span>
              <MapPin className="w-3 h-3" />{event.location}
            </p>
            <h3 className="font-bold text-sm text-stone-800 line-clamp-2 group-hover:text-primary transition-colors leading-snug">{event.title}</h3>
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
    { query: { enabled: !!event?.categoryId, queryKey: ["events", "related", event?.categoryId] } }
  );
  const related = (relatedData?.events ?? []).filter(e => e.id !== id).slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event?.title ?? "", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="w-full h-[480px]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
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
    <div>
      {/* ── Cinematic hero ──────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(320px, 55vh, 560px)" }}>
        {/* Background image */}
        <motion.img
          src={event.imageUrl}
          alt={event.title}
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)"
        }} />

        {/* Top nav buttons */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-8 pt-5">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors backdrop-blur-sm bg-black/20 px-3 py-2 rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Vissza
            </button>
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors backdrop-blur-sm bg-black/20 px-3 py-2 rounded-xl"
          >
            <Share2 className="w-4 h-4" /> Megosztás
          </button>
        </div>

        {/* Bottom: category + title */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-7">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {event.category && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-sm" style={{ backgroundColor: event.category.color }}>
                  {event.category.name}
                </span>
              )}
              {event.featured && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-400 text-amber-900 shadow-sm">
                  ★ Kiemelt
                </span>
              )}
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-md"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
            >
              {event.title}
            </motion.h1>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: description + tags */}
          <div className="md:col-span-3">
            <div className="space-y-3 mb-6">
              {(event.description ?? "").split(/\n\n+/).map((para, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-stone-600">
                  {para.split(/\n/).map((line, j, arr) => (
                    <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                  ))}
                </p>
              ))}
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: info card */}
          <div className="md:col-span-2">
            <div className="sticky top-6 space-y-3">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                {/* Date row */}
                <div className="flex items-start gap-4 px-5 py-4 border-b border-stone-50">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)" }}>
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Időpont</p>
                    <p className="font-semibold text-sm text-stone-800">{formatDate(event.startDate)}</p>
                    {event.endDate && (
                      <p className="text-xs text-stone-400 mt-0.5">– {formatDate(event.endDate)}</p>
                    )}
                  </div>
                </div>

                {/* Location row */}
                <div className={`flex items-start gap-4 px-5 py-4 ${event.price ? "border-b border-stone-50" : ""}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #dcfce7, #bbf7d0)" }}>
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Helyszín</p>
                    <p className="font-semibold text-sm text-stone-800 leading-snug">{event.location}</p>
                    {event.locationAddress && (
                      <p className="text-xs text-stone-400 mt-0.5">{event.locationAddress}</p>
                    )}
                  </div>
                </div>

                {/* Price row */}
                {event.price && (
                  <div className="flex items-start gap-4 px-5 py-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #fce7f3, #fbcfe8)" }}>
                      <Ticket className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Belépő</p>
                      <p className="font-semibold text-sm text-stone-800">{event.price}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA buttons */}
              {event.ticketUrl && (
                <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <button className="w-full py-3.5 font-bold text-sm rounded-xl text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 80%, black))" }}>
                    <Ticket className="w-4 h-4" /> Jegyvásárlás <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </a>
              )}

              <Link href="/" className="block">
                <button className="w-full py-3 border border-stone-200 text-stone-600 font-semibold rounded-xl hover:bg-stone-50 transition-colors text-sm">
                  ← Összes program
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Related news */}
        <RelatedNews eventId={id} eventTitle={event.title} />

        {/* Related events */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h2 className="text-xl font-bold text-stone-800">Hasonló események</h2>
            </div>
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
      <div className="mt-12 pt-8 border-t border-stone-100">
        <div className="flex items-center gap-3 mb-5">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-stone-800">Kapcsolódó hírek</h2>
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
      className="mt-16 pt-10 border-t border-stone-100"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="h-6 w-1 rounded-full bg-primary" />
        <h2 className="text-xl font-bold text-stone-800">Kapcsolódó hírek</h2>
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
            className="group bg-white border border-stone-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block"
          >
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <span className="text-[11px] font-bold text-primary/80 bg-primary/8 px-2.5 py-0.5 rounded-full">
                {article.source}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-300 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-semibold text-sm text-stone-800 group-hover:text-primary transition-colors leading-snug mb-1.5 line-clamp-2">
              {article.title}
            </h3>
            {article.description && (
              <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">{article.description}</p>
            )}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
