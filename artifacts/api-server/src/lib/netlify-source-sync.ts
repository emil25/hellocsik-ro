import { getStore } from "@netlify/blobs";
import { randomUUID, timingSafeEqual } from "node:crypto";
import type { syncEventSources } from "./source-sync";

type SyncResult = Awaited<ReturnType<typeof syncEventSources>>;
export type SourceSyncJob = {
  id: string;
  status: "queued" | "running" | "completed" | "failed";
  startedAt: string;
  finishedAt?: string;
  result?: SyncResult;
  error?: string;
};
const store = () => getStore({ name: "hellocsik-source-sync", consistency: "strong" });
const key = "active-job";
const isActive = (job: SourceSyncJob) => ["queued", "running"].includes(job.status)
  && Date.now() - Date.parse(job.startedAt) < 16 * 60_000;

export function authorizedSync(header: string | null) {
  if (!process.env.ADMIN_PASSWORD) return false;
  const expected = Buffer.from(`Bearer ${process.env.ADMIN_PASSWORD}`);
  const actual = Buffer.from(header ?? "");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function getSourceSyncJob() {
  return store().get(key, { type: "json" }) as Promise<SourceSyncJob | null>;
}

export async function startNetlifySourceSync(): Promise<SourceSyncJob> {
  const siteUrl = process.env.PUBLIC_SITE_URL || process.env.URL;
  if (!process.env.ADMIN_PASSWORD || !siteUrl) throw new Error("A forrásfrissítés nincs beállítva.");
  const destination = new URL("/.netlify/functions/events-sync-background", siteUrl);
  if (destination.protocol !== "https:" && process.env.NETLIFY_DEV !== "true") throw new Error("Érvénytelen tárhelycím.");
  const current = await store().getWithMetadata(key, { type: "json" });
  if (current && isActive(current.data as SourceSyncJob)) return current.data as SourceSyncJob;
  const job: SourceSyncJob = { id: randomUUID(), status: "queued", startedAt: new Date().toISOString() };
  // A conditional write prevents simultaneous admin/scheduled requests from duplicating imports.
  const reserved = await store().setJSON(key, job, current?.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true });
  if (!reserved.modified) {
    const active = await getSourceSyncJob();
    if (active) return active;
    throw new Error("A forrásfrissítést próbáld újra.");
  }
  try {
    const response = await fetch(destination, {
      method: "POST", headers: { Authorization: `Bearer ${process.env.ADMIN_PASSWORD}`, "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id }), redirect: "error", signal: AbortSignal.timeout(10_000),
    });
    if (response.status !== 202) throw new Error("A háttérfrissítés nem indult el.");
    return job;
  } catch (error) {
    await store().setJSON(key, { ...job, status: "failed", finishedAt: new Date().toISOString(), error: "A háttérfrissítés nem indult el." }, { onlyIfMatch: reserved.etag! });
    throw error;
  }
}

export async function runNetlifySourceSync(jobId: string) {
  const current = await store().getWithMetadata(key, { type: "json" });
  const job = current?.data as SourceSyncJob | undefined;
  if (!current?.etag || !job || job.id !== jobId || job.status !== "queued" || !isActive(job)) return;
  const running = await store().setJSON(key, { ...job, status: "running" }, { onlyIfMatch: current.etag });
  if (!running.modified) return;
  try {
    const { syncEventSources } = await import("./source-sync");
    const result = await syncEventSources();
    await store().setJSON(key, { ...job, status: "completed", finishedAt: new Date().toISOString(), result }, { onlyIfMatch: running.etag! });
  } catch {
    await store().setJSON(key, { ...job, status: "failed", finishedAt: new Date().toISOString(), error: "A külső eseményforrás most nem érhető el." }, { onlyIfMatch: running.etag! });
  }
}
