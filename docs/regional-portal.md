# Programtér – regional portal

The original HelloCsík stays at /. The separate regional router and brand live under /szekelyfold/.

## Discovery and geography

- Four equal poster recommendations; contained images with a blurred backdrop.
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
