export type EventExternalLink = { title: string; url: string; name?: string };

type EventWithLinks = {
  ticketUrl?: string | null;
  newsLinks?: string[] | null;
};

const isFacebookUrl = (url: string) => /(?:facebook\.com|fb\.com|fb\.me)/i.test(url);

function parseLinks(newsLinks?: string[] | null): EventExternalLink[] {
  return (newsLinks ?? []).flatMap((raw) => {
    try {
      const parsed = JSON.parse(raw) as Partial<EventExternalLink>;
      return typeof parsed.title === "string" && typeof parsed.url === "string"
        ? [{ title: parsed.title.trim(), url: parsed.url.trim(), ...(typeof parsed.name === "string" ? { name: parsed.name.trim() } : {}) }]
        : [];
    } catch {
      return [];
    }
  });
}

/**
 * Keeps the public event model backwards compatible while allowing the admin
 * to store Facebook, ticket and other links independently in newsLinks.
 * Older records that used ticketUrl for Facebook are classified correctly.
 */
export function getEventLinks(event: EventWithLinks) {
  const links = parseLinks(event.newsLinks);
  const facebook = links.find((link) => isFacebookUrl(link.url) || /facebook/i.test(link.title));
  const explicitTicket = event.ticketUrl?.trim() || "";
  const ticket = explicitTicket && !isFacebookUrl(explicitTicket)
    ? { title: "Jegyvásárlás", url: explicitTicket }
    : links.find((link) => !isFacebookUrl(link.url) && /(jegy|ticket|belép|belep)/i.test(`${link.title} ${link.url}`));
  const organizer = links.find((link) => link.title.toLocaleLowerCase("hu-HU") === "szervező" && link.name?.trim());
  const other = links.filter((link) => link.url && link.url !== facebook?.url && link.url !== ticket?.url && link !== organizer);
  return {
    facebookUrl: facebook?.url,
    ticketUrl: ticket?.url,
    ticketTitle: ticket?.title,
    otherLinks: other,
    organizerName: organizer?.name,
  };
}

export function getEventPriceLabel(event: EventWithLinks & { price?: string | null }) {
  const price = event.price?.trim();
  if (price) return price;
  const links = getEventLinks(event);
  return links.ticketUrl || links.facebookUrl ? "Jegy / belépő" : "Ingyenes";
}

export function isFacebookEventUrl(url?: string | null) {
  return Boolean(url && isFacebookUrl(url));
}
