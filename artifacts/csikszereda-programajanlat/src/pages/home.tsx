import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, ArrowRight, Sparkles, Calendar, ChevronLeft, ChevronRight, Ticket, ExternalLink, Plus, CheckCircle2, Building2 } from "lucide-react";
import { Link } from "wouter";
import {
  useListFeaturedEvents,
  useListThisWeekEvents,
  useListUpcomingEvents,
  useGetMonthHighlight,
  useListCategories,
  useListEvents,
  useGetEvent,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime, formatShortDate } from "@/utils/date-format";

// ─── HERO ───────────────────────────────────────────────────────────────────

function Hero() {
  const { data, isLoading } = useListFeaturedEvents();
  const events = data?.events ?? [];

  return (
    <section
      className="relative overflow-hidden min-h-[540px] flex items-center"
      style={{
        background: "radial-gradient(ellipse at 30% 50%, #2d1b5e 0%, #1a0a3e 40%, #0d0620 100%)",
      }}
    >
      {/* Star dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        {/* Left: text */}
        <div>
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-white/20 bg-white/10">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Élő · Csíkszereda Események</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Mi újság{" "}
            <span
              className="block italic"
              style={{ color: "#e879a0", fontFamily: "'Playfair Display', serif" }}
            >
              Csíkszereda?
            </span>
          </h1>
          <p className="text-white/65 text-base leading-relaxed mb-8 max-w-md">
            Koncertek, fesztiválok, színház, kiállítások és közösségi programok –
            minden, amit a városban érdemes megnézni, egy helyen, friss információkkal.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#kozelgo">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-foreground font-semibold text-sm hover:bg-white/90 transition-colors">
                Böngészd a programokat
                <ArrowRight className="w-4 h-4" />
              </button>
            </a>
            <a href="#hetvege">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-colors">
                <Sparkles className="w-4 h-4" />
                Ezen a hétvégén
              </button>
            </a>
            <a href="#picks">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-foreground font-semibold text-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: "#f5a623" }}>
                <Calendar className="w-4 h-4" />
                Közelgők
              </button>
            </a>
          </div>
        </div>

        {/* Right: floating event cards */}
        <div className="relative hidden md:block h-80">
          {!isLoading && events.slice(0, 3).map((event, i) => {
            const rotations = [-8, 4, -2];
            const positions = [
              { top: "0%", left: "10%", zIndex: 1 },
              { top: "5%", left: "45%", zIndex: 2 },
              { top: "35%", left: "28%", zIndex: 3 },
            ];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="absolute rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  ...positions[i],
                  width: i === 2 ? "210px" : "180px",
                  transform: `rotate(${rotations[i]}deg)`,
                }}
              >
                <img src={event.imageUrl} alt={event.title} className="w-full h-40 object-cover" />
                {i === 2 && (
                  <div className="bg-white p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] font-bold text-primary">● Most ajánljuk</span>
                      <span className="text-[10px] text-muted-foreground ml-1">Ingyenes</span>
                    </div>
                    <p className="text-xs font-bold text-foreground line-clamp-2">{event.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatShortDate(event.startDate)} · {event.location}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── PICKS ──────────────────────────────────────────────────────────────────

function Picks() {
  const { data, isLoading } = useListFeaturedEvents();
  const events = (data?.events ?? []).slice(0, 3);

  return (
    <section id="picks" className="py-16" style={{ background: "linear-gradient(180deg, #faf8f5 0%, #f0ebe3 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Hamarosan érkezik</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Programok, amit nem szabad kihagyni
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Kuráltan kiválasztott események — koncert, irodalom, humor és közösségi élmények egy kattintásra.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0,1,2].map(i => <Skeleton key={i} className="h-96 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Link href={`/esemeny/${event.id}`}>
                  <div className="group cursor-pointer bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-card-border">
                    <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span
                        className="absolute top-3 left-3 text-[11px] font-black px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: "#22c55e" }}
                      >
                        #{i + 1} PICK
                      </span>
                      {event.category && (
                        <span
                          className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white"
                          style={{ backgroundColor: event.category.color }}
                        >
                          {event.category.name}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatShortDate(event.startDate)}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                      </div>
                      <h3 className="font-bold text-base text-foreground leading-snug mb-3 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-1 text-primary text-sm font-semibold">
                        Részletek <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── WEEKLY CALENDAR ────────────────────────────────────────────────────────

function WeeklyCalendar() {
  const { data, isLoading } = useListThisWeekEvents();
  const { data: catData } = useListCategories();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const days = data?.days ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const activeDay = selectedDay ?? today;
  const selectedDayData = days.find(d => d.date === activeDay);
  const categories = catData?.categories ?? [];

  // Count events per category for selected day
  const catCounts: Record<number, number> = {};
  let totalCount = 0;
  if (selectedDayData) {
    totalCount = selectedDayData.events.length;
    selectedDayData.events.forEach(ev => {
      if (ev.categoryId) {
        catCounts[ev.categoryId] = (catCounts[ev.categoryId] ?? 0) + 1;
      }
    });
  }

  // Week label
  const weekLabel = (() => {
    if (!days.length) return "";
    const first = new Date(days[0].date + "T12:00:00");
    const last = new Date(days[6].date + "T12:00:00");
    const fmt = (d: Date) => d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
    return `${fmt(first)} – ${fmt(last)}`;
  })();

  return (
    <section id="naptar" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Heti naptár</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-1">Mi lesz a héten?</h2>
            <p className="text-muted-foreground text-sm">Válassz napot, és nézd meg az aznapi programokat.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 mt-2">
            <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground font-medium px-2">{weekLabel}</span>
            <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day selector */}
        {isLoading ? (
          <div className="grid grid-cols-7 gap-2 mb-6">
            {Array.from({length:7}).map((_,i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 mb-6">
            {days.map(day => {
              const isToday = day.date === today;
              const isActive = day.date === activeDay;
              const dayNum = new Date(day.date + "T12:00:00").getDate();
              return (
                <motion.button
                  key={day.date}
                  onClick={() => setSelectedDay(day.date)}
                  whileTap={{ scale: 0.96 }}
                  className={`flex flex-col items-center py-3.5 px-1 rounded-xl border transition-all text-center ${
                    isActive
                      ? "border-transparent text-white"
                      : "bg-card border-card-border text-foreground hover:border-primary/30"
                  }`}
                  style={isActive ? { backgroundColor: "#166534" } : {}}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isActive ? "text-white/70" : "text-muted-foreground"}`}>
                    {day.dayName}
                  </span>
                  <span className="text-xl font-bold leading-none">{dayNum}</span>
                  {day.events.length > 0 && (
                    <span className={`mt-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                      {day.events.length}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Day events */}
        <div className="bg-muted/40 rounded-2xl px-6 py-5 mb-6 min-h-[80px] flex items-center">
          {!selectedDayData || selectedDayData.events.length === 0 ? (
            <p className="text-muted-foreground text-sm w-full text-center">
              Ezen a napon nincs regisztrált esemény. Próbálj másik napot!
            </p>
          ) : (
            <div className="w-full space-y-2">
              {selectedDayData.events.map(ev => (
                <Link key={ev.id} href={`/esemeny/${ev.id}`}>
                  <div className="flex items-center gap-3 hover:bg-background/60 rounded-xl p-2 cursor-pointer transition-colors">
                    <img src={ev.imageUrl} alt={ev.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground line-clamp-1">{ev.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatTime(ev.startDate)} · {ev.location}</p>
                    </div>
                    {ev.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: ev.category.color }}>
                        {ev.category.name}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1">Szűrés:</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-foreground text-white">
            Mind <span className="text-white/70 text-xs">{totalCount}</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-border bg-card text-foreground hover:border-primary/30 transition-colors"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              {cat.name} <span className="text-muted-foreground text-xs">{catCounts[cat.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── UPCOMING EVENTS ────────────────────────────────────────────────────────

function UpcomingEvents() {
  const { data, isLoading } = useListUpcomingEvents({ limit: 9 });
  const events = data?.events ?? [];

  return (
    <section id="kozelgo" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Minden program</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-0.5">Közelgő események</h2>
          <p className="text-sm text-muted-foreground">{events.length} esemény a forrásból: csikszereda-programajanlat.ro</p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({length: 6}).map((_,i) => <Skeleton key={i} className="h-80 rounded-2xl" />)
            : events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <Link href={`/esemeny/${event.id}`}>
                  <div className="group cursor-pointer bg-card rounded-2xl overflow-hidden border border-card-border hover:shadow-lg transition-all duration-300">
                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Category badges (multiple) */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {event.category && (
                          <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                            style={{ backgroundColor: event.category.color }}
                          >
                            {event.category.name}
                          </span>
                        )}
                      </div>
                      {event.price && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 rounded-lg px-2 py-1">
                          <Ticket className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[11px] font-semibold text-foreground">{event.price}</span>
                        </div>
                      )}
                    </div>
                    {/* Body */}
                    <div className="p-4">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatShortDate(event.startDate)}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                      </div>
                      <h3 className="font-bold text-base text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
                      <div className="flex items-center justify-between">
                        {event.price === "Ingyenes" || !event.price ? (
                          <span className="text-xs text-muted-foreground">Ingyenes részvétel</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{event.price}</span>
                        )}
                        <span className="flex items-center gap-1 text-primary text-sm font-semibold">
                          Részletek <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          }
        </div>
      </div>
    </section>
  );
}

// ─── MONTH HIGHLIGHT ────────────────────────────────────────────────────────

function MonthHighlight() {
  const { data: event, isLoading } = useGetMonthHighlight();

  if (isLoading) return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </section>
  );
  if (!event) return null;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-secondary">✦</span>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">A hónap eseménye</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground">A hónap nagy programja</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center bg-card rounded-3xl overflow-hidden border border-card-border shadow-sm">
          {/* Image */}
          <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            {/* Category badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {event.category && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: event.category.color }}>
                  {event.category.name}
                </span>
              )}
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 text-foreground">Közösségi</span>
            </div>
          </div>

          {/* Details */}
          <div className="p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-primary leading-tight mb-4">
              {event.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6 text-sm">{event.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Időpont</p>
                  <p className="text-sm font-semibold text-foreground">{formatShortDate(event.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Helyszín</p>
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href={`/esemeny/${event.id}`}>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                  Megnézem a részleteket
                  <ExternalLink className="w-4 h-4" />
                </button>
              </Link>
              {event.ticketUrl && (
                <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                  <button className="px-5 py-2.5 border border-border rounded-xl font-semibold text-sm hover:bg-muted transition-colors">
                    Hivatalos oldal
                  </button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CINEMA SECTION ─────────────────────────────────────────────────────────

const API_IMG = (path: string) =>
  `https://api.cinemacsikimozi.ro/api/image/format?image=${path}&width=300&height=450&format=webp`;

const MOVIES = [
  {
    id: "m1",
    title: "Magasmentés",
    date: "Máj. 2–8.",
    badge: "MŰSORON",
    image: API_IMG("uploads%2Fmovies%2F0b7dbace-9502-4202-924c-8808a3bb06d0%2Fimages%2Ffilmsidebar_magasmentes-plakat_35dac8b5-a729-4d7f-9861-2f4a2a18f5f8.jpg"),
  },
  {
    id: "m2",
    title: "Michael",
    date: "Máj. 2–8.",
    badge: "MŰSORON",
    image: API_IMG("uploads%2Fmovies%2F4757121f-8384-4fe1-a3c6-3ababa963985%2Fimages%2Fmichael_323dab3a-cdfa-405b-888e-8ed3c8e34287.jpg"),
  },
  {
    id: "m3",
    title: "The Devil Wears Prada 2",
    date: "Máj. 2–8.",
    badge: "PREMIER",
    image: API_IMG("uploads%2Fmovies%2F6ac8e919-0e75-4693-a1ea-9d729d12d580%2Fimages%2F6444-DEVIL-WEARS-PRADA-2-POSTER-RO_9031be11-f1c8-4aa3-92be-2999adeea8c9.jpg"),
  },
  {
    id: "m4",
    title: "Project Hail Mary",
    date: "Máj. 9–15.",
    badge: "HAMAROSAN",
    image: API_IMG("uploads%2Fmovies%2F7b86b894-3839-4e4c-9b92-da5d7097f71b%2Fimages%2FProjectHailMary-posterbook_0e6b8ce1-25b6-4440-8829-9ebf593cc919.jpg"),
  },
  {
    id: "m5",
    title: "Generációk közt",
    date: "Máj. 2–8.",
    badge: "MŰSORON",
    image: API_IMG("uploads%2Fmovies%2F34c88a9a-58e7-42d9-a779-bcc039e97aaa%2Fimages%2Fkep_d16c3861-83db-4363-8209-d599cbfcf8a6.jpg"),
  },
  {
    id: "m6",
    title: "The Last Whale Singer",
    date: "Máj. 9–15.",
    badge: "HAMAROSAN",
    image: API_IMG("uploads%2Fmovies%2Fbc9b7d89-885e-42eb-92a1-294f4e822996%2Fimages%2Fimages_cfda9bdc-fa26-4f3d-a14b-7ab57b87d3d3.jpeg"),
  },
  {
    id: "m7",
    title: "Orwell: 2+2=5",
    date: "Máj. 2–8.",
    badge: "MŰSORON",
    image: API_IMG("uploads%2Fmovies%2F3faa91a3-6fe6-47a1-b177-53e2ced3f6dd%2Fimages%2Forwell_63d6135d-ecfc-496e-a97c-4d9e16a39271.jpg"),
  },
  {
    id: "m8",
    title: "The Sheep Detectives",
    date: "Máj. 2–8.",
    badge: "MŰSORON",
    image: API_IMG("uploads%2Fmovies%2F51dfd8fc-c8f3-48e3-9567-c0dea35c3597%2Fimages%2Fsheep_a5191bfa-fede-4bfc-8324-810a4afab3b3.jpg"),
  },
  {
    id: "m9",
    title: "Iron Maiden: Burning Ambition",
    date: "Máj. 9–15.",
    badge: "HAMAROSAN",
    image: API_IMG("uploads%2Fmovies%2Fa287766a-570d-4c0d-b575-40baa29e2c8d%2Fimages%2Fironmaden2_aeaa4777-76c6-4f76-8488-454601e119dc.jpg"),
  },
];

const badgeColors: Record<string, string> = {
  "MŰSORON": "#166534",
  "PREMIER": "#e53935",
  "HAMAROSAN": "#6b7280",
};

function CinemaSection() {
  return (
    <section className="py-16" style={{ background: "linear-gradient(180deg, #fdf8f5 0%, #fce7f3 50%, #ede9fe 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Mozi-ajánló</span>
              <span className="text-[10px] text-muted-foreground uppercase">· Csíki Mozi</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-1">Most a vásznon</h2>
            <p className="text-sm text-muted-foreground">A Cinema Csíki Mozi friss műsora – premierek, magyar és nemzetközi filmek a belvárosban.</p>
          </div>
          <a href="https://cinemacsikimozi.ro" target="_blank" rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 text-sm font-semibold text-primary hover:underline whitespace-nowrap">
            Teljes műsor a cinemacsikimozi.ro-n <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {MOVIES.map(movie => (
            <div key={movie.id} className="flex-shrink-0 w-40 md:w-44">
              <div className="relative rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: "2/3" }}>
                <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
                <div
                  className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: badgeColors[movie.badge] ?? "#166534" }}
                >
                  {movie.badge}
                </div>
              </div>
              <p className="font-semibold text-sm text-foreground line-clamp-2 mb-1">{movie.title}</p>
              <p className="text-xs text-muted-foreground">{movie.date}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Ticket className="w-3 h-3" />
                Jegyek a mozi pénztárában
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BOOK FAIR SECTION (event + countdown + guests) ─────────────────────────

const BOOK_FAIR_GUESTS = [
  {
    name: "Ferenczes István",
    role: "erdélyi magyar költő",
    img: "https://csikszeredaikonyvvasar.ro/wp-content/uploads/2023/04/Ferenczes_Istvan-scaled-e1681813619647.jpg",
    url: "https://csikszeredaikonyvvasar.ro/ferenczes-istvan/",
    gradient: "from-violet-500 to-purple-700",
  },
  {
    name: "Zalán Tibor",
    role: "költő, író, dramaturg",
    img: "https://csikszeredaikonyvvasar.ro/wp-content/uploads/2023/04/Zalan_Tibor-scaled-e1681813693770.jpg",
    url: "https://csikszeredaikonyvvasar.ro/zalan-tibor/",
    gradient: "from-blue-500 to-indigo-700",
  },
  {
    name: "Lackfi János",
    role: "költő, műfordító",
    img: "https://csikszeredaikonyvvasar.ro/wp-content/uploads/2023/04/Lackfi_Janos-scaled.jpg",
    url: "https://csikszeredaikonyvvasar.ro/lackfi-janos/",
    gradient: "from-emerald-500 to-teal-700",
  },
  {
    name: "André Ferenc",
    role: "erdélyi magyar prózaíró",
    img: "https://csikszeredaikonyvvasar.ro/wp-content/uploads/2023/04/Andre_Ferenc-scaled-e1681813769730.jpg",
    url: "https://csikszeredaikonyvvasar.ro/andre-ferenc/",
    gradient: "from-amber-500 to-orange-700",
  },
  {
    name: "László Noémi",
    role: "erdélyi magyar költő",
    img: "https://csikszeredaikonyvvasar.ro/wp-content/uploads/2023/04/Laszlo_Noemi-scaled-e1681813715348.jpg",
    url: "https://csikszeredaikonyvvasar.ro/laszlo-noemi/",
    gradient: "from-rose-500 to-pink-700",
  },
  {
    name: "Tasi Katalin",
    role: "irodalomtörténész, kritikus",
    img: "https://csikszeredaikonyvvasar.ro/wp-content/uploads/2023/04/Tasi_Kata-scaled.jpg",
    url: "https://csikszeredaikonyvvasar.ro/tasi-katalin/",
    gradient: "from-cyan-500 to-sky-700",
  },
];

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

function BookFairSection() {
  const { data: event, isLoading } = useGetEvent("2");
  const timeLeft = useCountdown(event?.startDate ?? null);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section style={{ background: "linear-gradient(180deg, #f0f6ff 0%, #dbeafe 40%, #1e3a6e 100%)" }}>
      {/* ── Event card ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-0">
        {isLoading ? (
          <Skeleton className="h-72 rounded-3xl mb-0" />
        ) : event ? (
          <div className="grid md:grid-cols-2 gap-0 rounded-t-3xl overflow-hidden shadow-2xl">
            {/* Left: details + countdown */}
            <div className="p-8 md:p-10 flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffdf7 0%, #fff8ed 100%)" }}>
              <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ background: "#fff3cd", border: "1px solid #f59e0b44" }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#d97706" }}>
                    Kiemelt program · {new Date(event.startDate).getFullYear()}
                  </span>
                </div>
                {/* Title in könyvvásár style */}
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Csíkszeredai</p>
                  <h2 className="text-4xl md:text-5xl font-black leading-none" style={{ color: "#d97706" }}>
                    Könyvvásár
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">{event.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-6">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {formatShortDate(event.startDate)}{event.endDate ? ` – ${formatShortDate(event.endDate)}` : ""}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {event.location}
                  </span>
                  {event.price && (
                    <span className="flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-blue-600" />
                      {event.price}
                    </span>
                  )}
                </div>
              </div>
              {/* Countdown */}
              <div>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {[
                    { value: pad(timeLeft.days), label: "NAP" },
                    { value: pad(timeLeft.hours), label: "ÓRA" },
                    { value: pad(timeLeft.minutes), label: "PERC" },
                    { value: pad(timeLeft.seconds), label: "MP" },
                  ].map(({ value, label }) => (
                    <div key={label} className="flex flex-col items-center justify-center rounded-xl py-3" style={{ background: "#1e3a6e" }}>
                      <span className="text-xl font-bold leading-none text-white">{value}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: "#93c5fd" }}>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Link href={`/esemeny/${event.id}`}>
                    <button className="flex items-center gap-1.5 px-5 py-2.5 font-bold text-sm rounded-xl text-white transition-colors" style={{ background: "#d97706" }}>
                      Teljes program <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <a href="https://csikszeredaikonyvvasar.ro" target="_blank" rel="noopener noreferrer">
                    <button className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors">
                      Hivatalos oldal
                    </button>
                  </a>
                </div>
              </div>
            </div>
            {/* Right: poster */}
            <div className="relative min-h-[320px]">
              <img src={event.imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(30,58,110,0.5) 0%, transparent 60%)" }} />
              {event.category && (
                <div className="absolute top-4 left-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: event.category.color }}>
                    {event.category.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Guests ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Meghívott vendégek</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">A könyvvásár sztárjai</h2>
          </div>
          <a
            href="https://csikszeredaikonyvvasar.ro/meghivottak/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors"
          >
            Összes részlet <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {BOOK_FAIR_GUESTS.map((guest, i) => (
            <motion.a
              key={guest.name}
              href={guest.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="group flex flex-col items-center text-center"
            >
              <div className={`relative w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-gradient-to-br ${guest.gradient} ring-2 ring-white/10 group-hover:ring-white/40 transition-all duration-300`}>
                <img
                  src={guest.img}
                  alt={guest.name}
                  className="w-full h-full object-cover object-top mix-blend-luminosity opacity-85 group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <p className="font-bold text-sm text-white leading-tight">{guest.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "#93c5fd" }}>{guest.role}</p>
            </motion.a>
          ))}
        </div>

        <div className="flex justify-center mt-6 md:hidden">
          <a href="https://csikszeredaikonyvvasar.ro/meghivottak/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors">
            Összes részlet <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── VENUES MAP ─────────────────────────────────────────────────────────────

const VENUES = [
  { name: "Csíki Játékszín", color: "#e879f9", categories: "fesztivál, tánc, zene", events: ["Tánc Világnapja – Gálaest", "Kórustalálkozó"] },
  { name: "Csíki Székely Múzeum", color: "#60a5fa", categories: "kiállítás, kultúra", events: ["Cobe Sights – Csodálatos Látványok", "Sík Múzeum Vasárnapokon"] },
  { name: "Csíkszeredai Városközpont", color: "#4ade80", categories: "fesztivál, közösségi", events: ["Csíki Majális – A családok hétvégéje"] },
  { name: "Vákár Lajos Sportpálya", color: "#fbbf24", categories: "sport", events: ["Nyújtón a Sólyom – Sportnapok"] },
];

function VenuesSection() {
  return (
    <section id="helyszinek" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Helyszínek</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Hol történik?</h2>
          <p className="text-muted-foreground text-sm">A város legfontosabb kulturális helyszínei egy pillantásra.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Map embed */}
          <div className="rounded-2xl overflow-hidden border border-card-border shadow-sm" style={{ height: "420px" }}>
            <iframe
              title="Csíkszereda térkép"
              src="https://www.openstreetmap.org/export/embed.html?bbox=25.7800%2C46.3500%2C25.8300%2C46.3900&layer=mapnik&marker=46.3690%2C25.8020"
              className="w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>

          {/* Venue list */}
          <div className="space-y-3">
            {VENUES.map((venue, i) => (
              <motion.div
                key={venue.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="bg-card border border-card-border rounded-2xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: venue.color + "22" }}>
                    <Building2 className="w-4 h-4" style={{ color: venue.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h3 className="font-bold text-sm text-foreground">{venue.name}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{venue.events.length} program</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{venue.categories}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {venue.events.map(ev => (
                        <span key={ev} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground line-clamp-1 max-w-[180px]">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ADD EVENT ───────────────────────────────────────────────────────────────

function AddEventSection() {
  return (
    <section id="hozzaadas" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-card-border rounded-3xl p-8 md:p-12 max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Van saját programod?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Töltsd fel saját programodat egy kattintással. A bejegyzés a böngészőben tárolódik, és azonnal megjelenik a naptárban, a hétvégi ajánlóban és a programlistában.
          </p>
          <ul className="space-y-2 mb-8 text-left max-w-sm mx-auto">
            {[
              "Lejárt események automatikusan eltűnnek a felületről.",
              "Kategóriák és helyszín szerint szűrhető.",
              "Részletek modálban nyílnak meg, mint a többi esemény.",
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-white font-bold rounded-xl hover:bg-foreground/90 transition-colors">
            <Plus className="w-4 h-4" />
            Esemény hozzáadása
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div>
      <Hero />
      <Picks />
      <WeeklyCalendar />
      <UpcomingEvents />
      <MonthHighlight />
      <BookFairSection />
      <CinemaSection />
      <VenuesSection />
      <AddEventSection />
    </div>
  );
}
