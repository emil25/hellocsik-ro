# HelloCsík

Magyar nyelvű programajánló Csíkszeredának és a Csíki-medencének.

## Helyi indítás

Node.js 24 és pnpm 11 szükséges.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Az oldal: http://localhost:5173/ • Szerkesztőség: http://localhost:5173/admin

Az indító létrehozza az üres helyi adatbázist és nyolc programkategóriát. Nem tölt fel kitalált vagy korábbi eseményeket. A véletlenszerű adminjelszót az első indításkor létrejövő `.env.local` fájl `ADMIN_PASSWORD` mezője tartalmazza. Ezt a fájlt ne tedd nyilvánossá.

Az események a `.local/pgdata`, a feltöltött képek a `.local/uploads` mappában maradnak meg újraindítás után is. Ezek nem kerülnek Gitbe. Mentéshez előbb állítsd le a szervert, majd másold el a teljes `.local` mappát és a `.env.local` fájlt biztonságos helyre. Futó adatbázis könyvtárát ne másold mentésként.

A helyi adatbázis a [PGlite fájlrendszeres tárolását](https://pglite.dev/docs/filesystems) használja. Külső PostgreSQL esetén add meg a `DATABASE_URL` változót, és a meglévő Drizzle-séma alapján készítsd elő az adatbázist. A helyi indító kizárólag a saját gépről elérhető címeken figyel.

## Funkciók

- Mobilbarát nyitóoldal, ékezetfüggetlen keresés programnévben, helyszínben és leírásban.
- Kombinálható kategória-, nap- és hétvégeszűrés a következő 100 eseményben, időrendi megjelenítéssel.
- Heti naptár, eseményrészletek, helyszínek.
- Nyilvános programbeküldés adminisztrátori jóváhagyással. A beküldők elérhetőségei nem részei a nyilvános eseményválasznak.
- Adminisztráció és helyi JPG/PNG/WebP képfeltöltés, legfeljebb 10 MB.

## Ellenőrzés

```sh
pnpm --filter @workspace/csikszereda-programajanlat typecheck
pnpm --filter @workspace/csikszereda-programajanlat build
pnpm --filter @workspace/api-server typecheck
pnpm --filter @workspace/api-server build
```

A futó helyi szerver teljes beküldés–jóváhagyás–képfeltöltés folyamatának ellenőrzése: `node scripts/smoke-local.mjs`. A próba saját, ideiglenes eseményét és feltöltött képét a végén törli.

## Éles üzem

Ez a változat helyi fejlesztésre van előkészítve. A közzétételhez Node.js-kiszolgáló, tartós PostgreSQL-adatbázis, saját adminjelszó, képtárolás, HTTPS és mentési rend szükséges. A Replit képtárolási útvonalak megmaradtak, de azokhoz Replit-környezet kell. A jelenlegi Express/PostgreSQL szerver nem telepíthető változtatás nélkül a Sites Cloudflare Workers környezetébe.

A felület a megadott képernyőképet követi: várfotós nyitóoldal, heti naptár, programkártyák, Cloud Youth Festival blokk, moziajanló, helyszínek, beküldés és hírlevél. A hírlevél-feliratkozások a `newsletter_subscriptions` táblába kerülnek; automatikus e-mail-küldés még nincs bekötve. A listát az adminisztrátor a `/api/admin/newsletter` végponton érheti el.

A működő Replit-hivatkozásból hat nyilvános program került át a helyi adatbázisba. Az import előtti mentés a `.local/backups` mappában, az átvett nyilvános adatok a `.local/replit-public-events.json` fájlban találhatók. Ez nem a régi adatbázis teljes mentése. A forrásoldal UTC-ként címkézett helyi időpontjait importáláskor romániai időpontként értelmeztük, hogy az órák a referenciával egyezzenek.

A referenciaoldal képei a `public/reference` mappába kerültek; a forrás-URL-ek a mellette lévő `sources.json` fájlban vannak. A futóverseny eredeti képe 404-es hibát adott, ezért ott jelzett helyettesítő kártyakép látható. A filmkártyák a megadott referencia állapotát tükrözik; az aktuális műsorhoz a mozi oldalára vezetnek.
