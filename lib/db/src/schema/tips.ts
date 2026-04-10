import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tipsTable = pgTable("tips", {
  id: serial("id").primaryKey(),
  institution: text("institution").notNull(),
  programName: text("program_name"),
  state: text("state").notNull(),
  cutType: text("cut_type").notNull(),
  announcementDate: text("announcement_date"),
  sourceUrl: text("source_url"),
  description: text("description").notNull(),
  submitterEmail: text("submitter_email"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTipSchema = createInsertSchema(tipsTable).omit({ id: true, createdAt: true });
export type InsertTip = z.infer<typeof insertTipSchema>;
export type Tip = typeof tipsTable.$inferSelect;
