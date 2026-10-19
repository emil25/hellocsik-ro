# Hello Székelyföld – regional portal

The original HelloCsík stays at /. The separate regional router and brand live under /szekelyfold/.

## Discovery and geography

- A full-width yellow photographic masthead introduces the portal, with time shortcuts and a seasonal feature teaser. Event-poster recommendations sit below the search instead of being the opening hero. Manual navigation changes the featured events; contained images keep the complete poster visible.
- A Hello-family wordmark, matching header/footer and separate regional page/share metadata and favicon. Classic HelloCsík branding remains intact.
- City navigation and venue links sit below the main results in a distinct green band. The pale area tiles have been removed from the homepage; areas remain accessible in the directory and extra search filters. Saturated topic tiles filter results by category.
- Weekly editorial mosaic and a contrasting blue weekend band. No left sidebar; the compact search bar expands extra filters inline.
- The 2026 October 23 anniversary has a separate burgundy/cream editorial placement with real event links, city tabs, an expand control and official sources. It expires after October 23 and excludes unrelated or stale events. It is editorial, not a paid promotion. The public source posters are retained under public/events/.
- Full results start with eight cards and load eight more on demand. Curated sections are replaced by results when filters are active. Filter shortcuts use a results anchor after the layout changes.
- URL-preserved search, category, explicit free entry, date presets, custom interval and sorting.
- /varos/:slug and /terseg/:area are shareable inside the regional prefix.
- shared/region-places.mjs supplies six areas and a bilingual directory of cities and smaller settlements. Addresses take precedence over titles. Unclassified events remain accessible in all results and under other.
- Nearby means the other settlements of the chosen area, not a GPS distance calculation.
- Month calendar supports the same directory. Regional venue identities include the town so identically named venues in different cities do not share a calendar.

## Sources and safeguards

The existing six-hour scheduler now combines Visit Harghita, Visit Covasna and Visit Mureș. Optional configured Firecrawl sources remain supported. Provider failures are independent. Covasna uses its public Turbo frames and follows the event's venue record for the actual address, avoiding performer birthplaces and organizer headquarters. Mureș records without a confirmed clock time are skipped. These providers do not guarantee exhaustive regional coverage. /forrasok shows source links, current event counts and latest stored event updates; it does not claim those are crawler check times.

Deduplication uses canonical event source/ticket links, then title, Bucharest date/time and settlement. Separate same-day performances and different towns remain separate. New Harghita imports interpret clock times in Europe/Bucharest. For older automatic imports, a once-only correction is made only when a freshly verified source reveals exactly the recognizable legacy UTC offset (two or three hours on the same local day). Other stored times are preserved.

## Submission

Guests and authenticated organizers preserve a separate ticket URL and Facebook source link. Locality is stored with the address, optional closing dates are range-validated, and organizer identity comes from server-side authentication. Paid visibility can only be requested; submitting a promotion never marks it paid. Normal publication is free and submissions remain pending moderation.

## Checks

node --test tests/regional-portal.test.mjs tests/event-improvements.test.mjs

Frontend and API TypeScript checks plus pnpm build:netlify must pass before publication. Browser checks cover URL-preserved city/date search, month calendar cards, labels, desktop/mobile overflow and navigation. Do not create test submissions in production.
