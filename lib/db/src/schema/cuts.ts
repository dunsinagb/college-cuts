import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cutsTable = pgTable("cuts", {
  id: serial("id").primaryKey(),
  institution: text("institution").notNull(),
  programName: text("program_name"),
  state: text("state").notNull(),
  control: text("control"),
  cutType: text("cut_type").notNull(),
  announcementDate: text("announcement_date").notNull(),
  effectiveTerm: text("effective_term"),
  studentsAffected: integer("students_affected"),
  facultyAffected: integer("faculty_affected"),
  notes: text("notes"),
  sourceUrl: text("source_url"),
  sourcePublication: text("source_publication"),
  status: text("status").default("confirmed"),
  category: text("category").default("Academic"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCutSchema = createInsertSchema(cutsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCut = z.infer<typeof insertCutSchema>;
export type Cut = typeof cutsTable.$inferSelect;
