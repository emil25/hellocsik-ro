import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
export const newsletterTable = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
