import { authorizedSync, runNetlifySourceSync } from "../lib/netlify-source-sync";

export default async function syncEvents(request: Request) {
  if (request.method !== "POST" || !authorizedSync(request.headers.get("authorization"))) return;
  let body: unknown;
  try { body = await request.json(); } catch { return; }
  if (!body || typeof body !== "object" || !("jobId" in body) || typeof body.jobId !== "string" || !/^[a-f0-9-]{36}$/.test(body.jobId)) return;
  process.env.NETLIFY = "true";
  process.env.NODE_ENV = "production";
  process.env.TZ ??= "Europe/Bucharest";
  await runNetlifySourceSync(body.jobId);
}
