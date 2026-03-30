import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const callDirectionEnum = pgEnum("call_direction", ["inbound", "outbound"]);
export const callOutcomeEnum = pgEnum("call_outcome", ["connected", "missed", "voicemail", "busy"]);

export const callLogsTable = pgTable("call_logs", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id"),
  callerId: integer("caller_id").notNull(),
  callerName: text("caller_name").notNull(),
  callerRole: text("caller_role").notNull(),
  receiverName: text("receiver_name").notNull(),
  receiverRole: text("receiver_role").notNull(),
  direction: callDirectionEnum("direction").notNull(),
  duration: integer("duration"),
  outcome: callOutcomeEnum("outcome").notNull(),
  notes: text("notes"),
  summary: text("summary"),
  finalDecision: text("final_decision"),
  callDate: timestamp("call_date").notNull(),
  expiresAt: timestamp("expires_at").default(sql`NOW() + INTERVAL '1 year'`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCallLogSchema = createInsertSchema(callLogsTable).omit({ id: true, createdAt: true, expiresAt: true });
export type InsertCallLog = z.infer<typeof insertCallLogSchema>;
export type CallLog = typeof callLogsTable.$inferSelect;
