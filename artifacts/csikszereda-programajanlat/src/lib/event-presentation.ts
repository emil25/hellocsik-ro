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

/** Keep the existing Csíkszereda commemoration record and add its new poster/source. */
export function withEventPresentation<T extends EventPresentation>(event: T): T {
  if (Number(event.id) !== CSIK_1956_EVENT_ID) return event;

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
    ...event,
    imageUrl: CSIK_1956_POSTER_URL,
    newsLinks,
  } as T;
}
