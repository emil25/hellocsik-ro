import { useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents, type Event as ApiEvent } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/utils/date-format";

export default function CalendarPage() {
  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const firstWeekday = (month.getDay() + 6) % 7;
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const monthName = month.toLocaleDateString("hu-HU", { year: "numeric", month: "long" });
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const eventsByDate = useMemo(() => {
    const result: Record<string, ApiEvent[]> = {};
    (data?.events ?? []).forEach(event => {
      const key = new Date(event.startDate).toLocaleDateString("sv-SE", { timeZone: "Europe/Bucharest" });
      (result[key] ??= []).push(event);
    });
    return result;
  }, [data]);
  const selectedEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Bucharest" });

  return <section className="min-h-[calc(100vh-4rem)] py-12 sm:py-16 bg-[#eff2e8]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap justify-between gap-4 items-end mb-7">
        <div><div className="flex gap-2 items-center text-primary mb-2"><Calendar className="w-4 h-4" /><span className="text-xs font-bold tracking-widest uppercase">Havi naptár</span></div><h1 className="text-3xl sm:text-4xl font-bold">Programok egy pillantásra</h1><p className="text-sm text-muted-foreground mt-2">Kattints egy napra az ottani eseményekért.</p></div>
        <div className="flex items-center gap-3"><button aria-label="Előző hónap" onClick={() => { setMonthOffset(v => v - 1); setSelectedDate(null); }} className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:border-primary"><ChevronLeft className="w-4 h-4" /></button><span className="capitalize min-w-36 text-center font-semibold">{monthName}</span><button aria-label="Következő hónap" onClick={() => { setMonthOffset(v => v + 1); setSelectedDate(null); }} className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:border-primary"><ChevronRight className="w-4 h-4" /></button></div>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">{["H", "K", "Sze", "Cs", "P", "Szo", "V"].map(day => <span key={day}>{day}</span>)}</div>
      {isLoading ? <div className="grid grid-cols-7 gap-1">{Array.from({ length: 35 }).map((_, i) => <Skeleton key={i} className="h-16 sm:h-24 rounded-lg" />)}</div> : <div className="grid grid-cols-7 gap-1">{Array.from({ length: firstWeekday }).map((_, i) => <div key={`blank-${i}`} />)}{Array.from({ length: dayCount }, (_, i) => { const n = i + 1; const key = `${monthKey}-${String(n).padStart(2, "0")}`; const count = eventsByDate[key]?.length ?? 0; const active = selectedDate === key; return <button key={key} onClick={() => setSelectedDate(key)} className={`relative h-16 sm:h-24 rounded-lg border text-sm font-semibold transition-colors ${active ? "bg-primary text-white border-primary" : key === today ? "bg-card border-primary text-primary" : "bg-card border-transparent hover:border-primary/40"}`}><span>{n}</span>{count > 0 && <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 min-w-4 h-4 px-1 rounded-full text-[10px] grid place-items-center ${active ? "bg-white/25" : "bg-primary text-white"}`}>{count}</span>}</button>; })}</div>}
      <div className="mt-5 min-h-16 rounded-2xl bg-card border border-card-border p-4">{selectedDate ? selectedEvents.length ? <div className="space-y-2">{selectedEvents.map(event => <Link key={event.id} href={`/esemeny/${event.id}`}><div className="flex items-center justify-between gap-3 hover:bg-muted rounded-xl p-2"><span className="font-semibold text-sm">{event.title}</span><span className="text-xs text-muted-foreground shrink-0">{formatTime(event.startDate)} · {event.location}</span></div></Link>)}</div> : <p className="text-sm text-muted-foreground text-center">Erre a napra nincs program.</p> : <p className="text-sm text-muted-foreground text-center">Válassz egy napot a havi naptárból.</p>}</div>
    </div>
  </section>;
}
