import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, ArrowRight, Sparkles, Calendar, ChevronLeft, ChevronRight, Ticket, ExternalLink, Plus, CheckCircle2, Building2, Pencil } from "lucide-react";
import { Link } from "wouter";
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
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/8"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400/50" />
            <span className="text-xs font-semibold text-white/75 uppercase tracking-wider">Élő · Csíkszereda Események</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
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
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">
                    {events[0].price ?? "Ingyenes"}
                  </span>
                  <a href={events[0].ticketUrl ?? "#"} target="_blank" rel="noopener noreferrer">
                    <button className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full text-white transition-colors"
                      style={{ background: "hsl(148 45% 22%)" }}>
                      Részletek <ArrowRight className="w-3 h-3" />
                    </button>
                  </a>
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

        {/* Editorial grid: featured events break the row as 2/3+1/3, regular stay 3-col */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({length: 6}).map((_,i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : (() => {
          type Ev = typeof events[number];
          type Row =
            | { kind: 'featured'; feat: Ev; companions: Ev[]; featLeft: boolean }
            | { kind: 'regular'; items: Ev[] };

          const visible = showAll ? events : events.slice(0, 12);
          const rows: Row[] = [];
          let fi = 0;
          let featRowIdx = 0;

          while (fi < visible.length) {
            const ev = visible[fi];
            if (ev.featured) {
              fi++;
              const companions: Ev[] = [];
              while (companions.length < 2 && fi < visible.length) {
                companions.push(visible[fi++]);
              }
              rows.push({ kind: 'featured', feat: ev, companions, featLeft: featRowIdx % 2 === 0 });
              featRowIdx++;
            } else {
              const batch: Ev[] = [];
              while (fi < visible.length && !visible[fi].featured && batch.length < 3) {
                batch.push(visible[fi++]);
              }
              rows.push({ kind: 'regular', items: batch });
            }
          }

          // Build merged display with banners injected at correct positions
          type MergedItem =
            | { kind: 'row'; row: Row }
            | { kind: 'banner'; banner: Banner };

          const merged: MergedItem[] = [];
          const pendingBanners = activeBanners.slice();
          let eventsRendered = 0;

          for (const row of rows) {
            while (pendingBanners.length > 0 && pendingBanners[0].position <= eventsRendered) {
              merged.push({ kind: 'banner', banner: pendingBanners.shift()! });
            }
            merged.push({ kind: 'row', row });
            eventsRendered += row.kind === 'featured' ? 1 + row.companions.length : row.items.length;
          }
          while (pendingBanners.length > 0) {
            merged.push({ kind: 'banner', banner: pendingBanners.shift()! });
          }

          let globalIdx = 0;
          return (
            <div className="flex flex-col gap-5">
              {merged.map((item, itemIdx) => {
                if (item.kind === 'banner') {
                  const b = item.banner;
                  const inner = (
                    <div className={`w-full overflow-hidden rounded-2xl border border-border/40 shadow-sm ${b.displayType === 'card' ? 'max-w-sm' : ''}`}>
                      <img src={b.imageUrl} alt={b.title} className={`w-full object-cover ${b.displayType === 'full' ? 'max-h-32' : 'h-40'}`} />
                    </div>
                  );
                  return (
                    <motion.div key={`banner-${b.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                      className={b.displayType === 'card' ? '' : 'w-full'}>
                      {b.linkUrl
                        ? <a href={b.linkUrl} target="_blank" rel="noopener noreferrer">{inner}</a>
                        : inner}
                    </motion.div>
                  );
                }
                const row = item.row;
                const rowIdx = itemIdx;
                if (row.kind === 'regular') {
                  return (
                    <div key={rowIdx} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {row.items.map(event => {
                        const idx = globalIdx++;
                        return (
                          <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, duration: 0.38 }}>
                            <Link href={`/esemeny/${event.id}`}>
                              <div className="group cursor-pointer bg-card rounded-2xl overflow-hidden border border-card-border hover:border-primary/20 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                                <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
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
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                }

                // Featured row
                const featIdx = globalIdx++;
                globalIdx += row.companions.length;
                const FeatCard = ({ event, large }: { event: Ev; large: boolean }) => (
                  <Link href={`/esemeny/${event.id}`}>
                    <div className="group cursor-pointer rounded-2xl overflow-hidden border-2 border-amber-300/70 shadow-lg shadow-amber-100/50 ring-1 ring-amber-200/40 bg-gradient-to-br from-amber-50/60 to-card transition-all duration-300 hover:shadow-xl hover:border-amber-400/80 h-full flex flex-col">
                      <div className="relative overflow-hidden" style={{ aspectRatio: large ? "16/9" : "4/3" }}>
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
                        <h3 className={`font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors flex-1 ${large ? "text-xl" : "text-base"}`}>{event.title}</h3>
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-amber-200/60">
                          <span className="text-xs text-muted-foreground">{!event.price || event.price === "Ingyenes" ? "Ingyenes" : event.price}</span>
                          <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">Részletek <ArrowRight className="w-3 h-3" /></span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );

                const CompCard = ({ event }: { event: Ev }) => (
                  <Link href={`/esemeny/${event.id}`}>
                    <div className="group cursor-pointer bg-card rounded-2xl overflow-hidden border border-card-border hover:border-primary/20 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {event.category && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: event.category.color }}>{event.category.name}</span>
                          )}
                        </div>
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

                const featCard = <FeatCard event={row.feat} large={false} />;
                const compCards = row.companions.map(c => <CompCard key={c.id} event={c} />);

                const cells = row.featLeft
                  ? [featCard, ...compCards]
                  : [...compCards, featCard];

                return (
                  <motion.div key={rowIdx} className="grid grid-cols-1 md:grid-cols-3 gap-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: featIdx * 0.04, duration: 0.38 }}>
                    {cells.map((cell, ci) => <div key={ci}>{cell}</div>)}
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
    title: "Az ördög Pradát visel 2",
    date: "Máj. 11–",
    badge: "MŰSORON",
    image: API_IMG("uploads%2Fmovies%2F6ac8e919-0e75-4693-a1ea-9d729d12d580%2Fimages%2F6444-DEVIL-WEARS-PRADA-2-POSTER-RO_9031be11-f1c8-4aa3-92be-2999adeea8c9.jpg"),
  },
  {
    id: "m2",
    title: "Michael",
    date: "Máj. 11–",
    badge: "MŰSORON",
    image: API_IMG("uploads%2Fmovies%2F4757121f-8384-4fe1-a3c6-3ababa963985%2Fimages%2Fmichael_323dab3a-cdfa-405b-888e-8ed3c8e34287.jpg"),
  },
  {
    id: "m3",
    title: "A Birka-nyomozók",
    date: "Máj. 11–",
    badge: "MŰSORON",
    image: API_IMG("uploads%2Fmovies%2F51dfd8fc-c8f3-48e3-9567-c0dea35c3597%2Fimages%2Fsheep_a5191bfa-fede-4bfc-8324-810a4afab3b3.jpg"),
  },
  {
    id: "m4",
    title: "The Mandalorian & Grogu",
    date: "Máj. 11–",
    badge: "PREMIER",
    image: API_IMG("uploads%2Fmovies%2Ffe94253f-c88a-48a8-87c0-6e0185599b6f%2Fimages%2Fmandalorian_4acc94a3-36c5-476f-ab66-4289526817f1.jpg"),
  },
  {
    id: "m5",
    title: "Mumbo Jumbo",
    date: "Máj. 11–",
    badge: "MŰSORON",
    image: API_IMG("uploads%2Fmovies%2F51e8aae7-2148-4f48-a763-bb0c468573d2%2Fimages%2Fmumbo_b10c6372-5e84-48cf-8505-0ad8f63bf53b.jpg"),
  },
  {
    id: "m6",
    title: "Billie",
    date: "Máj. 11–",
    badge: "MŰSORON",
    image: API_IMG("uploads%2Fmovies%2Fcf3e1863-c52c-4187-be7b-e419fa5b06a5%2Fimages%2Fbillie_e246b6d9-f49b-4c5c-b815-80bb509e8467.jpg"),
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

// ─── TEDX SECTION (a hét eseménye) ──────────────────────────────────────────

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

const TEDX_SPEAKERS = [
  { name: "Martini Réka",         role: "Energiastratéga · MVM Csoport",   photo: "/tedx-speakers/martini.webp" },
  { name: "Dr. Munzlinger Attila",role: "Családorvos & asztrofotós",        photo: "/tedx-speakers/munzlinger.webp" },
  { name: "Vladimir Anton",       role: "Színházi rendező",                  photo: "/tedx-speakers/vladimir.webp" },
  { name: "Gáll Tímea",           role: "TEDx előadó",                       photo: "/tedx-speakers/gall.webp" },
  { name: "Hausmann Cecília",     role: "Luster Manufaktúra alapítója",      photo: "/tedx-speakers/hausmann.webp" },
  { name: "Józsa Csaba",          role: "TEDx előadó",                       photo: "/tedx-speakers/jozsa.webp" },
  { name: "Dósa Levente",         role: "TEDx előadó",                       photo: "/tedx-speakers/dosa.webp" },
  { name: "Fröhlich Orsolya",     role: "TEDx előadó",                       photo: "/tedx-speakers/frohlich.webp" },
  { name: "Füleki László",        role: "TEDx előadó",                       photo: "/tedx-speakers/fuleki.webp" },
  { name: "Bíró Bíborka Eszter",  role: "TEDx előadó",                       photo: "/tedx-speakers/biro-biborka.webp" },
  { name: "Bíró Boróka Júlia",    role: "TEDx előadó",                       photo: "/tedx-speakers/biro-boroka.webp" },
  { name: "Bujtor Zsófia",        role: "Néprajzkutató · ELTE",              photo: "/tedx-speakers/bujtor.webp" },
];

function TEDxSection() {
  const { data: event, isLoading } = useGetEvent(15);
  const timeLeft = useCountdown(event?.startDate ?? null);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0505 40%, #2a0808 100%)" }}>
      {/* ── Event card ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-0">

        {/* Section badge */}
        <div className="flex items-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "#E62B1E" }}>
            <span className="text-xs font-black uppercase tracking-widest text-white">A hét eseménye</span>
          </div>
          <div className="h-px flex-1 opacity-20" style={{ background: "linear-gradient(to right, #E62B1E, transparent)" }} />
        </div>

        {isLoading ? (
          <Skeleton className="h-80 rounded-3xl mb-0" style={{ background: "#1a1a1a" }} />
        ) : event ? (
          <div className="grid md:grid-cols-2 gap-0 rounded-t-3xl overflow-hidden" style={{ boxShadow: "0 25px 60px rgba(230,43,30,0.25)" }}>
            {/* Left: details */}
            <div className="p-8 md:p-10 flex flex-col justify-between" style={{ background: "linear-gradient(145deg, #111111 0%, #1a0a0a 100%)", borderRight: "1px solid rgba(230,43,30,0.2)" }}>
              <div>
                {/* TEDx wordmark */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-3 py-1 rounded font-black text-white text-sm tracking-tight" style={{ background: "#E62B1E" }}>
                    TEDx
                  </div>
                  <div className="h-px flex-1" style={{ background: "rgba(230,43,30,0.3)" }} />
                </div>

                {/* Theme title */}
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: "#E62B1E" }}>Csíkszereda · 2026</p>
                  <h2 className="font-black leading-none mb-1" style={{ color: "white", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}>
                    ECHOES OF<br />THE FUTURE
                  </h2>
                  <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.55)" }}>{event.description}</p>
                </div>

                <div className="flex flex-col gap-2.5 text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: "#E62B1E" }} />
                    {formatShortDate(event.startDate)}, 13:00–20:00
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "#E62B1E" }} />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Ticket className="w-3.5 h-3.5 shrink-0" style={{ color: "#E62B1E" }} />
                    {event.price}
                  </span>
                </div>
              </div>

              {/* Countdown */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(230,43,30,0.7)" }}>Visszaszámláló</p>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[
                    { value: pad(timeLeft.days), label: "NAP" },
                    { value: pad(timeLeft.hours), label: "ÓRA" },
                    { value: pad(timeLeft.minutes), label: "PERC" },
                    { value: pad(timeLeft.seconds), label: "MP" },
                  ].map(({ value, label }) => (
                    <div key={label} className="flex flex-col items-center justify-center rounded-xl py-3" style={{ background: "rgba(230,43,30,0.12)", border: "1px solid rgba(230,43,30,0.3)" }}>
                      <span className="text-2xl font-black leading-none text-white">{value}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: "#E62B1E" }}>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Link href={`/esemeny/${event.id}`}>
                    <button className="flex items-center gap-2 px-6 py-3 font-black text-sm rounded-xl text-white transition-all hover:opacity-90" style={{ background: "#E62B1E" }}>
                      Részletek <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  {event.ticketUrl && (
                    <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                      <button className="flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-colors" style={{ border: "1px solid rgba(230,43,30,0.4)", color: "rgba(255,255,255,0.8)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(230,43,30,0.1)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Jegyvásárlás
                      </button>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: poster */}
            <div className="relative min-h-[380px]">
              <img src={event.imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,0,0,0.7) 0%, transparent 50%)" }} />
              {/* TED watermark overlay */}
              <div className="absolute inset-0 flex items-end p-6">
                <div>
                  <p className="font-black text-5xl md:text-6xl leading-none select-none" style={{ color: "rgba(230,43,30,0.18)", letterSpacing: "-0.04em" }}>TED<span style={{ color: "rgba(255,255,255,0.08)" }}>x</span></p>
                  <p className="text-white/60 text-sm font-medium mt-1">{event.location}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Speakers ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8" style={{ background: "#E62B1E" }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(230,43,30,0.8)" }}>Meghívott előadók</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-6">
          {TEDX_SPEAKERS.map((speaker, i) => (
            <motion.div
              key={speaker.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="flex flex-col items-center gap-2.5 text-center"
            >
              {/* circular photo with TED-red ring */}
              <div className="relative shrink-0" style={{ width: 76, height: 76 }}>
                <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(135deg, #E62B1E 0%, #8B0000 100%)", padding: 2 }}>
                  <div className="w-full h-full rounded-full overflow-hidden" style={{ background: "#111" }}>
                    <img
                      src={speaker.photo}
                      alt={speaker.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold leading-tight text-white">{speaker.name}</p>
                <p className="text-[10px] leading-tight mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{speaker.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a href="https://www.tedxcsikszereda.ro/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: "rgba(255,255,255,0.5)" }}>
            tedxcsikszereda.ro <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

const MAJALIS_HIGHLIGHTS = [
  { icon: "🎨", label: "Kreatív foglalkozások", desc: "Alkotóműhelyek és játékok a legkisebbeknek" },
  { icon: "🛍️", label: "Kézművesek vására", desc: "Helyi mesterek portékái egy helyen" },
  { icon: "🎭", label: "Kulturális programok", desc: "Színes fellépések, előadások egész nap" },
  { icon: "🌳", label: "Jó hangulat", desc: "Közösség, szabadban, kellemes tavaszi légkör" },
  { icon: "👨‍👩‍👧", label: "Egész napos program", desc: "Reggeltől estig szórakozás a családnak" },
  { icon: "🧺", label: "Lazulós hétvége", desc: "Pokróc, barátok, friss levegő a parkban" },
];

function MajalisSection() {
  const { data: event, isLoading } = useGetEvent(3);
  const timeLeft = useCountdown(event?.startDate ?? null);
  const pad = (n: number) => String(n).padStart(2, "0");

  if (isLoading) return <Skeleton className="h-[520px] rounded-none" />;
  if (!event) return null;

  return (
    <section style={{ background: "linear-gradient(180deg, #f0faf2 0%, #d1fae5 30%, #064e3b 100%)" }}>
      {/* ── Event card ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-0">
        {/* Section badge */}
        <div className="flex items-center gap-2 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "linear-gradient(135deg, #065f46, #047857)", boxShadow: "0 4px 14px rgba(6,95,70,0.3)" }}>
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">Csíkszereda legnagyobb tavaszi ünnepe</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0 rounded-t-3xl overflow-hidden shadow-2xl shadow-emerald-900/30">
          {/* Left: details + countdown */}
          <div className="p-8 md:p-10 flex flex-col justify-between" style={{ background: "linear-gradient(145deg, #ffffff 0%, #f0fdf4 60%, #dcfce7 100%)" }}>
            <div>
              {/* Title block */}
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] mb-1" style={{ color: "#059669" }}>Csíki</p>
                <h2 className="text-4xl md:text-5xl font-black leading-none mb-1" style={{ color: "#064e3b" }}>
                  Majális
                </h2>
                <p className="text-base font-semibold" style={{ color: "#047857" }}>A családok hétvégéje</p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">{event.description}</p>

              <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" style={{ color: "#059669" }} />
                  {formatShortDate(event.startDate)}{event.endDate ? ` – ${formatShortDate(event.endDate)}` : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" style={{ color: "#059669" }} />
                  {event.location}
                </span>
                {event.price && (
                  <span className="flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" style={{ color: "#059669" }} />
                    {event.price}
                  </span>
                )}
              </div>
            </div>

            {/* Countdown */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#059669" }}>Visszaszámláló</p>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[
                  { value: pad(timeLeft.days), label: "NAP" },
                  { value: pad(timeLeft.hours), label: "ÓRA" },
                  { value: pad(timeLeft.minutes), label: "PERC" },
                  { value: pad(timeLeft.seconds), label: "MP" },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col items-center justify-center rounded-2xl py-3" style={{ background: "linear-gradient(135deg, #065f46, #047857)" }}>
                    <span className="text-2xl font-black leading-none text-white">{value}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest mt-1 text-emerald-200">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap">
                <Link href={`/esemeny/${event.id}`}>
                  <button className="flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl text-white transition-all hover:scale-105 shadow-lg shadow-emerald-700/30" style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>
                    Teljes program <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: poster */}
          <div className="relative min-h-[360px]">
            <img src="/majalis-plakat.jpg" alt="Csíki Majális plakát" className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,78,59,0.45) 0%, transparent 60%)" }} />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white/90 text-sm font-semibold drop-shadow">
                📅 {formatShortDate(event.startDate)}{event.endDate ? ` – ${formatShortDate(event.endDate)}` : ""} &nbsp;·&nbsp; 📍 {event.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Program highlights ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Mit találsz ott?</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">A majális kínálata</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {MAJALIS_HIGHLIGHTS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="flex flex-col items-center text-center p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <span className="text-3xl mb-3">{item.icon}</span>
              <p className="font-bold text-sm text-white leading-tight mb-1">{item.label}</p>
              <p className="text-xs text-emerald-200/70 leading-snug">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProgramSection() {
  return <MajalisSection />;
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
      <TEDxSection />
      <FeaturedProgramSection />
      <CinemaSection />
      <VenuesSection />
      <AddEventSection />
    </div>
  );
}
