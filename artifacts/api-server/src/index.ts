import app from "./app";
import { logger } from "./lib/logger";
import { startSourceSyncScheduler } from "./lib/source-sync";

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

app.listen(port, process.env.HOST ?? "127.0.0.1", (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  startSourceSyncScheduler(logger);
});
