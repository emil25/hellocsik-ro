import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Clock, ExternalLink, Ticket } from "lucide-react";
import { Link } from "wouter";
import {
  useListFeaturedEvents,
  useListThisWeekEvents,
  useListUpcomingEvents,
  useGetMonthHighlight,
  useListCategories,
  useListEvents,
} from "@workspace/api-client-react";
import { EventCard } from "@/components/events/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime } from "@/utils/date-format";

function HeroCarousel() {
  const { data, isLoading } = useListFeaturedEvents();
  const [current, setCurrent] = useState(0);
  const events = data?.events ?? [];

  if (isLoading) {
    return <Skeleton className="w-full h-[500px] rounded-3xl" />;
  }

  if (events.length === 0) return null;

  const event = events[current];

  return (
    <div className="relative rounded-3xl overflow-hidden h-[500px] md:h-[560px]">
      <motion.div
        key={event.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0"
      >
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        {event.category && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-xs font-bold px-3 py-1 rounded-full text-white mb-3"
            style={{ backgroundColor: event.category.color }}
          >
            {event.category.name}
          </motion.span>
        )}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight"
        >
          {event.title}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 text-sm text-white/80 mb-4"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatDate(event.startDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {event.location}
          </span>
        </motion.div>
        <Link href={`/esemeny/${event.id}`}>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Részletek
          </motion.button>
        </Link>
      </div>

      {events.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + events.length) % events.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % events.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 right-6 flex gap-1.5">
            {events.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-5" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function WeeklyCalendar() {
  const { data, isLoading } = useListThisWeekEvents();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const days = data?.days ?? [];

  const today = new Date().toISOString().slice(0, 10);

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="min-w-[90px] h-20 rounded-2xl flex-1" />
        ))}
      </div>
    );
  }

  const selectedDayData = selectedDay
    ? days.find((d) => d.date === selectedDay)
    : days.find((d) => d.date === today);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {days.map((day) => {
          const isToday = day.date === today;
          const isSelected = (selectedDay ?? today) === day.date;
          return (
            <motion.button
              key={day.date}
              onClick={() => setSelectedDay(day.date)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`min-w-[80px] flex-1 flex flex-col items-center py-3 px-2 rounded-2xl border transition-all text-center ${
                isSelected
                  ? "bg-primary text-white border-primary shadow-md"
                  : isToday
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-card-border text-foreground hover:border-primary/30"
              }`}
            >
              <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                {day.dayName}
              </span>
              <span className="text-lg font-bold leading-tight">
                {new Date(day.date + "T12:00:00").getDate()}
              </span>
              {day.events.length > 0 && (
                <span className={`mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                  {day.events.length} program
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedDayData && selectedDayData.events.length > 0 && (
        <motion.div
          key={selectedDayData.date}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          {selectedDayData.events.map((event) => (
            <Link key={event.id} href={`/esemeny/${event.id}`}>
              <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-card-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                <img src={event.imageUrl} alt={event.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground line-clamp-1">{event.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(event.startDate)} &bull; {event.location}
                  </div>
                </div>
                {event.category && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                    style={{ backgroundColor: event.category.color }}
                  >
                    {event.category.name}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </motion.div>
      )}

      {selectedDayData && selectedDayData.events.length === 0 && (
        <div className="mt-4 text-center py-8 text-muted-foreground text-sm">
          Ezen a napon nincs program
        </div>
      )}
    </div>
  );
}

function MonthHighlight() {
  const { data: event, isLoading } = useGetMonthHighlight();

  if (isLoading) return <Skeleton className="w-full h-80 rounded-3xl" />;
  if (!event) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden">
      <img src={event.imageUrl} alt={event.title} className="w-full h-80 md:h-96 object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="p-8 md:p-12 max-w-lg">
          <div className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
            A hónap nagy programja
          </div>
          {event.category && (
            <span
              className="inline-block text-xs font-bold px-3 py-1 rounded-full text-white mb-3"
              style={{ backgroundColor: event.category.color }}
            >
              {event.category.name}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">{event.title}</h2>
          <p className="text-white/75 text-sm leading-relaxed mb-5 line-clamp-3">{event.description}</p>
          <div className="flex flex-wrap gap-3 text-sm text-white/70 mb-5">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDate(event.startDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {event.location}
            </span>
          </div>
          <div className="flex gap-3">
            <Link href={`/esemeny/${event.id}`}>
              <button className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                Részletek
              </button>
            </Link>
            {event.ticketUrl && (
              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                <button className="px-5 py-2.5 bg-white/15 text-white text-sm font-semibold rounded-xl hover:bg-white/25 transition-colors flex items-center gap-1.5">
                  <Ticket className="w-4 h-4" />
                  Jegyvasárlás
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryFilters({
  selected,
  onSelect,
}: {
  selected: number | null;
  onSelect: (id: number | null) => void;
}) {
  const { data } = useListCategories();
  const categories = data?.categories ?? [];

  return (
    <div id="kategoriak" className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
          selected === null
            ? "bg-foreground text-background"
            : "bg-card border border-card-border text-foreground hover:border-primary/30"
        }`}
      >
        Összes
      </button>
      {categories.map((cat) => (
        <motion.button
          key={cat.id}
          onClick={() => onSelect(selected === cat.id ? null : cat.id)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
            selected === cat.id ? "text-white border-transparent" : "border-card-border bg-card text-foreground"
          }`}
          style={selected === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
        >
          {cat.name}
        </motion.button>
      ))}
    </div>
  );
}

function UpcomingEvents({ categoryId }: { categoryId: number | null }) {
  const { data, isLoading } = useListUpcomingEvents({ limit: 9 });
  const { data: filtered, isLoading: filteredLoading } = useListEvents(
    categoryId ? { categoryId, limit: 9 } : undefined,
    { query: { enabled: !!categoryId } }
  );

  const events = categoryId ? (filtered?.events ?? []) : (data?.events ?? []);
  const loading = categoryId ? filteredLoading : isLoading;

  return (
    <div id="kozelgo">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Nem találhatók programok</p>
          <p className="text-sm mt-1">Próbálj más kategóriát!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      <section>
        <HeroCarousel />
      </section>

      <section id="hetisajt">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground">Mi lesz a héten?</h2>
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("hu-HU", { month: "long", year: "numeric" })}
          </span>
        </div>
        <WeeklyCalendar />
      </section>

      <section>
        <MonthHighlight />
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground">Közelgő események</h2>
        </div>
        <div className="mb-5">
          <CategoryFilters selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>
        <UpcomingEvents categoryId={selectedCategory} />
      </section>
    </div>
  );
}
