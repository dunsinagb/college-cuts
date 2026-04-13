import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const connectionRequestsTable = pgTable("connection_requests", {
  id: serial("id").primaryKey(),
  employerEmail: text("employer_email").notNull(),
  employerCompany: text("employer_company").notNull(),
  talentId: text("talent_id").notNull(),
  talentName: text("talent_name").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ConnectionRequest = typeof connectionRequestsTable.$inferSelect;
export type NewConnectionRequest = typeof connectionRequestsTable.$inferInsert;
