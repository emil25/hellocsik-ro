import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { eventInputToISO, toEventInput, eventOccursOnDate, assertEventRange } from "../shared/event-time.mjs";
import { renderEventPageMeta } from "../artifacts/api-server/src/lib/event-page-meta.ts";
import { normalizeEventDates } from "../artifacts/api-server/src/lib/event-dates.ts";
import { normalizeSearchText } from "../artifacts/csikszereda-programajanlat/src/lib/search.ts";

test("local event time is independent of visitor/server timezone in summer and winter", () => {
  const originalZone = process.env.TZ;
  try {
    for (const zone of ["UTC", "Europe/Bucharest", "America/Los_Angeles", "Asia/Tokyo"]) {
      process.env.TZ = zone;
      assert.equal(eventInputToISO("2026-11-08T18:00"), "2026-11-08T16:00:00.000Z");
      assert.equal(eventInputToISO("2026-10-06T18:00"), "2026-10-06T15:00:00.000Z");
      assert.equal(toEventInput("2026-11-08T16:00:00Z"), "2026-11-08T18:00");
    }
  } finally { if (originalZone === undefined) delete process.env.TZ; else process.env.TZ = originalZone; }
});

test("unchanged editing preserves the original instant, seconds and repeated DST hour", () => {
  for (const original of ["2026-11-08T16:00:00Z", "2026-12-31T21:59:59Z", "2026-10-25T01:30:00Z", "2026-10-25T00:30:00Z"]) {
    assert.equal(eventInputToISO(toEventInput(original), original), new Date(original).toISOString());
  }
  assert.equal(eventInputToISO("2026-10-25T03:30"), "2026-10-25T00:30:00.000Z");
});

test("invalid dates, DST gaps and reversed date ranges are rejected", () => {
  for (const value of ["", "nonsense", "2026-02-30T12:00", "2026-03-29T03:30", "2026-10-06T25:00"]) {
    assert.throws(() => eventInputToISO(value), RangeError);
  }
  assert.throws(() => assertEventRange("2026-10-06T18:00", "2026-10-05T18:00"), RangeError);
});

test("multi-day exhibition appears through the final day and across DST/month boundaries", () => {
  const exhibition = { startDate: "2026-10-06T15:00:00Z", endDate: "2026-12-31T21:59:59Z" };
  for (const day of ["2026-10-06", "2026-10-08", "2026-10-25", "2026-11-01", "2026-12-31"]) assert.ok(eventOccursOnDate(exhibition, day));
  for (const day of ["2026-10-05", "2027-01-01"]) assert.equal(eventOccursOnDate(exhibition, day), false);
  assert.equal(eventOccursOnDate({ startDate: "2026-10-06T15:00Z" }, "2026-10-07"), false);
  assert.equal(eventOccursOnDate({ startDate: "2026-10-06T15:00Z", endDate: "2026-10-06T21:00Z" }, "2026-10-07"), false);
});

test("write routes normalize before schema coercion and reject invalid input", () => {
  for (const body of [{ startDate: "2026-11-08T18:00", endDate: "" }, { startDate: "2026-11-08T18:00+02:00" }]) {
    let nextCalled = false;
    normalizeEventDates({ body }, { status() { assert.fail("valid input rejected"); } }, () => { nextCalled = true; });
    assert.equal(body.startDate, "2026-11-08T16:00:00.000Z");
    assert.ok(nextCalled);
  }
  for (const body of [{ startDate: null }, { endDate: "2026-02-30T12:00" }, { startDate: "2026-10-06T18:00", endDate: "2026-10-05T18:00" }]) {
    const response = { status(code) { assert.equal(code, 400); return this; }, json(data) { assert.ok(data.error); } };
    normalizeEventDates({ body }, response, () => assert.fail("invalid input accepted"));
  }
});

test("search matches accents, case and extra spaces", () => {
  assert.equal(normalizeSearchText("  MOGÁCS   Dániel "), normalizeSearchText("mogacs daniel"));
  assert.ok(normalizeSearchText("Csíkszereda, Művészetek Háza").includes(normalizeSearchText("muveszetek haza")));
});

const template = readFileSync(new URL("../artifacts/csikszereda-programajanlat/index.html", import.meta.url), "utf8");
const preview = { id: 79, title: "A Székely himnusz története", description: "A kiállítás bemutatja a himnusz történetét.", imageUrl: "/events/szekely-himnusz-tortenete-2026.jpg", location: "Csíki Székely Múzeum" };

test("initial HTML has unique event metadata and absolute poster/canonical URLs", () => {
  const html = renderEventPageMeta(template, preview, "https://hellocsik-ro.onrender.com");
  assert.match(html, /property="og:title" content="A Székely himnusz története – HelloCsík"/);
  assert.match(html, /property="og:image" content="https:\/\/hellocsik-ro.onrender.com\/events\/szekely-himnusz-tortenete-2026.jpg"/);
  assert.match(html, /rel="canonical" href="https:\/\/hellocsik-ro.onrender.com\/esemeny\/79"/);
  assert.equal((html.match(/property="og:title"/g) ?? []).length, 1);
  assert.ok(!html.includes("Miko_castle"));
});

test("event content cannot escape metadata and unpublished events have noindex", () => {
  const html = renderEventPageMeta(template, { ...preview, title: '\"/><script>alert(1)</script>', imageUrl: "javascript:alert(1)" }, "https://hellocsik-ro.onrender.com");
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.match(html, /&quot;\/>?&lt;script&gt;|&quot;\/&gt;&lt;script&gt;/);
  assert.match(html, /https:\/\/hellocsik-ro.onrender.com\/hellocsik-logo.png/);
  assert.match(renderEventPageMeta(template, null, "https://hellocsik-ro.onrender.com"), /name="robots" content="noindex, follow"/);
});
