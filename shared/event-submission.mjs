import { mergeLocalityAddress } from "./region-places.mjs";
import { normalizeSourceUrl } from "./event-source-url.mjs";

function webUrl(value, label) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (["http:", "https:"].includes(url.protocol)) return url.href;
  } catch {
    /* Report a field error below. */
  }
  throw new RangeError(
    `${label}: teljes, http vagy https kezdetű linket adj meg.`,
  );
}
export function submissionOptions(body) {
  const ticketUrl = webUrl(body.ticketUrl, "Jegy / információ link");
  const facebookUrl = webUrl(body.facebookUrl, "Facebook-link");
  if (
    facebookUrl &&
    !/(^|\.)(facebook\.com|fb\.me)$/i.test(new URL(facebookUrl).hostname)
  )
    throw new RangeError(
      "A Facebook mezőbe Facebook-linket adj meg. A jegyhez külön mező tartozik.",
    );
  const promotionPlan = ["free", "featured", "homepage"].includes(
    body.promotionPlan,
  )
    ? body.promotionPlan
    : "free";
  return {
    ticketUrl,
    newsLinks: facebookUrl
      ? [
          JSON.stringify({
            title: "Facebook-esemény",
            url: normalizeSourceUrl(facebookUrl),
          }),
        ]
      : [],
    locationAddress: mergeLocalityAddress(body.locationAddress, body.locality),
    promotionPlan,
    promotionStatus: promotionPlan === "free" ? "none" : "requested",
  };
}
