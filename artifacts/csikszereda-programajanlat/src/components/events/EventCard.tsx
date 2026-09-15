import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Ticket, ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { formatDate, formatTime } from "@/utils/date-format";
import { formatRefreshDate, getEventSource } from "@/lib/event-meta";
import { FavoriteButton } from "@/components/events/FavoriteButton";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    imageUrl: string;
    startDate: string;
    location: string;
    price?: string | null;
    featured?: boolean;
    category?: { name: string; color: string } | null;
    tags: string[];
    newsLinks?: string[];
    createdAt?: string;
    updatedAt?: string;
  };
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  const usesGenericImage = !event.imageUrl || event.imageUrl.includes("images.unsplash.com/photo-149268") || event.imageUrl.includes("hellocsik-logo");
  const showFallback = usesGenericImage || imageError;
  const fallbackColor = event.category?.color ?? "#24543b";
  const source = getEventSource(event.newsLinks);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
    >
      <div className="relative h-full">
      <Link href={`/esemeny/${event.id}`}>
        <div className={`group h-full cursor-pointer bg-card rounded-2xl overflow-hidden border hover:border-primary/30 hover:shadow-lg transition-all duration-300 ${event.featured ? "border-amber-400" : "border-card-border"}`}>
          <div className="relative overflow-hidden aspect-[4/3] bg-muted">
            {showFallback ? <div className="h-full flex flex-col justify-center items-center gap-3 text-white p-5" style={{ background: `linear-gradient(135deg, ${fallbackColor}, #172d25)` }}><CalendarDays size={45} strokeWidth={1.5} /><span className="text-[10px] uppercase tracking-[.18em] font-bold opacity-75">{event.category?.name ?? "HelloCsík"}</span><span className="font-bold text-lg text-center leading-tight line-clamp-2">{event.title}</span></div> :
            <img
              src={event.imageUrl}
              alt={event.title}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />}
            {event.category && (
              <span
                className={`absolute top-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white shadow ${event.featured ? "left-36" : "left-3"}`}
                style={{ backgroundColor: event.category.color }}
              >
                {event.category.name}
              </span>
            )}
            {event.featured && <span className="absolute left-3 top-3 rounded-full bg-amber-400 text-amber-950 px-2.5 py-1 text-xs font-bold">✦ Kihagyhatatlan</span>}
            {event.price && (
              <span className="absolute bottom-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-background/90 text-foreground shadow flex items-center gap-1">
                <Ticket className="w-3 h-3" />
                {event.price}
              </span>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-base text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
              <p className="text-[10px] text-muted-foreground/80 line-clamp-1 pt-1">
                Forrás: {source.title} · Frissítve: {formatRefreshDate(event.updatedAt ?? event.createdAt)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-5 mt-4 border-t border-border text-sm"><span className="text-primary">{event.price || "Ingyenes"}</span><span className="inline-flex items-center gap-1 font-semibold text-primary">Részletek <ArrowRight size={14} /></span></div>
          </div>
        </div>
      </Link>
      <FavoriteButton eventId={event.id} className="absolute top-3 right-3 z-20 w-9 h-9" />
      </div>
    </motion.div>
  );
}
