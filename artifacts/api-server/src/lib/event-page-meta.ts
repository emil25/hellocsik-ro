type PublicEventPreview = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]!);

function safeImageUrl(value: string, origin: string) {
  try {
    const url = new URL(value, origin);
    if (["https:", "http:"].includes(url.protocol)) return url.href;
  } catch { /* Use the site's logo for invalid image URLs. */ }
  return new URL("/hellocsik-logo.png", origin).href;
}

/** Facebook reads the initial HTML without running our React application. */
export function renderEventPageMeta(html: string, event: PublicEventPreview | null, origin: string) {
  const title = event ? `${event.title} – HelloCsík` : "Esemény nem található – HelloCsík";
  const description = event
    ? (event.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || `${event.title} · ${event.location}`).slice(0, 220)
    : "Ez az esemény nem érhető el.";
  const url = new URL(event ? `/esemeny/${event.id}` : "/", origin).href;
  const image = safeImageUrl(event?.imageUrl || "/hellocsik-logo.png", origin);
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${event ? "index, follow" : "noindex, follow"}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    ...Object.entries({
      "og:type": "website", "og:url": url, "og:title": title, "og:description": description,
      "og:image": image, "og:image:alt": event?.title ?? "HelloCsík", "og:locale": "hu_HU", "og:site_name": "HelloCsík",
    }).map(([key, value]) => `<meta property="${key}" content="${escapeHtml(value)}" />`),
    ...Object.entries({
      "twitter:card": "summary_large_image", "twitter:title": title, "twitter:description": description,
      "twitter:image": image, "twitter:image:alt": event?.title ?? "HelloCsík",
    }).map(([key, value]) => `<meta name="${key}" content="${escapeHtml(value)}" />`),
  ];
  return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\b[^>]*(?:name|property)=["'](?:description|robots|og:[^"']*|twitter:[^"']*)["'][^>]*>/gi, "")
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace("</head>", () => `${tags.join("\n    ")}\n  </head>`);
}
