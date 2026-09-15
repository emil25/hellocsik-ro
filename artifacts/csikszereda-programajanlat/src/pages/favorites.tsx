import { Heart, Sparkles, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { EventCard } from "@/components/events/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/use-favorites";

export default function FavoritesPage() {
  const { favoriteIds, clearFavorites } = useFavorites();
  const { data, isLoading } = useListUpcomingEvents({ limit: 100 });
  const events = (data?.events ?? []).filter((event) => favoriteIds.includes(event.id));

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-500 mb-3">
                <Heart className="w-4 h-4" fill="currentColor" /> Saját válogatás
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground">Érdekel</h1>
              <p className="text-muted-foreground mt-3 max-w-xl">Itt találod az elmentett programokat. A lista ebben a böngészőben marad meg.</p>
            </div>
            {favoriteIds.length > 0 && (
              <button onClick={clearFavorites} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">
                <Trash2 className="w-4 h-4" /> Lista ürítése
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-[430px] rounded-2xl" />)}
          </div>
        ) : events.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}
          </div>
        ) : (
          <div className="max-w-xl mx-auto rounded-3xl border border-border bg-card px-6 py-16 text-center">
            <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Még nincs elmentett programod</h2>
            <p className="text-sm text-muted-foreground mb-6">Nyomd meg a szív ikont egy eseményen, és itt fog megjelenni.</p>
            <Link href="/#kozelgo" className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Programok böngészése</Link>
          </div>
        )}
      </section>
    </div>
  );
}
