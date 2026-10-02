import { useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useListUpcomingEvents, type Event as ApiEvent } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/utils/date-format";
import { isCsikEvent } from "@/lib/csik-events";
import { eventDateKey, eventOccursOnDate } from "../../../../shared/event-time.mjs";

export default function CalendarPage() {
  const regional = new URLSearchParams(useSearch()).get("scope") === "szekelyfold";
  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = eventDateKey(new Date());
  const [currentYear, currentMonth] = today.split("-").map(Number);
  const month = new Date(currentYear, currentMonth - 1 + monthOffset, 1);
  const firstWeekday = (month.getDay() + 6) % 7;
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const monthName = month.toLocaleDateString("hu-HU", { year: "numeric", month: "long" });
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const eventsByDate = useMemo(() => {
    const result: Record<string, ApiEvent[]> = {};
    const events = (data?.events ?? []).filter(event => regional || isCsikEvent(event));
    for (let day = 1; day <= dayCount; day++) {
      const key = `${monthKey}-${String(day).padStart(2, "0")}`;
      result[key] = events.filter(event => eventOccursOnDate(event, key));
    }
    return result;
  }, [data, regional, monthKey, dayCount]);
  const selectedEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];

  return <section className="min-h-[calc(100vh-4rem)] py-12 sm:py-16 bg-[#eff2e8]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap justify-between gap-4 items-end mb-7">
        <div><div className="flex gap-2 items-center text-primary mb-2"><Calendar className="w-4 h-4" /><span className="text-xs font-bold tracking-widest uppercase">Havi naptár</span></div><h1 className="text-3xl sm:text-4xl font-bold">{regional ? "Székelyföldi programnaptár" : "Csíki programnaptár"}</h1><p className="text-sm text-muted-foreground mt-2">Kattints egy napra az ottani eseményekért.</p>{regional && <Link href="/szekelyfold" className="inline-block text-sm font-semibold text-primary mt-3">← Székelyföld összes programja</Link>}</div>
        <div className="flex items-center gap-3"><button aria-label="Előző hónap" onClick={() => { setMonthOffset(v => v - 1); setSelectedDate(null); }} className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:border-primary"><ChevronLeft className="w-4 h-4" /></button><span className="capitalize min-w-36 text-center font-semibold">{monthName}</span><button aria-label="Következő hónap" onClick={() => { setMonthOffset(v => v + 1); setSelectedDate(null); }} className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:border-primary"><ChevronRight className="w-4 h-4" /></button></div>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">{["H", "K", "Sze", "Cs", "P", "Szo", "V"].map(day => <span key={day}>{day}</span>)}</div>
      {isLoading ? <div className="grid grid-cols-7 gap-1">{Array.from({ length: 35 }).map((_, i) => <Skeleton key={i} className="h-20 sm:h-24 rounded-lg" />)}</div> : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstWeekday }).map((_, i) => <div key={`blank-${i}`} />)}
          {Array.from({ length: dayCount }, (_, i) => {
            const n = i + 1;
            const key = `${monthKey}-${String(n).padStart(2, "0")}`;
            const dayEvents = eventsByDate[key] ?? [];
            const colors = [...new Set(dayEvents.map(event => event.category?.color ?? "#1c563b"))].slice(0, 4);
            const active = selectedDate === key;
            return <button key={key} onClick={() => setSelectedDate(key)} aria-pressed={active} aria-current={key === today ? "date" : undefined} aria-label={`${monthName} ${n}., ${dayEvents.length} program`} className={`h-20 sm:h-24 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${active ? "bg-primary text-white border-primary" : key === today ? "bg-card border-primary text-primary" : "bg-card border-transparent hover:border-primary/40"}`}>
              <span>{n}</span>
              <span className="h-4 text-[10px]">{dayEvents.length > 0 ? dayEvents.length : ""}</span>
              <span className="flex gap-0.5 h-1.5" aria-hidden="true">{colors.map(color => <span key={color} className={`w-1.5 h-1.5 rounded-full ${active ? "ring-1 ring-white/50" : ""}`} style={{ background: color }} />)}</span>
            </button>;
          })}
        </div>
      )}
      <div className="mt-5 min-h-16 rounded-2xl bg-card border border-card-border p-4" aria-live="polite">
        {selectedDate ? selectedEvents.length ? <div className="space-y-2">{selectedEvents.map(event => <Link key={event.id} href={`/esemeny/${event.id}`} className="flex items-center gap-3 hover:bg-muted rounded-xl p-2">
          <img src={event.imageUrl || "/hellocsik-logo.png"} alt="" className="w-14 h-16 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0"><p className="font-semibold text-sm break-words">{event.title}</p><p className="text-xs text-muted-foreground mt-1">{eventDateKey(event.startDate) === selectedDate ? formatTime(event.startDate) : "Folyamatban"} · {event.location}</p>{eventDateKey(event.startDate) !== selectedDate && <p className="text-[11px] text-muted-foreground mt-1">A látogatási időről az esemény részleteinél tájékozódhatsz.</p>}</div>
        </Link>)}</div> : <p className="text-sm text-muted-foreground text-center">Erre a napra nincs program.</p> : <p className="text-sm text-muted-foreground text-center">Válassz egy napot a havi naptárból.</p>}
      </div>
    </div>
  </section>;
}
