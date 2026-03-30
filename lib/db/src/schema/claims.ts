import { pgTable, serial, text, timestamp, pgEnum, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const claimStatusEnum = pgEnum("claim_status", [
  "submitted", "under_review", "approved", "rejected", "settled", "pending_documents"
]);

export const claimTypeEnum = pgEnum("claim_type", ["cashless", "reimbursement"]);

export const claimsTable = pgTable("claims", {
  id: serial("id").primaryKey(),
  claimNumber: text("claim_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  patientName: text("patient_name").notNull(),
  hospitalId: integer("hospital_id"),
  hospitalName: text("hospital_name"),
  insurerId: integer("insurer_id"),
  tpaId: integer("tpa_id"),
  status: claimStatusEnum("status").notNull().default("submitted"),
  claimType: claimTypeEnum("claim_type").notNull(),
  diagnosis: text("diagnosis"),
  admissionDate: timestamp("admission_date"),
  dischargeDate: timestamp("discharge_date"),
  claimedAmount: numeric("claimed_amount", { precision: 12, scale: 2 }).notNull(),
  approvedAmount: numeric("approved_amount", { precision: 12, scale: 2 }),
  policyNumber: text("policy_number").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertClaimSchema = createInsertSchema(claimsTable).omit({ id: true, createdAt: true, updatedAt: true, claimNumber: true });
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claimsTable.$inferSelect;
