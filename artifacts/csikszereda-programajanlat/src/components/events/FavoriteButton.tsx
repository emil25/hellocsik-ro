import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";

export function FavoriteButton({ eventId, className = "" }: { eventId: number; className?: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(eventId);

  return (
    <button
      type="button"
      aria-label={active ? "Eltávolítás a kedvencek közül" : "Mentés a kedvencek közé"}
      aria-pressed={active}
      title={active ? "Mentve a kedvencek közé" : "Mentés a kedvencek közé"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(eventId);
      }}
      className={`inline-flex items-center justify-center rounded-full border shadow-sm transition-all hover:scale-105 active:scale-95 ${active ? "bg-rose-500 border-rose-500 text-white" : "bg-white/95 border-white text-stone-600 hover:text-rose-500"} ${className}`}
    >
      <Heart className="w-4 h-4" fill={active ? "currentColor" : "none"} />
    </button>
  );
}
