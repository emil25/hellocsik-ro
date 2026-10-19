import test from "node:test";
import assert from "node:assert/strict";
import {
  REGION_PLACES,
  findRegionPlace,
  regionPlaceForEvent,
  mergeLocalityAddress,
} from "../shared/region-places.mjs";
import {
  matchesDiscoveryEvent,
  discoveryDateRange,
  isFreeEvent,
} from "../shared/event-discovery.mjs";
import { submissionOptions } from "../shared/event-submission.mjs";
import { findImportedEvent } from "../shared/event-import-match.mjs";
import {
  harghitaEventDates,
  parseRegionalSource,
  covasnaVenueReferences,
  covasnaVenueAddress,
} from "../shared/regional-source-parser.mjs";
const now = new Date("2026-10-19T09:00:00Z");
const event = {
  title: "Őszi koncert",
  startDate: "2026-10-23T16:00:00Z",
  endDate: null,
  location: "Kultúrpalota",
  locationAddress: "Târgu Mureș",
  category: { slug: "koncert", name: "Koncert" },
  price: null,
};

test("settlements resolve Romanian aliases and authoritative address before title", () => {
  assert.equal(findRegionPlace("Târgu Mureș, România")?.slug, "marosvasarhely");
  assert.equal(
    findRegionPlace("Sfântu Gheorghe, jud. Covasna")?.slug,
    "sepsiszentgyorgy",
  );
  assert.equal(findRegionPlace("Kovászna megye"), undefined);
  assert.equal(
    regionPlaceForEvent({ ...event, title: "Csíkszeredai vendégzenekar" })
      ?.slug,
    "marosvasarhely",
  );
  assert.equal(
    regionPlaceForEvent({ location: "Csíki Mozi" })?.slug,
    "csikszereda",
  );
  assert.equal(
    regionPlaceForEvent({ location: "Ismeretlen kultúrház" }),
    undefined,
  );
  assert.equal(
    REGION_PLACES.length,
    new Set(REGION_PLACES.map((item) => item.slug)).size,
  );
});
test("regional filters combine area, settlement, aliases, free entry and category", () => {
  assert.equal(
    matchesDiscoveryEvent(
      event,
      { area: "maros", query: "oszi marosvasarhely", category: "koncert" },
      now,
    ),
    true,
  );
  assert.equal(
    matchesDiscoveryEvent(event, { city: "szekelyudvarhely" }, now),
    false,
  );
  assert.equal(
    matchesDiscoveryEvent(event, { city: "nyaradszereda", nearby: true }, now),
    true,
  );
  assert.equal(matchesDiscoveryEvent(event, { free: true }, now), false);
  assert.equal(isFreeEvent({ ...event, price: "Ingyenes" }), true);
  assert.equal(isFreeEvent({ ...event, price: "0 RON" }), true);
  assert.equal(isFreeEvent({ ...event, price: "50 RON" }), false);
  assert.equal(
    matchesDiscoveryEvent(
      { ...event, location: "Kis kultúrház", locationAddress: null },
      { city: "other" },
      now,
    ),
    true,
  );
});
test("dates cover multi-day events, Bucharest midnight and next week", () => {
  assert.deepEqual(discoveryDateRange("week", now), {
    from: "2026-10-19",
    to: "2026-10-25",
  });
  assert.deepEqual(discoveryDateRange("next-week", now), {
    from: "2026-10-26",
    to: "2026-11-01",
  });
  assert.deepEqual(
    discoveryDateRange("today", new Date("2026-10-18T22:30:00Z")),
    { from: "2026-10-19", to: "2026-10-19" },
  );
  assert.equal(
    matchesDiscoveryEvent(
      {
        ...event,
        startDate: "2026-10-01T09:00:00Z",
        endDate: "2026-11-01T09:00:00Z",
      },
      { day: "2026-10-23" },
      now,
    ),
    true,
  );
  assert.equal(
    matchesDiscoveryEvent(
      { ...event, startDate: "2026-10-18T09:00:00Z" },
      {},
      now,
    ),
    false,
  );
  assert.equal(
    matchesDiscoveryEvent(event, { from: "2026-11-01", to: "2026-11-10" }, now),
    false,
  );
});
test("submission retains locality, separate Facebook and ticket URLs, promotion stays unpaid", () => {
  const result = submissionOptions({
    locality: "Sepsiszentgyörgy",
    locationAddress: "Kós Károly 10",
    facebookUrl: "https://www.facebook.com/events/123/?ref=notif",
    ticketUrl: "https://example.com/tickets",
    promotionPlan: "homepage",
    promotionStatus: "paid",
  });
  assert.equal(result.locationAddress, "Kós Károly 10, Sepsiszentgyörgy");
  assert.equal(result.promotionStatus, "requested");
  assert.equal(result.promotionPlan, "homepage");
  assert.equal(result.ticketUrl, "https://example.com/tickets");
  assert.equal(
    JSON.parse(result.newsLinks[0]).url,
    "https://www.facebook.com/events/123",
  );
  assert.equal(
    mergeLocalityAddress("Marosvásárhely, Fő tér", "Marosvásárhely"),
    "Marosvásárhely, Fő tér",
  );
  assert.throws(
    () =>
      submissionOptions({
        facebookUrl: "https://facebook.com.evil.test/events/123",
      }),
    RangeError,
  );
  assert.throws(
    () => submissionOptions({ ticketUrl: "javascript:alert(1)" }),
    RangeError,
  );
});
test("same-title same-day events in different towns stay separate", () => {
  const existing = { ...event, id: 1, newsLinks: [] };
  assert.equal(
    findImportedEvent([existing], {
      ...event,
      location: "Művelődési Ház",
      locationAddress: "Csíkszereda",
    }),
    undefined,
  );
  assert.equal(
    findImportedEvent([existing], { ...event, location: "Palatul Culturii" })
      ?.id,
    1,
  );
  assert.equal(
    findImportedEvent(
      [
        {
          ...existing,
          newsLinks: [JSON.stringify({ url: "https://example.com/event" })],
        },
      ],
      {
        ...event,
        urls: ["https://example.com/event"],
        title: "Más cím",
        locationAddress: "Más város",
      },
    )?.id,
    1,
  );
});
test("Covasna interval excludes publication dates and uses actual venue, not artist birthplace", () => {
  const html =
    '<h1>Flashback kiállítás</h1><div class="date-intervals"><time datetime="2026-10-07T18:00:00+03:00"></time><time datetime="2026-10-30T16:00:00+02:00"></time></section><div class="trix-content">A művész Székelyudvarhelyen született.</div><time datetime="2026-10-01T12:00:00+03:00"></time>';
  const result = parseRegionalSource(
    html,
    "https://visitcovasna.com/flashback",
    "Visit Covasna",
    now,
    { location: "Kádár László Képtár", address: "Str. Școlii 33, Covasna" },
  );
  assert.equal(result?.location, "Kádár László Képtár");
  assert.equal(findRegionPlace(result?.locationAddress)?.slug, "kovaszna");
  assert.equal(result?.endDate.toISOString(), "2026-10-30T14:00:00.000Z");
  assert.equal(
    parseRegionalSource(
      html,
      "https://visitcovasna.com/flashback",
      "Visit Covasna",
      now,
    ),
    null,
  );
  const refs = covasnaVenueReferences(
    '<div class="date-intervals"></section><a href="/keptar"><h3>Képtár</h3></a><div class="trix-content">',
  );
  assert.equal(refs[0].name, "Képtár");
  assert.equal(
    covasnaVenueAddress(
      '<div class="cms-location__address"><i></i><span>Covasna</span></div>',
    ),
    "Covasna",
  );
});
test("Mures skips unknown start times and preserves event-specific ticket link", () => {
  const html =
    '<a href="https://bilete.visitmures.com/">Jegyek</a><h1>Őszi koncert</h1><div class="event-details"><img src="/poster.jpg"><span class="detailed-date">2026 október 21</span><div id="location"><u>Kultúrpalota, Marosvásárhely</u></div><div class="container main-desc">Kezdés 19:00. Jegyek: <a href="https://bilete.visitmures.com/koncert123">Jegyek</a></div><!-- EOF event-details -->';
  const result = parseRegionalSource(
    html,
    "https://visitmures.com/hu/esemenyek/test",
    "Visit Mureș",
    now,
  );
  assert.equal(result?.startDate.toISOString(), "2026-10-21T16:00:00.000Z");
  assert.equal(result?.ticketUrl, "https://bilete.visitmures.com/koncert123");
  assert.equal(
    parseRegionalSource(
      html.replace("Kezdés 19:00.", "Kezdés a forrásnál."),
      "https://visitmures.com/hu/esemenyek/test",
      "Visit Mureș",
      now,
    ),
    null,
  );
});

test("Harghita clock times are Bucharest wall times in summer and winter", () => {
  const h = (date, time) =>
    '<div class="event_date"><div>' +
    date +
    "</div><span>" +
    time +
    "</span></section>";
  assert.equal(
    harghitaEventDates(
      h("szombat, 31 október 2026", "19:00 - 20:30"),
    ).startDate.toISOString(),
    "2026-10-31T17:00:00.000Z",
  );
  assert.equal(
    harghitaEventDates(
      h("szerda, 21 október 2026", "17:00 - 18:30"),
    ).startDate.toISOString(),
    "2026-10-21T14:00:00.000Z",
  );
  assert.equal(
    harghitaEventDates(
      h("szombat, 31 október 2026", "23:00 - 01:30"),
    ).endDate.toISOString(),
    "2026-10-31T23:30:00.000Z",
  );
});

test("separate performances on the same day stay separate without an identical source",()=>{
 assert.equal(findImportedEvent([{...event,id:1}],{...event,startDate:"2026-10-23T18:00:00Z"}),undefined);
 assert.equal(findImportedEvent([{...event,id:1,title:"Az apa | Tatăl"}],{...event,title:"Az apa"})?.id,1);
});
