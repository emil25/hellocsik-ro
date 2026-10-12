import { index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { eventsTable } from "./events";

export const eventReportsTable = pgTable("event_reports", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => eventsTable.id, { onDelete: "set null" }),
  eventTitle: text("event_title").notNull(),
  reason: text("reason").notNull(),
  message: text("message"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
}, (table) => [index("event_reports_status_created_at_idx").on(table.status, table.createdAt)]);

export type EventReportRow = typeof eventReportsTable.$inferSelect;
