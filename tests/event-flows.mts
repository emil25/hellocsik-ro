import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { eventInputToISO, toEventInput } from "../shared/event-time.mjs";

// An isolated local database: never inherit production connections or credentials.
process.env.DATABASE_URL = "";
process.env.PGLITE_DATA_DIR = mkdtempSync(path.join(tmpdir(), "hellocsik-event-tests-"));
process.env.ADMIN_PASSWORD = randomBytes(32).toString("hex");
process.env.NODE_ENV = "production";
process.env.TZ = "UTC";
process.env.STATIC_DIR = fileURLToPath(new URL("../artifacts/csikszereda-programajanlat/dist/public", import.meta.url));
const { default: app } = await import("../artifacts/api-server/src/app.ts");
const server = app.listen(0, "127.0.0.1");
await new Promise<void>(resolve => server.once("listening", resolve));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const admin = { Authorization: `Bearer ${process.env.ADMIN_PASSWORD}` };
const baseEvent = { title: "Időpontpróba", description: "Helyi tesztadat", imageUrl: "/events/test.jpg", startDate: "2026-11-08T18:00", endDate: "2026-11-08T20:00", location: "Csíkszereda" };

async function send(route: string, body: object, auth: Record<string, string> = {}, method = "POST", status = 201) {
  const response = await fetch(base + route, { method, headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify(body) });
  assert.equal(response.status, status, `${method} ${route}: ${await response.clone().text()}`);
  return response.json();
}

let failed = false;
try {
  const created = await send("/api/admin/events", baseEvent, admin);
  assert.equal(created.startDate, "2026-11-08T16:00:00.000Z");
  const unchanged = await send(`/api/admin/events/${created.id}`, { title: "Javított cím", startDate: eventInputToISO(toEventInput(created.startDate), created.startDate) }, admin, "PATCH", 200);
  assert.equal(unchanged.startDate, created.startDate);
  await send(`/api/admin/events/${created.id}`, { startDate: "2026-11-09T18:00" }, admin, "PATCH", 400);
  await send(`/api/admin/events/${created.id}`, { endDate: "2026-11-07T18:00" }, admin, "PATCH", 400);
  await send("/api/admin/events", { ...baseEvent, startDate: "2026-03-29T03:30" }, admin, "POST", 400);
  const publicEvent = await send("/api/events/submit", { ...baseEvent, title: "Beküldött próba", startDate: "2026-10-06T18:00", endDate: null });
  const organizer = await send("/api/organizers/register", { name: "Helyi próbaszervező", email: "qa@example.test", password: randomBytes(24).toString("hex") });
  const organizerAuth = { Authorization: `Bearer ${organizer.token}` };
  const organizerEvent = await send("/api/organizers/me/events", { ...baseEvent, title: "Szervezői próba" }, organizerAuth);
  const own = await fetch(base + "/api/organizers/me/events", { headers: organizerAuth }).then(response => response.json());
  assert.equal(own.events[0].startDate, "2026-11-08T16:00:00.000Z");
  await send(`/api/organizers/me/events/${organizerEvent.id}`, { title: "Átnevezett szervezői próba", startDate: eventInputToISO(toEventInput(own.events[0].startDate), own.events[0].startDate) }, organizerAuth, "PATCH", 200);
  await send(`/api/organizers/me/events/${organizerEvent.id}`, { startDate: "2026-11-09T18:00" }, organizerAuth, "PATCH", 400);
  const all = await fetch(base + "/api/admin/events?status=all", { headers: admin }).then(response => response.json());
  assert.equal(all.events.find((event: {id: number}) => event.id === publicEvent.id).startDate, "2026-10-06T15:00:00.000Z");
  assert.equal(all.events.find((event: {id: number}) => event.id === organizerEvent.id).startDate, "2026-11-08T16:00:00.000Z");
  const publicPage = await fetch(base + `/esemeny/${created.id}`);
  assert.equal(publicPage.status, 200);
  assert.match(await publicPage.text(), /property="og:title" content="Javított cím – HelloCsík"/);
  for (const id of [publicEvent.id, organizerEvent.id, 99999999]) {
    const response = await fetch(base + `/esemeny/${id}`);
    assert.equal(response.status, 404);
    assert.match(await response.text(), /name="robots" content="noindex, follow"/);
  }
  console.log("PASS: admin, public submission, organizer editing, partial date validation, published metadata and pending-page isolation.");
} catch (error) {
  failed = true;
  console.error(error);
} finally {
  server.close();
  process.exit(failed ? 1 : 0);
}
