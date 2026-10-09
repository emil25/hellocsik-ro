import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Exercise the production bundles against an isolated local database and a
// simulated Blobs service. No live database or external calendar is contacted.
delete process.env.DATABASE_URL;
delete process.env.FIRECRAWL_API_KEY;
process.env.PGLITE_DATA_DIR = "memory://";
process.env.ADMIN_PASSWORD = "isolated-netlify-verification";
process.env.ORGANIZER_AUTH_SECRET = "isolated-organizer-verification";
process.env.LOG_LEVEL = "silent";
process.env.NETLIFY = "true";
process.env.URL = "https://hellocsik-test.netlify.app";
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({
  edgeURL: "https://blobs.test", uncachedEdgeURL: "https://blobs.test", siteID: "verification", token: "verification",
})).toString("base64");

const blobs = new Map();
let enqueued = 0;
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(String(input));
  if (url.hostname === "hellocsik-test.netlify.app") {
    assert.equal(url.pathname, "/.netlify/functions/events-sync-background");
    assert.equal(options.headers.Authorization, `Bearer ${process.env.ADMIN_PASSWORD}`);
    enqueued++;
    return new Response(null, { status: 202 });
  }
  if (url.hostname === "visitharghita.com") return new Response("<html><body></body></html>");
  assert.equal(url.hostname, "blobs.test", "The verification must not contact real services");
  const headers = new Headers(options.headers);
  const old = blobs.get(url.pathname);
  if (options.method === "put") {
    if ((headers.get("if-none-match") === "*" && old) || (headers.has("if-match") && old?.etag !== headers.get("if-match"))) {
      return new Response(null, { status: 412 });
    }
    const bytes = typeof options.body === "string" ? Buffer.from(options.body) : Buffer.from(options.body);
    const etag = `"${createHash("sha256").update(bytes).digest("hex")}"`;
    blobs.set(url.pathname, { bytes, etag, metadata: headers.get("x-amz-meta-user") });
    return new Response(null, { status: 200, headers: { etag } });
  }
  if (!old) return new Response(null, { status: 404 });
  return new Response(old.bytes, { headers: { etag: old.etag, ...(old.metadata ? { "x-amz-meta-user": old.metadata } : {}) } });
};

const moduleURL = pathToFileURL(path.resolve("artifacts/api-server/dist/netlify/api.mjs")).href;
const { default: api } = await import(moduleURL);
const adminHeaders = { Authorization: `Bearer ${process.env.ADMIN_PASSWORD}` };
async function call(url, method = "GET", body, headers = {}, serve = api) {
  return serve(new Request(new URL(url, process.env.URL), {
    method, headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  }));
}
async function json(response, status = 200) {
  assert.equal(response.status, status, await response.clone().text());
  return response.json();
}

await json(await call("/api/healthz"));
await json(await call("/.netlify/functions/api/healthz"));
assert.equal((await json(await call("/api/categories"))).categories.length, 8);
assert.equal((await call("/api/admin/events")).status, 401);
await json(await call("/api/admin/login", "POST", { password: process.env.ADMIN_PASSWORD }));

const startDate = new Date(Date.now() + 2 * 86_400_000).toISOString();
const event = { title: "Ellenőrző & esemény", description: "Magyar leírás: ő, ű, á.", startDate, location: "Csíkszereda, ellenőrző helyszín", price: "50 RON", ticketUrl: "https://tickets.example/event", imageUrl: "/hellocsik-logo.png" };
const submitted = await json(await call("/api/events/submit", "POST", { ...event, submitterName: "Private Contact", submitterEmail: "private@example.test" }), 201);
assert.equal((await json(await call("/api/events"))).events.length, 0, "Public submissions must await approval");
await json(await call(`/api/admin/events/${submitted.id}`, "PATCH", { status: "published" }, adminHeaders));
const published = await json(await call("/api/events"));
assert.equal(published.events[0].title, event.title);
assert.equal(published.events[0].price, "50 RON");
assert.equal(published.events[0].ticketUrl, event.ticketUrl);
assert.ok(!JSON.stringify(published).includes("private@example.test"), "Private submitter contacts must not be public");
const detail = await call(`/esemeny/${submitted.id}`);
assert.equal(detail.status, 200);
const html = await detail.text();
assert.ok(html.includes("Ellenőrző &amp; esemény"));
assert.ok(html.includes(`https://hellocsik-test.netlify.app/esemeny/${submitted.id}`));
assert.equal((await call("/esemeny/999999")).status, 404);

const registered = await json(await call("/api/organizers/register", "POST", { name: "Ellenőrző szervező", email: "organizer@example.test", password: "test-password-123", city: "Csíkszereda" }), 201);
const loggedIn = await json(await call("/api/organizers/login", "POST", { email: "organizer@example.test", password: "test-password-123" }));
const organizerHeaders = { Authorization: `Bearer ${loggedIn.token}` };
await json(await call("/api/organizers/me", "GET", undefined, organizerHeaders));
const organized = await json(await call("/api/organizers/me/events", "POST", { ...event, title: "Szervezői program" }, organizerHeaders), 201);
assert.equal(organized.status, "pending");
const ownEvents = await json(await call("/api/organizers/me/events", "GET", undefined, organizerHeaders));
assert.equal(ownEvents.events[0].title, "Szervezői program");
await json(await call(`/api/admin/events/${organized.id}`, "PATCH", { status: "published" }, adminHeaders));
assert.equal((await json(await call("/api/events"))).events.find(item => item.id === organized.id).organizer.id, registered.organizer.id);

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jr9sAAAAASUVORK5CYII=", "base64");
const upload = await json(await call("/api/storage/uploads/request-url", "POST", { name: "test.png", size: png.length, contentType: "image/png" }, adminHeaders));
assert.equal((await api(new Request(new URL(upload.uploadURL, process.env.URL), { method: "PUT", headers: { "Content-Type": "image/png" }, body: png }))).status, 204);
const { default: coldApi } = await import(`${moduleURL}?cold-start=1`);
const downloaded = await call(`/api/storage${upload.objectPath}`, "GET", undefined, {}, coldApi);
assert.equal(downloaded.status, 200);
assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()), png, "Uploaded images must survive a fresh function instance");
assert.equal((await call("/api/storage/uploads/request-url", "POST", { name: "large.png", size: 4 * 1024 * 1024, contentType: "image/png" }, adminHeaders)).status, 400);
assert.equal((await api(new Request(new URL(upload.uploadURL, process.env.URL), { method: "PUT", headers: { "Content-Type": "image/png" }, body: png }))).status, 409, "Upload tickets must not overwrite images");
assert.equal((await call(upload.uploadURL.replace(/ticket=[^&]+/, "ticket=invalid.invalid"), "PUT", undefined, { "Content-Type": "image/png" })).status, 403);

const job = await json(await call("/api/admin/source-sync", "POST", undefined, adminHeaders), 202);
const duplicate = await json(await call("/api/admin/source-sync", "POST", undefined, adminHeaders), 202);
assert.equal(duplicate.jobId, job.jobId);
assert.equal(enqueued, 1, "Simultaneous refresh requests must use the same background job");
const workerURL = pathToFileURL(path.resolve("artifacts/api-server/dist/netlify/events-sync-background.mjs")).href;
const { default: worker } = await import(workerURL);
const workerRequest = headers => new Request(`${process.env.URL}/.netlify/functions/events-sync-background`, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify({ jobId: job.jobId }) });
await worker(workerRequest({ Authorization: "Bearer wrong" }));
let state = await json(await call("/api/admin/source-sync", "GET", undefined, adminHeaders));
assert.equal(state.job.status, "queued");
await worker(workerRequest(adminHeaders));
state = await json(await call("/api/admin/source-sync", "GET", undefined, adminHeaders));
assert.equal(state.job.status, "completed");
assert.equal(state.job.result.imported, 0);
await worker(workerRequest(adminHeaders));
assert.equal((await json(await call("/api/admin/source-sync", "GET", undefined, adminHeaders))).job.status, "completed");

const result = { verifiedAt: new Date().toISOString(), liveDatabaseTouched: false, checks: ["API routing", "admin authentication", "moderated event submission", "private contact protection", "event sharing metadata", "organizer registration and ownership", "persistent image upload", "upload permission and size limits", "background refresh and deduplication"] };
await mkdir(".local/reviews", { recursive: true });
await writeFile(".local/reviews/netlify-verification.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
process.exit(0);
