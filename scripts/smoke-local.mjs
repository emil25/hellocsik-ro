import assert from "node:assert/strict";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
process.loadEnvFile(path.join(root, ".env.local"));
const base = "http://127.0.0.1:5173";
const auth = { Authorization: `Bearer ${process.env.ADMIN_PASSWORD}` };
const json = { "Content-Type": "application/json" };
const call = (route, options = {}) => fetch(`${base}/api${route}`, { ...options, signal: AbortSignal.timeout(15000) });
let eventId;
let uploadPath;
try {
  const categories = await (await call("/categories")).json();
  assert.ok(categories.categories.length >= 8, "Local categories loaded");
  const week = await (await call("/events/this-week")).json();
  const nextWeek = await (await call("/events/this-week?weekOffset=1")).json();
  assert.equal(week.days.length, 7);
  assert.equal(new Date(`${week.days[0].date}T12:00:00`).getDay(), 1, "Week begins on Monday");
  const expectedNext = new Date(`${week.days[0].date}T12:00:00`);
  expectedNext.setDate(expectedNext.getDate() + 7);
  assert.equal(new Date(`${nextWeek.days[0].date}T12:00:00`).getTime(), expectedNext.getTime());
  assert.equal((await call("/events/this-week?weekOffset=nope")).status, 400);
  assert.equal((await call("/admin/events")).status, 401);
  assert.equal((await call("/events", { method: "POST", headers: json, body: "{}" })).status, 401);
  const tomorrow = new Date(Date.now() + 86400000).toISOString();
  const submitted = await call("/events/submit", { method: "POST", headers: json, body: JSON.stringify({
    title: "HelloCsík automatikus ellenőrzés", description: "Ideiglenes tesztesemény, automatikusan törlődik.",
    startDate: tomorrow, location: "Teszt helyszín", categoryId: categories.categories[0].id,
    submitterName: "Test", submitterEmail: "test@example.invalid",
  }) });
  assert.equal(submitted.status, 201, "Image is optional in public submission");
  eventId = (await submitted.json()).id;
  assert.ok(Number.isInteger(eventId));
  assert.equal((await call(`/events/${eventId}`)).status, 404, "Pending event is private");
  const publicBefore = await (await call("/events?limit=100")).json();
  assert.ok(!publicBefore.events.some(event => event.id === eventId));
  const approved = await call(`/admin/events/${eventId}`, { method: "PATCH", headers: { ...json, ...auth }, body: JSON.stringify({ status: "published" }) });
  assert.equal(approved.status, 200);
  const event = await (await call(`/events/${eventId}`)).json();
  assert.equal(event.id, eventId);
  assert.ok(!("submitterEmail" in event) && !("submitterName" in event), "Contact data remains private");
  const upcoming = await (await call("/events/upcoming?limit=100")).json();
  assert.ok(upcoming.events.some(item => item.id === eventId));
  const image = await readFile(path.join(root, "artifacts/csikszereda-programajanlat/public/hellocsik-logo.png"));
  const uploadRequest = await call("/storage/uploads/request-url", { method: "POST", headers: { ...json, ...auth }, body: JSON.stringify({ name: "test.png", size: image.length, contentType: "image/png" }) });
  assert.equal(uploadRequest.status, 200);
  const upload = await uploadRequest.json();
  const result = await fetch(upload.uploadURL, { method: "PUT", headers: { "Content-Type": "image/png" }, body: image });
  assert.equal(result.status, 204);
  assert.match(upload.objectPath, /^\/objects\/local\/[a-f0-9-]{36}\.png$/);
  uploadPath = path.join(root, ".local/uploads", path.basename(upload.objectPath));
  const imageResponse = await call(`/storage${upload.objectPath}`);
  assert.equal(imageResponse.status, 200);
  assert.equal(imageResponse.headers.get("x-content-type-options"), "nosniff");
  assert.deepEqual(Buffer.from(await imageResponse.arrayBuffer()), image);
  console.log("PASS: categories, calendar navigation, admin protection, submission, moderation, public privacy, upcoming events, image upload/readback.");
} finally {
  if (eventId) {
    const deleted = await call(`/admin/events/${eventId}`, { method: "DELETE", headers: auth });
    assert.equal(deleted.status, 200, "Temporary event cleaned up");
  }
  if (uploadPath) await unlink(uploadPath);
}
