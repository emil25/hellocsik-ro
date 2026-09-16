import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";
import { organizersTable } from "./organizers";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location").notNull(),
  locationAddress: text("location_address"),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  organizerId: integer("organizer_id").references(() => organizersTable.id),
  promotionPlan: text("promotion_plan").notNull().default("free"),
  promotionStatus: text("promotion_status").notNull().default("none"),
  featured: boolean("featured").notNull().default(false),
  monthHighlight: boolean("month_highlight").notNull().default(false),
  ticketUrl: text("ticket_url"),
  price: text("price"),
  tags: text("tags").array().notNull().default([]),
  newsLinks: text("news_links").array().notNull().default([]),
  status: text("status").notNull().default("published"),
  submitterName: text("submitter_name"),
  submitterEmail: text("submitter_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventRow = typeof eventsTable.$inferSelect;
