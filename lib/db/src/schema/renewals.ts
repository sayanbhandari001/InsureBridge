import { pgTable, serial, text, timestamp, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const renewalStatusEnum = pgEnum("renewal_status", [
  "pending", "initiated", "payment_due", "completed", "lapsed"
]);

export const renewalsTable = pgTable("renewals", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  policyNumber: text("policy_number").notNull(),
  insurerName: text("insurer_name").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  renewalDate: timestamp("renewal_date"),
  currentSumInsured: numeric("current_sum_insured", { precision: 12, scale: 2 }).notNull(),
  newSumInsured: numeric("new_sum_insured", { precision: 12, scale: 2 }),
  currentPremium: numeric("current_premium", { precision: 12, scale: 2 }).notNull(),
  newPremium: numeric("new_premium", { precision: 12, scale: 2 }),
  status: renewalStatusEnum("status").notNull().default("pending"),
  memberCount: integer("member_count").notNull().default(1),
  notes: text("notes"),
  expiresAt: timestamp("expires_at").default(sql`NOW() + INTERVAL '1 year'`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRenewalSchema = createInsertSchema(renewalsTable).omit({ id: true, createdAt: true, expiresAt: true });
export type InsertRenewal = z.infer<typeof insertRenewalSchema>;
export type Renewal = typeof renewalsTable.$inferSelect;
