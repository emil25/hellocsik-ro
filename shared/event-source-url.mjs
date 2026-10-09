/** Ignore tracking parameters without dropping a Facebook photo's identity. */
export function normalizeSourceUrl(value) {
  try {
    const parsed = new URL(value);
    const facebookPhoto = /(^|\.)facebook\.com$/i.test(parsed.hostname)
      && /^\/(?:photo|photo\.php)\/?$/i.test(parsed.pathname);
    const photoId = facebookPhoto ? parsed.searchParams.get("fbid") : null;
    parsed.hash = "";
    parsed.search = "";
    if (photoId && /^\d+$/.test(photoId)) {
      parsed.pathname = "/photo";
      parsed.searchParams.set("fbid", photoId);
    }
    return parsed.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return value.trim().toLowerCase().replace(/\/$/, "");
  }
}
