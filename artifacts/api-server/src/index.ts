import app from "./app";
import { logger } from "./lib/logger";
import { startSourceSyncScheduler } from "./lib/source-sync";
import { restoreLegacyEvents } from "./lib/legacy-restore";

process.env.TZ ??= "Europe/Bucharest";

const rawPort = process.env["PORT"] ?? "8080";

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

try {
  const restored = await restoreLegacyEvents();
  if (restored > 0) logger.info({ restored }, "Legacy public events restored");
} catch (err) {
  logger.warn({ err }, "Legacy event restore skipped");
}

app.listen(port, process.env.HOST ?? "0.0.0.0", (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  startSourceSyncScheduler(logger);
});
