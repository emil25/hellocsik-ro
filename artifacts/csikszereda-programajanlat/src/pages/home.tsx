import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, ArrowRight, Sparkles, Calendar, ChevronLeft, ChevronRight, Ticket, ExternalLink, Plus, CheckCircle2, Building2, Pencil } from "lucide-react";
import { Link } from "wouter";
import helloCsikLogo from "@/assets/hellocsik-logo-nobg.png";
import {
  useListFeaturedEvents,
  useListThisWeekEvents,
  useListUpcomingEvents,
  useGetMonthHighlight,
  useListCategories,
  useListEvents,
  useGetEvent,
  useListBanners,
  type Event as ApiEvent,
  type Banner,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime, formatShortDate } from "@/utils/date-format";

function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("admin_token"));
  }, []);
  return isAdmin;
}

// ─── HERO ───────────────────────────────────────────────────────────────────

const STARS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  w: (((i * 7 + 3) % 20) / 10 + 0.8),
  top: ((i * 37 + 11) % 100),
  left: ((i * 53 + 17) % 100),
  opacity: ((i * 19 + 5) % 50) / 100 + 0.08,
  delay: ((i * 11) % 30) / 10,
  dur: ((i * 7) % 25) / 10 + 2.5,
}));

function Hero() {
  const { data, isLoading } = useListFeaturedEvents();
  const events = data?.events ?? [];

  return (
    <section
      className="relative overflow-x-hidden min-h-[700px] flex items-center"
    >
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/b/b9/RO_HR_Miercurea_Ciuc_Miko_castle.jpg)`,
        }}
      />

      {/* Dark overlay – heavier on left for text legibility, lighter on right */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, rgba(5,15,8,0.88) 0%, rgba(5,15,8,0.70) 50%, rgba(5,15,8,0.45) 100%)",
        }}
      />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(5,15,8,0.6))" }} />

      {/* Subtle green tint overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(34,100,60,0.18) 0%, transparent 65%)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: text with staggered entrance */}
        <div>
          <motion.img
            src={helloCsikLogo}
            alt="hellocsík"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="h-16 md:h-20 w-auto mb-6 drop-shadow-lg"
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/8"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400/50" />
            <span className="text-xs font-semibold text-white/75 uppercase tracking-wider">Élő · Csíkszereda Események</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5"
          >
            Mi újság{" "}
            <span
              className="block italic"
              style={{
                fontFamily: "'Playfair Display', serif",
                background: "linear-gradient(90deg, #fbbf24 0%, #f59e0b 45%, #fcd34d 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Csíkszereda?
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className="text-white/60 text-base leading-relaxed mb-9 max-w-md"
          >
            Koncertek, fesztiválok, színház, kiállítások és közösségi programok –
            minden, amit a városban érdemes megnézni, egy helyen, friss információkkal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            <a href="#kozelgo">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-foreground font-semibold text-sm hover:bg-white/92 transition-all shadow-lg shadow-white/10">
                Böngészd a programokat
                <ArrowRight className="w-4 h-4" />
              </button>
            </a>
            <a href="#hetvege">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/25 text-white font-semibold text-sm hover:bg-white/12 transition-all"
                style={{ backdropFilter: "blur(6px)", background: "rgba(255,255,255,0.07)" }}>
                <Sparkles className="w-4 h-4" />
                Ezen a hétvégén
              </button>
            </a>
            <a href="#picks">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white transition-all hover:opacity-90 shadow-lg"
                style={{ background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}>
                <Calendar className="w-4 h-4" />
                Közelgők
              </button>
            </a>
          </motion.div>
        </div>

        {/* Right: featured event card + upcoming mini-list */}
        <div className="hidden md:flex flex-col gap-3">
          {/* Big featured card – gently floats */}
          {!isLoading && events[0] && (
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0, 5, 0] }}
              transition={{
                opacity: { duration: 0.6, delay: 0.3 },
                scale:   { duration: 0.6, delay: 0.3 },
                y: { duration: 5.5, delay: 0.8, repeat: Infinity, ease: "easeInOut" },
              }}
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.1)" }}
            >
              {/* Cover image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={events[0].imageUrl}
                  alt={events[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)" }} />
                {events[0].category && (
                  <span
                    className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full text-white uppercase tracking-wide"
                    style={{ backgroundColor: events[0].category.color ?? "#166534" }}
                  >
                    {events[0].category.name}
                  </span>
                )}
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Kiemelt
                </span>
              </div>
              {/* Card body */}
              <div className="bg-white p-4">
                <p className="font-bold text-sm text-foreground leading-snug mb-1.5 line-clamp-2">
                  {events[0].title}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" />
                    {formatShortDate(events[0].startDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    {events[0].location?.split("–")[0].trim()}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-primary">
                    {events[0].price ?? "Ingyenes"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {events[0].ticketUrl && (() => {
                      const url = events[0].ticketUrl!;
                      const price = events[0].price;
                      const isFb = url.includes("facebook.com") || url.includes("fb.com") || url.includes("fb.me");
                      const isFree = !price || price.toLowerCase().includes("ingyenes");
                      const label = isFb ? "Facebook" : isFree ? "Részletek" : "Jegy";
                      const bg = isFb ? "#1877f2" : isFree ? "#64748b" : "hsl(35 92% 50%)";
                      return (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <button className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full text-white transition-colors"
                            style={{ background: bg }}>
                            {!isFb && !isFree && <Ticket className="w-2.5 h-2.5" />}
                            {label}
                          </button>
                        </a>
                      );
                    })()}
                    <Link href={`/esemeny/${events[0].id}`}>
                      <button className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full text-white transition-colors"
                        style={{ background: "hsl(148 45% 22%)" }}>
                        Részletek <ArrowRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2 mini event cards side by side */}
          {!isLoading && events.slice(1, 3).length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {events.slice(1, 3).map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.12 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.09)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="relative h-24 overflow-hidden">
                    <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)" }} />
                    {ev.category && (
                      <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: (ev.category.color ?? "#166534") + "cc" }}>
                        {ev.category.name}
                      </span>
                    )}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-xs font-bold text-white leading-snug line-clamp-2 mb-1">{ev.title}</p>
                    <p className="text-[10px] text-white/55 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />{formatShortDate(ev.startDate)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── WEEKLY CALENDAR ────────────────────────────────────────────────────────

function WeeklyCalendar() {
  const { data, isLoading } = useListThisWeekEvents();
  const { data: catData } = useListCategories();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
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

  const filteredDayEvents = selectedDayData
    ? (selectedCat
        ? selectedDayData.events.filter(ev => ev.categoryId === selectedCat)
        : selectedDayData.events)
    : [];

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
          ) : filteredDayEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm w-full text-center">
              Nincs ilyen kategóriájú esemény ezen a napon.
            </p>
          ) : (
            <div className="w-full space-y-2">
              {filteredDayEvents.map(ev => (
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
          <button
            onClick={() => setSelectedCat(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              selectedCat === null ? "bg-foreground text-white" : "border border-border bg-card text-foreground hover:border-primary/30"
            }`}
          >
            Mind <span className={`text-xs ${selectedCat === null ? "text-white/70" : "text-muted-foreground"}`}>{totalCount}</span>
          </button>
          {categories.filter(cat => (catCounts[cat.id] ?? 0) > 0).map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCat === cat.id
                  ? "text-white"
                  : "border border-border bg-card text-foreground hover:border-primary/30"
              }`}
              style={selectedCat === cat.id ? { backgroundColor: cat.color } : {}}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedCat === cat.id ? "rgba(255,255,255,0.7)" : cat.color }} />
              {cat.name} <span className={`text-xs ${selectedCat === cat.id ? "text-white/70" : "text-muted-foreground"}`}>{catCounts[cat.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── UPCOMING EVENTS ────────────────────────────────────────────────────────

function UpcomingEvents() {
  const { data, isLoading } = useListUpcomingEvents({ limit: 50 });
  const { data: catData } = useListCategories();
  const { data: bannerData } = useListBanners();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const isAdmin = useIsAdmin();
  const rawEvents = data?.events ?? [];
  const categories = catData?.categories ?? [];
  const activeBanners: Banner[] = (bannerData?.banners ?? []).slice().sort((a, b) => a.position - b.position);

  // Featured events first, then the rest by date
  const sorted = [
    ...rawEvents.filter(e => e.featured),
    ...rawEvents.filter(e => !e.featured),
  ];
  const events = selectedCategoryId
    ? sorted.filter(e => e.categoryId === selectedCategoryId)
    : sorted;
  const featuredCount = sorted.filter(e => e.featured).length;

  // Count per category
  const catCounts: Record<number, number> = {};
  rawEvents.forEach(e => { if (e.categoryId) catCounts[e.categoryId] = (catCounts[e.categoryId] ?? 0) + 1; });

  return (
    <section id="kozelgo" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Közelgő programok</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Hamarosan Csíkszeredában</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {sorted.length} program · {featuredCount > 0 && <span className="font-medium text-amber-600">{featuredCount} kihagyhatatlan</span>}
            </p>
          </div>
          <a href="#naptar" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            Naptár nézet <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              selectedCategoryId === null ? "bg-foreground text-white" : "border border-border bg-card text-foreground hover:border-primary/30"
            }`}
          >
            Összes <span className={`text-xs ${selectedCategoryId === null ? "text-white/70" : "text-muted-foreground"}`}>{sorted.length}</span>
          </button>
          {categories.filter(cat => (catCounts[cat.id] ?? 0) > 0).map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategoryId === cat.id ? "text-white" : "border border-border bg-card text-foreground hover:border-primary/30"
              }`}
              style={selectedCategoryId === cat.id ? { backgroundColor: cat.color } : {}}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedCategoryId === cat.id ? "rgba(255,255,255,0.7)" : cat.color }} />
              {cat.name}
              <span className={`text-xs ${selectedCategoryId === cat.id ? "text-white/70" : "text-muted-foreground"}`}>{catCounts[cat.id]}</span>
            </button>
          ))}
        </div>

        {/* Editorial grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({length: 6}).map((_,i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : (() => {
          type Ev = typeof events[number];
          // Slot = either an event or a card-banner occupying one grid cell
          type Slot = { kind: 'event'; ev: Ev } | { kind: 'card-banner'; banner: Banner };
          type Row =
            | { kind: 'featured'; feat: Ev; companions: Slot[]; featLeft: boolean }
            | { kind: 'regular'; items: Slot[] };
          type MergedItem = { kind: 'row'; row: Row } | { kind: 'full-banner'; banner: Banner };

          const visible = showAll ? events : events.slice(0, 12);

          // Split banners by type
          const cardBanners = activeBanners.filter(b => b.displayType === 'card');
          const fullBanners  = activeBanners.filter(b => b.displayType === 'full');

          // Build slot pool: events + card-banners merged at their position index
          const slots: Slot[] = [];
          let cbi = 0;
          for (let i = 0; i <= visible.length; i++) {
            while (cbi < cardBanners.length && cardBanners[cbi].position <= i) {
              slots.push({ kind: 'card-banner', banner: cardBanners[cbi++] });
            }
            if (i < visible.length) slots.push({ kind: 'event', ev: visible[i] });
          }

          // Build rows from slot pool
          const rows: Row[] = [];
          let si = 0;
          let featRowIdx = 0;
          while (si < slots.length) {
            const slot = slots[si];
            if (slot.kind === 'event' && slot.ev.featured) {
              si++;
              const companions: Slot[] = [];
              while (companions.length < 2 && si < slots.length) companions.push(slots[si++]);
              rows.push({ kind: 'featured', feat: slot.ev, companions, featLeft: featRowIdx % 2 === 0 });
              featRowIdx++;
            } else {
              const batch: Slot[] = [];
              while (si < slots.length && batch.length < 3) {
                const s = slots[si];
                if (s.kind === 'event' && s.ev.featured) break;
                batch.push(slots[si++]);
              }
              if (batch.length > 0) rows.push({ kind: 'regular', items: batch });
            }
          }

          // Inject full-banners between rows based on cumulative event count
          const merged: MergedItem[] = [];
          const pendingFull = fullBanners.slice();
          let eventsRendered = 0;
          for (const row of rows) {
            while (pendingFull.length > 0 && pendingFull[0].position <= eventsRendered) {
              merged.push({ kind: 'full-banner', banner: pendingFull.shift()! });
            }
            merged.push({ kind: 'row', row });
            const evCount = row.kind === 'featured'
              ? 1 + row.companions.filter(s => s.kind === 'event').length
              : row.items.filter(s => s.kind === 'event').length;
            eventsRendered += evCount;
          }
          while (pendingFull.length > 0) merged.push({ kind: 'full-banner', banner: pendingFull.shift()! });

          // ── Card renderers ──────────────────────────────────────────────
          const CardBannerSlot = ({ banner: b }: { banner: Banner }) => {
            const inner = (
              <div className="w-full rounded-2xl overflow-hidden border border-border/40 shadow-sm h-full" style={{ minHeight: '160px' }}>
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" style={{ aspectRatio: '16/9' }} />
              </div>
            );
            return b.linkUrl
              ? <a href={b.linkUrl} target="_blank" rel="noopener noreferrer" className="block h-full">{inner}</a>
              : inner;
          };

          const EventCard = ({ ev: event, aspectRatio = '16/9' }: { ev: Ev; aspectRatio?: string }) => (
            <Link href={`/esemeny/${event.id}`}>
              <div className="group cursor-pointer bg-card rounded-2xl overflow-hidden border border-card-border hover:border-primary/20 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                <div className="relative overflow-hidden" style={{ aspectRatio }}>
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {event.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: event.category.color }}>{event.category.name}</span>
                    )}
                  </div>
                  {isAdmin && (
                    <a href="/admin" onClick={e => e.stopPropagation()} className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold hover:bg-black/90 transition-colors">
                      <Pencil className="w-2.5 h-2.5" /> Szerkeszt
                    </a>
                  )}
                  {event.price && event.price !== "Ingyenes" && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 rounded-lg px-2 py-1 shadow-sm">
                      <Ticket className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] font-semibold text-foreground">{event.price}</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatShortDate(event.startDate)}</span>
                    <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{event.location?.split("–")[0].trim()}</span></span>
                  </div>
                  <h3 className="font-bold text-base text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors flex-1">{event.title}</h3>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">{!event.price || event.price === "Ingyenes" ? "Ingyenes" : event.price}</span>
                    <span className="flex items-center gap-1 text-primary text-xs font-bold">Részletek <ArrowRight className="w-3 h-3" /></span>
                  </div>
                </div>
              </div>
            </Link>
          );

          const FeaturedCard = ({ ev: event, featLeft }: { ev: Ev; featLeft: boolean }) => (
            <Link href={`/esemeny/${event.id}`}>
              <div className="group cursor-pointer rounded-2xl overflow-hidden border-2 border-amber-300/70 shadow-lg shadow-amber-100/50 ring-1 ring-amber-200/40 bg-gradient-to-br from-amber-50/60 to-card transition-all duration-300 hover:shadow-xl hover:border-amber-400/80 h-full flex flex-col">
                <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full text-white shadow" style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>
                      <Sparkles className="w-2.5 h-2.5" /> Kihagyhatatlan
                    </span>
                    {event.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: event.category.color }}>{event.category.name}</span>
                    )}
                  </div>
                  {isAdmin && (
                    <a href="/admin" onClick={e => e.stopPropagation()} className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold hover:bg-black/90 transition-colors">
                      <Pencil className="w-2.5 h-2.5" /> Szerkeszt
                    </a>
                  )}
                  {event.price && event.price !== "Ingyenes" && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 rounded-full px-2.5 py-1 shadow">
                      <Ticket className="w-3 h-3 text-amber-600" />
                      <span className="text-[11px] font-bold text-amber-700">{event.price}</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatShortDate(event.startDate)}</span>
                    <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{event.location?.split("–")[0].trim()}</span></span>
                  </div>
                  <h3 className="font-bold text-base text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors flex-1">{event.title}</h3>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-amber-200/60">
                    <span className="text-xs text-muted-foreground">{!event.price || event.price === "Ingyenes" ? "Ingyenes" : event.price}</span>
                    <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">Részletek <ArrowRight className="w-3 h-3" /></span>
                  </div>
                </div>
              </div>
            </Link>
          );

          const SlotCell = ({ slot, idx }: { slot: Slot; idx: number }) =>
            slot.kind === 'card-banner'
              ? <CardBannerSlot banner={slot.banner} />
              : <EventCard ev={slot.ev} />;

          let globalIdx = 0;
          return (
            <div className="flex flex-col gap-5">
              {merged.map((item, itemIdx) => {
                // ── Full-width banner (breaks row) ──────────────────────
                if (item.kind === 'full-banner') {
                  const b = item.banner;
                  const inner = (
                    <div className="w-full rounded-2xl overflow-hidden border border-border/40 shadow-sm">
                      <img src={b.imageUrl} alt={b.title} className="w-full object-cover" style={{ maxHeight: '220px', objectFit: 'cover' }} />
                    </div>
                  );
                  return (
                    <motion.div key={`fb-${b.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                      {b.linkUrl
                        ? <a href={b.linkUrl} target="_blank" rel="noopener noreferrer">{inner}</a>
                        : inner}
                    </motion.div>
                  );
                }

                const { row } = item;

                // ── Event row ───────────────────────────────────────────
                if (row.kind === 'regular') {
                  return (
                    <div key={itemIdx} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {row.items.map((slot, ci) => {
                        const idx = globalIdx++;
                        return (
                          <motion.div key={slot.kind === 'card-banner' ? `cb-${slot.banner.id}` : slot.ev.id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04, duration: 0.38 }}>
                            <SlotCell slot={slot} idx={idx} />
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                }

                // Featured row
                const featIdx = globalIdx++;
                globalIdx += row.companions.length;
                const featCell = <FeaturedCard ev={row.feat} featLeft={row.featLeft} />;
                const companionCells = row.companions.map((slot, ci) => (
                  <div key={slot.kind === 'card-banner' ? `cb-${slot.banner.id}` : slot.ev.id}>
                    <SlotCell slot={slot} idx={featIdx + 1 + ci} />
                  </div>
                ));
                const cells = row.featLeft
                  ? [<div key="feat">{featCell}</div>, ...companionCells]
                  : [...companionCells, <div key="feat">{featCell}</div>];

                return (
                  <motion.div key={itemIdx} className="grid grid-cols-1 md:grid-cols-3 gap-5"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: featIdx * 0.04, duration: 0.38 }}>
                    {cells}
                  </motion.div>
                );
              })}
            </div>
          );
        })()}

        {/* "See all" button */}
        {!isLoading && events.length > 12 && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center gap-2 px-8 py-3 rounded-full border-2 border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all"
            >
              Összes {sorted.length} program megtekintése <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
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
              {event.ticketUrl && (() => {
                const url = event.ticketUrl!;
                const isFb = url.includes("facebook.com") || url.includes("fb.com") || url.includes("fb.me");
                const isFree = !event.price || event.price.toLowerCase().includes("ingyenes");
                const label = isFb ? "Facebook esemény" : isFree ? "Részletek" : "Jegyvásárlás";
                const style = isFb
                  ? { background: "#1877f2", color: "white" }
                  : isFree
                  ? { border: "1px solid #e2e8f0", color: "#374151" }
                  : { background: "hsl(35 92% 50%)", color: "white" };
                return (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors hover:opacity-90" style={style}>
                      {!isFb && !isFree && <Ticket className="w-4 h-4" />}
                      {label} <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  </a>
                );
              })()}
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
    title: "Leg\u00e9nyb\u00facs\u00fa",
    date: "J\u00fan. 4\u20136.",
    badge: "M\u0170SORON",
    image: "/movie-legenybucsu.png",
  },
  {
    id: "m2",
    title: "Black Bag",
    date: "J\u00fan. 4\u20136.",
    badge: "M\u0170SORON",
    image: "/movie-black-bag.jpg",
  },
  {
    id: "m3",
    title: "Michael",
    date: "J\u00fan. 4\u20136.",
    badge: "M\u0170SORON",
    image: "/movie-michael.png",
  },
  {
    id: "m4",
    title: "Jurassic World: \u00dajj\u00e1sz\u00fclet\u00e9s",
    date: "J\u00fan. 12-t\u0151l",
    badge: "HAMAROSAN",
    image: "/movie-jurassic-world-rebirth.jpg",
  },
];

const badgeColors: Record<string, string> = {
  "MŰSORON": "#166534",
  "PREMIER": "#e53935",
  "HAMAROSAN": "#6b7280",
};

const REGIZENE_PERFORMERS = [
  "Baroque Festival Orchestra",
  "Barozda '50 – Ünnepi hangverseny",
  "Concerto Spiralis & Kónya István",
  "Tessa Roos & Peter Croton",
  "Vitárius Piroska & Fülöp Mária",
  "Amaryllis Régizene Együttes",
  "Musica Historica",
  "Carmina Renascentia",
  "Kamerata Barcense",
  "Pax et Bonum Kamarakórus",
];

function RegiZeneFesztivalSection() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Fejléc */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-secondary">✦</span>
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Kiemelt fesztivál · 1980 óta</span>
        </div>

        {/* Banner kártya */}
        <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid #e5d5c5" }}>

          {/* Plakát — teljes szélességű, jól látható */}
          <div className="relative w-full" style={{ aspectRatio: "21/9" }}>
            <img
              src="/regizene-fesztival-2026.jpg"
              alt="Csíkszeredai Régizene Fesztivál 2026 plakát"
              className="w-full h-full object-cover object-top"
            />
            {/* Csak alul halvány átmenet a szöveghez */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{ background: "linear-gradient(to bottom, transparent, rgba(26,8,4,0.85))" }} />
            {/* Dátum + helyszín a plakáton */}
            <div className="absolute bottom-4 left-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <Calendar className="w-3.5 h-3.5" style={{ color: "#f4c88a" }} />
                <span className="text-xs font-semibold text-white">2026. július 6–12.</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <MapPin className="w-3.5 h-3.5" style={{ color: "#f4c88a" }} />
                <span className="text-xs font-semibold text-white">Csíkszereda több helyszínén</span>
              </div>
            </div>
          </div>

          {/* Szöveg rész — világos háttér */}
          <div className="px-6 py-6" style={{ background: "#fdf6f0" }}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

              <div className="flex-1">
                <h3 className="text-xl font-bold text-primary mb-1">Csíkszeredai Régizene Fesztivál 2026</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Románia egyik legnagyobb múltra visszatekintő zenei fesztiválja — 7 nap, hazai és nemzetközi együttesekkel.
                </p>

                {/* Meghívottak */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Meghívott előadók</p>
                  <div className="flex flex-wrap gap-1.5">
                    {REGIZENE_PERFORMERS.map((name) => (
                      <span key={name} className="px-2.5 py-1 rounded-full text-xs font-medium bg-card border border-card-border text-foreground">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gombok */}
              <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                <a href="https://regizene.ro/fesztivalprogram/" target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white hover:opacity-90 transition-opacity w-full justify-center" style={{ background: "#8b1a1a" }}>
                    Fesztiválprogram <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </a>
                <a href="https://regizene.ro" target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-muted transition-colors w-full justify-center" style={{ border: "1px solid #e2d0c0", color: "#5a3a2a" }}>
                    regizene.ro <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

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

const MAJALIS_DAYS = [
  {
    id: "pentek",
    label: "Péntek",
    date: "máj. 29.",
    img: "/majalis-pentek.jpg",
    badge: "Nyitónap",
    lead: "Megnyitjuk a kapukat! Jó hangulat, zene és közösségi élmények a parkban.",
    schedule: [
      { time: "15:00", label: "Kapunyitás" },
      { time: "15:00–19:00", label: "Helyi és kézműves termékek vására" },
      { time: "17:00", label: "Oláh Ferenc és zenekara · Biró Éva és Szilágyi Sándor nótaénekesek" },
      { time: "18:00", label: "Hargita Székely Néptáncszínház – folklór műsor" },
      { time: "19:00", label: "Kedves zenekar" },
    ],
  },
  {
    id: "szombat",
    label: "Szombat",
    date: "máj. 30.",
    img: "/majalis-gyerek-foglalkozas.jpg",
    badge: "Családi nap",
    lead: "Egész napos program a parkban – kézművesek, gyerekfoglalkozások, kulturális fellépők és közösségi főzés.",
    schedule: [
      { time: "09:00", label: "Közösségi főzés – gyülekező" },
      { time: "10:00", label: "Kapunyitás" },
      { time: "10:00–19:00", label: "Helyi és kézműves termékek vására" },
      { time: "10:00–20:00", label: "Dreambox és retrobooth fotódoboz" },
      { time: "10:00–18:00", label: "Gyerekfoglalkozások (népi bútorfestés, bőrműves, fajátékok, arcfestés, ugrálóvárak, VR-szék, bungee jumping és még sok más)" },
      { time: "12:00", label: "Csíkszeredai fúvószenekar" },
      { time: "12:30", label: "Csíkszentgyörgy község ifjúsági kórusa és zenekara" },
      { time: "13:00", label: "Sárga Rózsák Dalkör · Csíkrákosi Sárosi Bálint Dalkör" },
      { time: "13:30", label: "Szívecskék aerobik · Csíki reménység dalkör · Gerendely férfikórus" },
      { time: "14:30", label: "FitGym ritmikus gimnasztika" },
      { time: "15:00", label: "Közösségi főzés – nyitott ebéd · Vaszi Levente" },
      { time: "15:30", label: "Csíkszentgyörgyi Fiság néptánccsoport · Mereklye néptánccsoport" },
      { time: "16:00", label: "Csíkcsomortáni Magyarok Nagyasszonya Néptánccsoport · Vaszi Levente" },
      { time: "16:20", label: "Csíkcsicsói Fehér Őszirózsák előadása" },
    ],
  },
  {
    id: "vasarnap",
    label: "Vasárnap",
    date: "máj. 31.",
    img: "/majalis-gyerek.jpg",
    badge: "Zenés nap",
    lead: "Kézművesek, gyerekprogramok, magyarnóta és esti koncertek a Központi Parkban.",
    schedule: [
      { time: "10:00", label: "Kapunyitás" },
      { time: "10:00–19:00", label: "Helyi és kézműves termékek vására" },
      { time: "10:00–20:00", label: "Dreambox és retrobooth fotódoboz" },
      { time: "10:00–18:00", label: "Gyerekfoglalkozások (népi bútorfestés, bőrműves, fajátékok, arcfestés, ugrálóvárak és még sok más)" },
      { time: "17:00", label: "\u201EMuzsikánál nincs jobb barát\u201D \u2013 magyarnóta műsor a Csíkmadarasi Népi Zenekar előadásában · Regián Melinda, Sövér Benedek Tímea, Dobos Zsolt és Petres Tibor" },
      { time: "19:00", label: "Néked zenekar" },
      { time: "20:00", label: "No Sugar zenekar" },
    ],
  },
  {
    id: "hetfo",
    label: "Hétfő",
    date: "jún. 1.",
    img: "/majalis-gyerek-foglalkozas.jpg",
    badge: "Záróünnep",
    lead: "Gyereknapot ünneplünk! Gyerekfoglalkozások, kürtőskalács és egy különleges filmvetítés zárja az ünnepet.",
    schedule: [
      { time: "10:00–14:00", label: "Szolgálati járművek kiállítása a Szabadság Téren" },
      { time: "10:00–18:00", label: "Gyerekfoglalkozások (fajátékok, kézműves, játszótér, fal- és ládamászás, slackline)" },
      { time: "15:00", label: "Kürtőskalács sütés a Borbély Kürtőskaláccsal" },
      { time: "18:00", label: "Ének a csodaszarvasról – Jankovics Marcell filmje (Cinema Csíki Mozi)" },
    ],
  },
];

function MajalisSection() {
  const { data: event, isLoading } = useGetEvent(3);
  const [activeDay, setActiveDay] = useState("pentek");

  if (isLoading) return <Skeleton className="h-[520px] rounded-none" />;
  if (!event) return null;

  const activeData = MAJALIS_DAYS.find((d) => d.id === activeDay)!;

  const dayColors: Record<string, { bg: string; text: string; shadow: string; pill: string }> = {
    pentek:   { bg: "linear-gradient(135deg,#16a34a,#15803d)", text: "#16a34a", shadow: "rgba(22,163,74,0.35)",   pill: "#f0fdf4" },
    szombat:  { bg: "linear-gradient(135deg,#f97316,#ea580c)", text: "#f97316", shadow: "rgba(249,115,22,0.35)",  pill: "#fff7ed" },
    vasarnap: { bg: "linear-gradient(135deg,#0ea5e9,#0284c7)", text: "#0ea5e9", shadow: "rgba(14,165,233,0.35)",  pill: "#f0f9ff" },
    hetfo:    { bg: "linear-gradient(135deg,#7c3aed,#6d28d9)", text: "#7c3aed", shadow: "rgba(124,58,237,0.35)",  pill: "#faf5ff" },
  };
  const dc = dayColors[activeDay] ?? dayColors.pentek;

  const LINEUP_BY_DAY: Record<string, { name: string; time: string; photo: string }[]> = {
    pentek: [
      { name: "Oláh Ferenc és Zenekara",        time: "17:00", photo: "/majalis-olah-ferenc.jpg" },
      { name: "Hargita Székely Néptáncszínház", time: "18:00", photo: "/majalis-hargita-szinhaz.jpg" },
      { name: "Kedves Zenekar",                 time: "19:00", photo: "/majalis-kedves-zenekar.jpg" },
      { name: "Tamás Balázs",                   time: "19:00", photo: "/majalis-tamas-balazs.jpg" },
    ],
    szombat: [
      { name: "Csíkszeredai Fúvószenekar",  time: "12:00", photo: "/majalis-csikszeredai-fuvoszenekar.jpg" },
      { name: "Sárga Rózsák Dalkör",        time: "13:00", photo: "/majalis-sarga-rozsakdalkor.jpg" },
      { name: "Csíki Reménység Dalkör",     time: "14:00", photo: "/majalis-csiki-remenyeseg-dalkor.jpg" },
      { name: "Vaszi Levente",              time: "15:15", photo: "/majalis-vaszi-levente.jpg" },
    ],
    vasarnap: [
      { name: "Csíkmadarasi Népi Zenekar", time: "17:00", photo: "/majalis-muzsikanel.jpg" },
      { name: "Néked Zenekar",             time: "19:00", photo: "/majalis-neked-zenekar.jpg" },
      { name: "No Sugar Zenekar",          time: "20:00", photo: "/majalis-nosugar-zenekar.jpg" },
    ],
    hetfo: [
      { name: "Biró Julcsi és a Lelkes Zenekar", time: "11:00", photo: "/majalis-gyermeknap-biro-julcsi.jpg" },
    ],
  };
  const activeLineup = LINEUP_BY_DAY[activeDay] ?? [];

  return (
    <section style={{ background: "linear-gradient(175deg, #0a2540 0%, #0d3321 55%, #0a2540 100%)" }}>

      {/* ── HERO PLAKÁT ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(280px, 40vw, 500px)" }}>
        <img src="/majalis-plakat.jpg" alt="Csíki Majális plakát"
          className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,37,64,0) 25%, rgba(10,37,64,0.6) 75%, rgba(10,37,64,1) 100%)" }} />
        <div className="absolute top-5 left-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(255,255,255,0.92)", color: "#16a34a", backdropFilter: "blur(8px)", boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}>
            <Sparkles className="w-3 h-3" /> Csíkszereda legnagyobb tavaszi ünnepe
          </span>
        </div>
      </div>

      {/* ── FŐ TARTALOM ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-12 relative z-10">

        {/* ── NAPI PROGRAM (teljes szélesség) ── */}
        <div>

          {/* Napi program */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "white", boxShadow: "0 8px 32px rgba(30,64,175,0.1)", border: "1px solid rgba(30,64,175,0.07)" }}>
            {/* Fejléc */}
            <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-4 rounded-full" style={{ background: "#16a34a" }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#16a34a" }}>Napok szerinti program</span>
              </div>
              {/* Nap-tabok */}
              <div className="grid grid-cols-4 gap-2">
                {MAJALIS_DAYS.map((day) => {
                  const active = activeDay === day.id;
                  const c = dayColors[day.id] ?? dayColors.pentek;
                  return (
                    <button key={day.id} onClick={() => setActiveDay(day.id)}
                      className="rounded-2xl py-3 px-2 text-center transition-all font-black text-sm"
                      style={active
                        ? { background: c.bg, color: "white", boxShadow: `0 4px 14px ${c.shadow}`, transform: "scale(1.04)" }
                        : { background: c.pill, color: c.text, border: `2px solid ${c.text}40` }}>
                      <span className="block text-[10px] font-bold mb-0.5 opacity-80">{day.date}</span>
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aktív nap tartalma */}
            <motion.div key={activeDay} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              className="px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest"
                  style={{ background: dc.pill, color: dc.text }}>{activeData.badge}</span>
                <p className="font-black text-sm" style={{ color: "#0f172a" }}>{activeData.label} · {activeData.date}</p>
              </div>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: "#64748b" }}>{activeData.lead}</p>

              <div className="flex flex-col">
                {activeData.schedule.map(({ time, label }, i) => (
                  <div key={time + label} className="flex items-stretch">
                    <div className="flex flex-col items-center mr-3" style={{ width: 16 }}>
                      <div className="w-2 h-2 rounded-full shrink-0 mt-3.5" style={{ background: dc.text }} />
                      {i < activeData.schedule.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "#e2e8f0" }} />}
                    </div>
                    <div className="pb-3.5 flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs font-black shrink-0" style={{ color: dc.text, minWidth: 64 }}>{time}</span>
                        <span className="text-sm leading-snug" style={{ color: "#334155" }}>{label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── AKTÍV NAP FELLÉPŐI (alul, teljes szélesség) ── */}
        {activeLineup.length > 0 && (
          <motion.div
            key={activeDay + "-lineup"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="mt-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 rounded-full" style={{ background: dc.text }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: dc.text }}>
                {activeData.label} fellépői
              </span>
            </div>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: activeLineup.length === 1
                  ? "minmax(0, 320px)"
                  : `repeat(${Math.min(activeLineup.length, 4)}, minmax(0, 1fr))`,
              }}
            >
              {activeLineup.map((p) => (
                <div key={p.name} className="rounded-2xl overflow-hidden flex flex-col"
                  style={{ background: "white", boxShadow: "0 6px 24px rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <div className="relative overflow-hidden" style={{ height: 200 }}>
                    <img src={p.photo} alt={p.name} className="w-full h-full object-cover object-center" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
                    <span className="absolute bottom-3 left-3 text-sm font-black px-3 py-1 rounded-full text-white"
                      style={{ background: dc.text }}>
                      {p.time}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="font-black text-base leading-snug" style={{ color: "#0f172a" }}>{p.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function FeaturedProgramSection() {
  return <MajalisSection />;
}

// ─── VENUES MAP ─────────────────────────────────────────────────────────────

const VENUE_COLORS = ["#e879f9", "#60a5fa", "#4ade80", "#fbbf24", "#f97316", "#a78bfa", "#34d399", "#fb7185"];

function VenuesSection() {
  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });

  const venues = useMemo(() => {
    const evs = data?.events ?? [];
    // Normalize venue names so minor variants map to a canonical form
    const ALIASES: Record<string, string> = {
      "Cinema Csíki Mozi": "Csíki Mozi",
      "Cinema Csiki Mozi": "Csíki Mozi",
    };
    const map = new Map<string, { titles: string[]; categories: Set<string> }>();
    for (const ev of evs) {
      if (!ev.location) continue;
      const raw = ev.location.split("–")[0].split("-")[0].trim();
      const name = ALIASES[raw] ?? raw;
      if (!map.has(name)) map.set(name, { titles: [], categories: new Set() });
      const entry = map.get(name)!;
      entry.titles.push(ev.title);
      if (ev.category?.name) entry.categories.add(ev.category.name);
    }
    return Array.from(map.entries())
      .map(([name, val]) => ({ name, titles: val.titles, categories: [...val.categories].join(", ") }))
      .sort((a, b) => b.titles.length - a.titles.length);
  }, [data]);

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

        <div className="flex flex-col gap-6">
          {/* Map – full width */}
          <div className="rounded-2xl overflow-hidden border border-card-border shadow-sm" style={{ height: "280px" }}>
            <iframe
              title="Csíkszereda térkép"
              src="https://www.openstreetmap.org/export/embed.html?bbox=25.7800%2C46.3500%2C25.8300%2C46.3900&layer=mapnik&marker=46.3690%2C25.8020"
              className="w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>

          {/* Venue grid – dynamic, 2–3 cols */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
            ) : venues.length === 0 ? (
              <p className="col-span-3 text-muted-foreground text-sm text-center py-8">Nincs közelgő esemény.</p>
            ) : (
              venues.map((venue, i) => {
                const color = VENUE_COLORS[i % VENUE_COLORS.length];
                return (
                  <motion.div
                    key={venue.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    className="bg-card border border-card-border rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "22" }}>
                        <Building2 className="w-4 h-4" style={{ color }} />
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
                        {venue.titles.length}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground leading-snug line-clamp-2">{venue.name}</p>
                      {venue.categories && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{venue.categories}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
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
            Küldd be programodat és mi átnézük, majd közzétesszük az oldalon. Az esemény megjelenik a naptárban, a hétvégi ajánlóban és a programlistában.
          </p>
          <ul className="space-y-2 mb-8 text-left max-w-sm mx-auto">
            {[
              "Lejárt események automatikusan eltűnnek a felületről.",
              "Kategóriák és helyszín szerint szűrhető.",
              "Jóváhagyás után azonnal megjelenik a főoldalon.",
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/bekuldese">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" />
              Program beküldése
            </button>
          </Link>
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
      <WeeklyCalendar />
      <UpcomingEvents />
      <RegiZeneFesztivalSection />
      <CinemaSection />
      <VenuesSection />
      <AddEventSection />
    </div>
  );
}
