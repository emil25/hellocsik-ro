# HelloCsík on Netlify Free

The frontend is served from Netlify's CDN. The existing Express API runs in a
modern Netlify Function; the existing Neon PostgreSQL database is reused.

## Build and verification

```sh
pnpm install --frozen-lockfile
pnpm build:netlify
node scripts/verify-netlify.mjs
```

The verification uses an isolated, in-memory database and a simulated Blobs
service. It does not read or modify the live Neon database.

## Private runtime configuration

Set these in Netlify's project environment settings, never in tracked files:

- `DATABASE_URL`: the existing Neon pooled connection, retaining SSL verification.
- `ADMIN_PASSWORD`: preserve the existing admin password.
- `URL`: provided by Netlify; `PUBLIC_SITE_URL` can override it for a custom domain.
- `SOURCE_SYNC_ENABLED`: initially `false`; enable only at cutover after stopping
  the old Render scheduler. The published site runs source refresh every six hours.
- `ORGANIZER_AUTH_SECRET`: copy it if the previous host used an explicit value;
  otherwise existing authentication continues to use the preserved admin secret.
- `FIRECRAWL_API_KEY`: optional; only copy if it was enabled on the old production
  host. The direct Visit Harghita import works without it.

Image uploads use a persistent site-level Netlify Blobs store and accept JPG,
PNG and WebP files up to 3 MB. Upload authorization is stateless and short lived.
Background source refresh uses a separate store for persistent job progress and
conditional writes to prevent simultaneous refresh jobs.

## Cutover

Before switching users to the new URL, verify the live admin, public events,
event details and sharing metadata, organizer login, moderated submission and
image upload. Compare an authenticated database backup with the existing Neon
data, including unpublished events. Retain the original host for rollback until
the new deployment has passed these checks; stop its scheduler before enabling
the new schedule. Do not delete the old Render database or private backups.

The Free plan has a monthly usage cap. Keep paid upgrades and automatic credit
purchases disabled. A Free plan can pause at its usage cap.
