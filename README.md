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

### Render telepítés

A gyökérben lévő `render.yaml` egy Node webszolgáltatást készít. A `pnpm build:app` felépíti az API-t és a React felületet, a szerver pedig ugyanazon a nyilvános címen szolgálja ki mindkettőt. Telepítéskor tartós PostgreSQL-kapcsolatot kell megadni `DATABASE_URL` néven. Az adatbázis táblái és az alap kategóriák az első induláskor automatikusan létrejönnek. Az `ADMIN_PASSWORD` titkos változó; a `FIRECRAWL_API_KEY` elhagyható, de nélküle a gazdagabb automatikus forrásfrissítés nem fut.

### Adatbázismentés és ingyenes külső adatbázis

A Render ingyenes PostgreSQL-je 30 nap után lejár. Az ingyenes webszolgáltatás külső PostgreSQL-lel is működhet (például Neon Free); ehhez a `render-external-database.yaml` tartalmaz alternatív konfigurációt. A meglévő telepítésnél csak az adatbázis-kapcsolatot kell átállítani a sikeres visszaállítás után. A webszolgáltatás ingyenes csomagjának alvása és használati korlátai ettől megmaradnak.

Az adminjelszóval védett `GET /api/admin/database-backup` az öt alkalmazástábla konzisztens JSON-mentését adja, a szervezői jelszólenyomatokkal, beküldői adatokkal és számlálókkal együtt. A fájl személyes adatokat tartalmaz: csak a Gitből kizárt `.local/backups` mappába vagy más biztonságos helyre kerüljön. A mentés nem tartalmaz képfájlokat, környezeti titkokat vagy más PostgreSQL-sémákat. A képeket és az `ADMIN_PASSWORD` értékét külön kell megőrizni.

Letöltés a helyi `.env.local` adminjelszavával: `node scripts/backup-database.mjs`. A program ellenőrzi a mentés szerkezetét, a `.local/backups` mappába ment és SHA-256 ellenőrzőösszeget készít. Másik webcímhez a `HELLOCSIK_SITE_URL` környezeti változó használható.

Visszaállítás kizárólag új, üres adatbázisba, biztonságosan megadott `RESTORE_DATABASE_URL` környezeti változóval:

```sh
pnpm --filter @workspace/scripts exec tsx ./restore-database.ts /absolute/path/backup.json
```

A művelet tranzakcióban őrzi meg az azonosítókat, szervezőket, időpontokat és azonosítószámlálókat; meglévő adat esetén leáll. A teljes mentés–visszaállítás próbája: `pnpm --filter @workspace/scripts exec tsx ./test-database-backup.ts`. Éles költözéskor a mentés és az átállás között ne történjen szerkesztés vagy beküldés; a régi adatbázist csak az ellenőrzött átállás után szabad kivezetni.
