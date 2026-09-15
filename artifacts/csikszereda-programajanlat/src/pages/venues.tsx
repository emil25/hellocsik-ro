import { useMemo } from "react";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getVenueInfo } from "@/lib/venues";

const COLORS = ["#4e3dd1", "#fb5d83", "#17865f", "#d18b16", "#2578b9", "#8b4abb", "#df5d38", "#57706a"];

export default function VenuesPage() {
  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const venues = useMemo(() => {
    const map = new Map<string, { name: string; slug: string; address?: string; titles: string[]; categories: Set<string> }>();
    for (const event of data?.events ?? []) {
      if (!event.location) continue;
      const info = getVenueInfo(event.location);
      if (!map.has(info.slug)) map.set(info.slug, { name: info.name, slug: info.slug, address: info.address, titles: [], categories: new Set() });
      const venue = map.get(info.slug)!;
      venue.titles.push(event.title);
      if (event.category?.name) venue.categories.add(event.category.name);
    }
    return [...map.values()].sort((a, b) => b.titles.length - a.titles.length);
  }, [data]);

  return <div className="min-h-screen bg-[#f7f6ff]">
    <section className="bg-gradient-to-br from-[#282453] via-[#4e3dd1] to-[#16835e] text-white py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-xs font-black tracking-[.16em] text-emerald-200 mb-4"><MapPin size={16} /> HELYSZÍNEK</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-3xl">A város helyei,<br />ahol történik valami.</h1>
        <p className="mt-5 text-white/70 max-w-xl">Válassz helyszínt, és nézd meg az összes közelgő programját.</p>
      </div>
    </section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div><p className="text-xs font-black tracking-widest text-[#4e3dd1]">PROGRAMHELYSZÍNEK</p><h2 className="text-3xl font-black text-[#282453] mt-2">{venues.length} helyszín</h2></div>
        <Link href="/#helyszinek" className="text-sm font-bold text-[#4e3dd1]">Térkép megnyitása →</Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? Array.from({ length: 9 }).map((_, index) => <Skeleton key={index} className="h-48 rounded-[28px]" />) : venues.map((venue, index) => {
          const color = COLORS[index % COLORS.length];
          return <Link key={venue.slug} href={`/helyszin/${venue.slug}`} className="group min-h-48 rounded-[28px] bg-white p-6 border border-violet-100 shadow-[0_14px_35px_rgba(55,45,115,.08)] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(55,45,115,.15)] transition-all flex flex-col">
            <div className="flex items-center justify-between gap-3">
              <span className="w-12 h-12 rounded-2xl grid place-items-center" style={{ backgroundColor: `${color}18`, color }}><Building2 size={22} /></span>
              <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ backgroundColor: color }}>{venue.titles.length} program</span>
            </div>
            <h3 className="text-xl font-black text-[#282453] leading-tight mt-6 group-hover:text-[#4e3dd1] transition-colors">{venue.name}</h3>
            <p className="text-xs text-slate-500 mt-2 line-clamp-1">{venue.address || [...venue.categories].join(" · ") || "Csíkszereda és környéke"}</p>
            <span className="mt-auto pt-5 inline-flex items-center gap-2 text-xs font-black" style={{ color }}>Programok megnyitása <ArrowRight size={15} /></span>
          </Link>;
        })}
      </div>
    </section>
  </div>;
}
