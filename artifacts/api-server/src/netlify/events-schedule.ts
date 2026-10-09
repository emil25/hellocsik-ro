import { startNetlifySourceSync } from "../lib/netlify-source-sync";

export default async function scheduledEvents() {
  // Enable only after the old Render scheduler has been stopped at cutover.
  if (process.env.SOURCE_SYNC_ENABLED !== "true") return;
  await startNetlifySourceSync();
}
