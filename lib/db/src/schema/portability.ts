import { pgTable, serial, text, timestamp, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const portabilityStatusEnum = pgEnum("portability_status", [
  "initiated", "under_review", "approved", "rejected", "completed"
]);

export const portabilityRequestsTable = pgTable("portability_requests", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  fromInsurerName: text("from_insurer_name").notNull(),
  toInsurerName: text("to_insurer_name").notNull(),
  policyNumber: text("policy_number").notNull(),
  sumInsured: numeric("sum_insured", { precision: 12, scale: 2 }).notNull(),
  newSumInsured: numeric("new_sum_insured", { precision: 12, scale: 2 }),
  portabilityReason: text("portability_reason"),
  previousClaimHistory: text("previous_claim_history"),
  status: portabilityStatusEnum("status").notNull().default("initiated"),
  requestedAt: timestamp("requested_at").notNull(),
  effectiveDate: timestamp("effective_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPortabilitySchema = createInsertSchema(portabilityRequestsTable).omit({ id: true, createdAt: true });
export type InsertPortability = z.infer<typeof insertPortabilitySchema>;
export type PortabilityRequest = typeof portabilityRequestsTable.$inferSelect;
