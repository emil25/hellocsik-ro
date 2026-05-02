import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, MapPin, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useListEvents } from "@workspace/api-client-react";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data } = useListEvents({ limit: 100 });
  const allEvents = data?.events ?? [];

  const results = query.trim().length < 2 ? [] : allEvents.filter(ev =>
    ev.title.toLowerCase().includes(query.toLowerCase()) ||
    ev.description?.toLowerCase().includes(query.toLowerCase()) ||
    ev.location?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
              <Search className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" style={{ width: 18, height: 18 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Program neve, helyszín, leírás..."
                className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {query.trim().length >= 2 && (
              <div className="max-h-[60vh] overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-10">Nincs találat: <span className="font-semibold text-foreground">"{query}"</span></p>
                ) : (
                  <ul className="py-2">
                    {results.map(ev => (
                      <li key={ev.id}>
                        <Link href={`/esemeny/${ev.id}`}>
                          <div
                            onClick={onClose}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors group"
                          >
                            {ev.imageUrl && (
                              <img src={ev.imageUrl} alt={ev.title} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{ev.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatShortDate(ev.startDate)}</span>
                                {ev.location && <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{ev.location}</span></span>}
                              </p>
                            </div>
                            {ev.category && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: ev.category.color }}>
                                {ev.category.name}
                              </span>
                            )}
                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {query.trim().length < 2 && (
              <div className="px-4 py-5 text-center">
                <p className="text-xs text-muted-foreground">Írj be legalább 2 karaktert a kereséshez</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
