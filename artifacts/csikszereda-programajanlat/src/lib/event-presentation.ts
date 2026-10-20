import posterAssets from "./event-poster-assets.json";

export const CSIK_1956_EVENT_ID = 144;
export const CSIK_1956_FACEBOOK_URL =
  "https://www.facebook.com/events/2101155110767901/";
export const CSIK_1956_POSTER_URL =
  "/events/csikszereda-1956-70-evfordulo-2026.jpg";

type EventPresentation = {
  id: number;
  imageUrl?: string | null;
  newsLinks?: string[] | null;
};

/** Prefer optimized local posters and preserve the commemoration's poster/source override. */
export function withEventPresentation<T extends EventPresentation>(event: T): T {
  const cachedPoster = event.imageUrl
    ? (posterAssets as Record<string, string>)[event.imageUrl.split("?")[0]]
    : undefined;
  const displayEvent = cachedPoster ? { ...event, imageUrl: cachedPoster } : event;
  if (Number(event.id) !== CSIK_1956_EVENT_ID) return displayEvent;

  const newsLinks = [...(event.newsLinks ?? [])];
  const alreadyHasFacebookEvent = newsLinks.some((item) => {
    try {
      return JSON.parse(item).url === CSIK_1956_FACEBOOK_URL;
    } catch {
      return item === CSIK_1956_FACEBOOK_URL;
    }
  });
  if (!alreadyHasFacebookEvent) {
    newsLinks.push(
      JSON.stringify({ title: "Facebook-esemény", url: CSIK_1956_FACEBOOK_URL }),
    );
  }

  return {
    ...displayEvent,
    imageUrl: CSIK_1956_POSTER_URL,
    newsLinks,
  } as T;
}
