import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  displayType: text("display_type").notNull().default("full"),
  active: boolean("active").notNull().default(true),
  position: integer("position").notNull().default(6),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type BannerRow = typeof bannersTable.$inferSelect;
