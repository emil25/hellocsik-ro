import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hellocsik_favorite_events";
const CHANGE_EVENT = "hellocsik:favorites-changed";

function readFavorites() {
  if (typeof window === "undefined") return [] as number[];
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is number => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(readFavorites);

  useEffect(() => {
    const sync = () => setFavoriteIds(readFavorites());
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    const current = readFavorites();
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    writeFavorites(next);
    return next.includes(id);
  }, []);

  const clearFavorites = useCallback(() => writeFavorites([]), []);

  return {
    favoriteIds,
    isFavorite: (id: number) => favoriteIds.includes(id),
    toggleFavorite,
    clearFavorites,
  };
}
