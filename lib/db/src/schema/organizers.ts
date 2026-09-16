import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const organizersTable = pgTable("organizers", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  bio: text("bio").notNull().default(""),
  city: text("city").notNull().default("Székelyföld"),
  website: text("website"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type OrganizerRow = typeof organizersTable.$inferSelect;

