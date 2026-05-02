import { motion } from "framer-motion";
import { MapPin, Clock, Ticket } from "lucide-react";
import { Link } from "wouter";
import { formatDate, formatTime } from "@/utils/date-format";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    imageUrl: string;
    startDate: string;
    location: string;
    price?: string | null;
    category?: { name: string; color: string } | null;
    tags: string[];
  };
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
    >
      <Link href={`/esemeny/${event.id}`}>
        <div className="group cursor-pointer bg-card rounded-2xl overflow-hidden border border-card-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
          <div className="relative overflow-hidden aspect-video">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {event.category && (
              <span
                className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white shadow"
                style={{ backgroundColor: event.category.color }}
              >
                {event.category.name}
              </span>
            )}
            {event.price && (
              <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-background/90 text-foreground shadow flex items-center gap-1">
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
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
