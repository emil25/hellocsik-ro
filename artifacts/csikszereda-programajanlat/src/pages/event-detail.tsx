import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Clock, Ticket, Tag, ArrowLeft, ExternalLink, Calendar, Share2, Link2, Database, CalendarPlus, Download, Flag, CheckCircle2, Loader2, Maximize2 } from "lucide-react";
import { Link } from "wouter";
import { useGetEvent, getGetEventQueryKey, useListEvents } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatEndDate, formatShortDate } from "@/utils/date-format";
import { formatRefreshDate, getEventSource } from "@/lib/event-meta";
import { getVenueInfo } from "@/lib/venues";
import { organizerForEvent } from "@/data/organizers";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import { downloadCalendarFile, googleCalendarUrl } from "@/lib/calendar-links";
import { getEventLinks, getEventPriceLabel } from "@/lib/event-links";
import { usePortal } from "@/lib/portal";
import { RegionalEventCard } from "@/components/RegionalPortal";

function EventCard({ event, index = 0 }: { event: any; index?: number }) {
  const { regional } = usePortal();
  if (regional) return <RegionalEventCard event={event} />;
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
  const { name: portalName } = usePortal();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("wrong_time");
  const [reportMessage, setReportMessage] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

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

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, "facebook-share", "width=680,height=520,noopener,noreferrer");
  };

  async function submitReport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setReportBusy(true);
    setReportError("");
    try {
      const response = await fetch(`/api/events/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason, message: reportMessage, website: formData.get("website") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "A jelzést most nem sikerült elküldeni.");
      setReportSent(true);
    } catch (error) {
      setReportError(error instanceof Error ? error.message : "A jelzést most nem sikerült elküldeni.");
    } finally {
      setReportBusy(false);
    }
  }

  useEffect(() => {
    if (!event) return;
    const previousTitle = document.title;
    document.title = `${event.title} – ${portalName}`;
    return () => { document.title = previousTitle; };
  }, [event, portalName]);

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

  const source = getEventSource(event.newsLinks);
  const venue = getVenueInfo(event.location);
  const registeredOrganizer = (event as any).organizer;
  const organizer = organizerForEvent(event) ?? (registeredOrganizer?.slug ? {
    slug: registeredOrganizer.slug, name: registeredOrganizer.name, accent: "#df523e",
    initials: String(registeredOrganizer.name).split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase(),
  } : null);
  const externalLinks = getEventLinks(event);
  const organizerName = organizer?.name ?? externalLinks.organizerName ?? (event as any).organizer?.name;
  const overview = <>
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
                      <p className="text-xs text-stone-400 mt-0.5">– {formatEndDate(event.endDate)}</p>
                    )}
                  </div>
                </div>

                {/* Location row */}
                <div className="flex items-start gap-4 px-5 py-4 border-b border-stone-50">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #dcfce7, #bbf7d0)" }}>
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Helyszín</p>
                    <Link href={`/helyszin/${venue.slug}`} className="font-semibold text-sm text-stone-800 leading-snug hover:text-primary transition-colors inline-flex items-center gap-1">
                      {event.location} <span aria-hidden="true">→</span>
                    </Link>
                    {event.locationAddress && (
                      <p className="text-xs text-stone-400 mt-0.5">{event.locationAddress}</p>
                    )}
                  </div>
                </div>

                {/* Price row */}
                {getEventPriceLabel(event) !== "Ingyenes" && (
                  <div className="flex items-start gap-4 px-5 py-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #fce7f3, #fbcfe8)" }}>
                      <Ticket className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Belépő</p>
                      <p className="font-semibold text-sm text-stone-800">{getEventPriceLabel(event)}</p>
                    </div>
                  </div>
                )}
              </div>

              {externalLinks.ticketUrl && <a href={externalLinks.ticketUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 px-4 font-bold text-sm rounded-xl text-white bg-primary hover:bg-primary/90 shadow-sm flex items-center justify-center gap-2"><Ticket className="w-4 h-4 shrink-0" /> {externalLinks.ticketTitle || "Jegyvásárlás"} <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" /></a>}
  </>;

  return (
    <div>
      {/* The full image stays visible, while a soft blurred fill keeps portrait posters
          and wide photos balanced in the same frame. */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8">
        <section className="grid overflow-hidden rounded-[26px] border border-stone-200 bg-[#f7f6f2] shadow-sm lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)]">
          <div className="group relative isolate aspect-[4/3] min-h-[260px] overflow-hidden bg-stone-900 sm:min-h-[360px] lg:aspect-auto lg:min-h-[520px]">
            {event.imageUrl && !imageFailed ? <>
              <img src={event.imageUrl} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl" />
              <div className="absolute inset-0 bg-black/20" />
              <motion.img
                src={event.imageUrl}
                alt={event.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45 }}
                onError={() => setImageFailed(true)}
                className="absolute inset-0 h-full w-full object-contain p-1 sm:p-2"
              />
              <a href={event.imageUrl} target="_blank" rel="noopener noreferrer" aria-label="A teljes eseménykép megnyitása" className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:opacity-100 focus:opacity-100">
                <Maximize2 className="h-3.5 w-3.5" /> Teljes kép
              </a>
            </> : <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-emerald-950 to-stone-800 text-sm font-medium text-white/75">Eseménykép nem érhető el</div>}

            <div className="absolute left-4 right-4 top-4 flex items-center justify-between sm:left-6 sm:right-6 sm:top-6">
              <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur transition-colors hover:bg-black/70">
                <ArrowLeft className="h-4 w-4" /> Vissza
              </Link>
              <div className="flex items-center gap-2">
                <FavoriteButton eventId={event.id} className="h-10 w-10" />
                <button onClick={handleShare} aria-label="Esemény megosztása" className="inline-flex h-10 items-center gap-2 rounded-full bg-black/55 px-3.5 text-sm font-semibold text-white shadow-sm backdrop-blur transition-colors hover:bg-black/70">
                  <Share2 className="h-4 w-4" /><span className="hidden sm:inline">Megosztás</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8 lg:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {event.category && <span className="rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-sm" style={{ backgroundColor: event.category.color }}>{event.category.name}</span>}
              {event.featured && <span className="rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-amber-950 shadow-sm">★ Kiemelt</span>}
            </div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6 text-2xl font-bold leading-tight tracking-tight text-stone-900 sm:text-3xl lg:text-[2.15rem]">
              {event.title}
            </motion.h1>
            <div className="space-y-3">{overview}</div>
          </div>
        </section>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)] lg:gap-12">
          {/* Left: description + tags */}
          <div className="min-w-0 break-words">
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
          <div className="min-w-0 break-words">
            <div className="md:sticky md:top-24 space-y-3">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-sky-50">
                    <Database className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Forrás és frissítés</p>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-sm text-primary hover:underline">
                        {source.title} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="font-semibold text-sm text-stone-800">{source.title}</p>
                    )}
                    <p className="text-xs text-stone-400 mt-1">Frissítve: {formatRefreshDate(event.updatedAt ?? event.createdAt)}</p>
                  </div>
                </div>
              </div>

              {organizerName && (
                organizer ? <Link href={`/szervezo/${organizer.slug}`} className="group flex items-center gap-3 bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4 hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black" style={{ background: organizer.accent }}>{organizer.initials}</div>
                  <div className="min-w-0 flex-1"><p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Szervező</p><p className="font-semibold text-sm text-stone-800 truncate group-hover:text-primary transition-colors">{organizer.name}</p></div>
                  <span className="text-stone-300 group-hover:text-primary transition-colors">→</span>
                </Link> : <div className="flex items-center gap-3 bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black bg-primary">SZ</div><div className="min-w-0"><p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Szervező</p><p className="font-semibold text-sm text-stone-800 truncate">{organizerName}</p></div></div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleFacebookShare} className="col-span-2 py-3 px-3 rounded-xl bg-[#1877f2] text-white text-sm font-bold hover:bg-[#1669d5] transition-colors flex items-center justify-center gap-2">
                  <span className="font-black text-base">f</span> Megosztás Facebookon
                </button>
                <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="py-3 px-2 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 text-center">
                  <CalendarPlus className="w-4 h-4 text-primary" /> Google Naptár
                </a>
                <button onClick={() => downloadCalendarFile(event)} className="py-3 px-2 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 text-center">
                  <Download className="w-4 h-4 text-primary" /> Naptárfájl
                </button>
              </div>

              {/* External links: keep tickets and Facebook separate. */}
              {externalLinks.facebookUrl && <a href={externalLinks.facebookUrl} target="_blank" rel="noopener noreferrer" className="block"><button className="w-full py-3.5 font-bold text-sm rounded-xl text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg,#1877f2,#0e5ab8)" }}><Link2 className="w-4 h-4" /> Facebook esemény <ExternalLink className="w-3.5 h-3.5 opacity-70" /></button></a>}
              {externalLinks.otherLinks.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="block"><button className="w-full py-3 border border-stone-200 text-stone-700 font-semibold rounded-xl hover:bg-stone-50 transition-colors text-sm flex items-center justify-center gap-2"><ExternalLink className="w-4 h-4 text-primary" /> {link.title}</button></a>)}

              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                {reportSent ? (
                  <div className="flex items-start gap-2 text-sm text-emerald-800" role="status">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Köszönjük, megkaptuk a jelzést. Átnézzük az esemény adatait.</span>
                  </div>
                ) : (
                  <>
                    <button type="button" onClick={() => { setReportOpen(value => !value); setReportError(""); }} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-stone-600 hover:text-primary transition-colors">
                      <Flag className="w-4 h-4" /> {reportOpen ? "Jelzés bezárása" : "Hibás adatot találtál? Jelezd"}
                    </button>
                    {reportOpen && <form onSubmit={submitReport} className="mt-4 space-y-3">
                      <label className="block text-xs font-semibold text-stone-600">Mi változott?
                        <select value={reportReason} onChange={e => setReportReason(e.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option value="wrong_time">Hibás időpont</option>
                          <option value="wrong_place">Hibás helyszín</option>
                          <option value="cancelled">Elmarad vagy megváltozott</option>
                          <option value="ticket_link">Hibás jegy- vagy információs link</option>
                          <option value="other">Egyéb hiba</option>
                        </select>
                      </label>
                      <label className="block text-xs font-semibold text-stone-600">Rövid megjegyzés <span className="font-normal text-stone-400">(nem kötelező)</span>
                        <textarea value={reportMessage} onChange={e => setReportMessage(e.target.value)} maxLength={1200} rows={3} placeholder="Mi a helyes információ?" className="mt-1.5 w-full resize-y rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </label>
                      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[10000px] h-px w-px opacity-0" />
                      {reportError && <p className="text-xs text-red-700" role="alert">{reportError}</p>}
                      <button type="submit" disabled={reportBusy} className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
                        {reportBusy ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Küldés…</span> : "Jelzés elküldése"}
                      </button>
                      <p className="text-[11px] leading-relaxed text-stone-400">Nem kérünk nevet vagy e-mail-címet.</p>
                    </form>}
                  </>
                )}
              </div>

              <Link href="/" className="block">
                <button className="w-full py-3 border border-stone-200 text-stone-600 font-semibold rounded-xl hover:bg-stone-50 transition-colors text-sm">
                  ← Összes program
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Related news */}
        <RelatedNews newsLinks={(event.newsLinks ?? []).slice(1)} />

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

type NewsLink = { title: string; url: string };

function RelatedNews({ newsLinks }: { newsLinks: string[] }) {
  const links: NewsLink[] = newsLinks
    .map(s => { try { return JSON.parse(s) as NewsLink; } catch { return null; } })
    .filter((l): l is NewsLink => !!l && !!l.title && !!l.url);

  if (links.length === 0) return null;

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
        {links.map((link, i) => (
          <motion.a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="group bg-white border border-stone-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-stone-800 group-hover:text-primary transition-colors leading-snug line-clamp-3">
                {link.title}
              </h3>
              <ExternalLink className="w-4 h-4 text-stone-300 flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
