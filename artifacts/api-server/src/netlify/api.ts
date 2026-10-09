import serverless from "serverless-http";

process.env.NETLIFY = "true";
process.env.NODE_ENV = "production";
process.env.TZ ??= "Europe/Bucharest";

const { default: app } = await import("../app");
const serve = serverless(app, { binary: ["image/*", "application/octet-stream"] });
export default async function api(request: Request) {
  // Netlify rewrites may expose the function path; support both forms explicitly.
  const prefix = "/.netlify/functions/api";
  const url = new URL(request.url);
  const suffix = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : url.pathname;
  const pathname = suffix.startsWith("/api/") || suffix.startsWith("/esemeny/")
    ? suffix : `/api${suffix || "/"}`;
  const body = ["GET", "HEAD"].includes(request.method) ? null : Buffer.from(await request.arrayBuffer()).toString("base64");
  const response = await serve({
    path: pathname, httpMethod: request.method, headers: Object.fromEntries(request.headers),
    queryStringParameters: Object.fromEntries(url.searchParams), body, isBase64Encoded: body !== null,
  }, {}) as { statusCode: number; headers?: Record<string, string>; multiValueHeaders?: Record<string, string[]>; body: string; isBase64Encoded?: boolean };
  const headers = new Headers(response.headers);
  for (const [name, values] of Object.entries(response.multiValueHeaders ?? {})) {
    headers.delete(name);
    for (const value of values) headers.append(name, value);
  }
  const bytes = response.isBase64Encoded ? Buffer.from(response.body, "base64") : response.body;
  return new Response(request.method === "HEAD" || [204, 304].includes(response.statusCode) ? null : bytes, { status: response.statusCode, headers });
}
