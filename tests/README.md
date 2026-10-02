# Event regression checks

From the repository root, with Node 24 and the workspace dependencies installed:

```sh
node tests/event-improvements.test.mjs
pnpm build:app
pnpm --filter @workspace/scripts exec tsx ../tests/event-flows.mts
```

The first suite checks Romanian event times in multiple host timezones, daylight-saving transitions, unchanged edits, multi-day overlap, accent-insensitive search and safe event sharing metadata.

The integration check starts Express on a random loopback port with a fresh local PGlite database in the system temporary directory. It overrides inherited database and admin credentials, exercises admin/public/organizer writes, and checks that pending events cannot expose sharing metadata. It imports the app directly, so no import scheduler or legacy restoration runs. It never connects to the live event database.

Production sharing URLs use `PUBLIC_SITE_URL` when configured, otherwise `RENDER_EXTERNAL_URL`, with `https://hellocsik-ro.onrender.com` as the fallback. Set `PUBLIC_SITE_URL` to the canonical HTTPS origin when moving the website to its own domain.
