import { pgTable, serial, text, timestamp, integer, numeric, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settlementStatusEnum = pgEnum("settlement_status", ["pending", "processing", "approved", "paid", "rejected"]);
export const paymentModeEnum = pgEnum("payment_mode", ["neft", "cheque", "upi", "pending"]);

export const reimbursementSettlementsTable = pgTable("reimbursement_settlements", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id"),
  claimNumber: text("claim_number"),
  patientName: text("patient_name").notNull(),
  policyNumber: text("policy_number").notNull(),
  hospitalName: text("hospital_name").notNull(),
  admissionDate: timestamp("admission_date"),
  dischargeDate: timestamp("discharge_date"),
  totalBillAmount: numeric("total_bill_amount", { precision: 12, scale: 2 }).notNull(),
  admissibleAmount: numeric("admissible_amount", { precision: 12, scale: 2 }),
  deductible: numeric("deductible", { precision: 12, scale: 2 }),
  coPayAmount: numeric("co_pay_amount", { precision: 12, scale: 2 }),
  nonAdmissibleAmount: numeric("non_admissible_amount", { precision: 12, scale: 2 }),
  netPayableAmount: numeric("net_payable_amount", { precision: 12, scale: 2 }),
  roomRentCharges: numeric("room_rent_charges", { precision: 12, scale: 2 }),
  surgeryCharges: numeric("surgery_charges", { precision: 12, scale: 2 }),
  medicineCharges: numeric("medicine_charges", { precision: 12, scale: 2 }),
  diagnosticCharges: numeric("diagnostic_charges", { precision: 12, scale: 2 }),
  otherCharges: numeric("other_charges", { precision: 12, scale: 2 }),
  nonAdmissibleReasons: json("non_admissible_reasons").$type<string[]>().notNull().default([]),
  paymentMode: paymentModeEnum("payment_mode"),
  utrNumber: text("utr_number"),
  settlementDate: timestamp("settlement_date"),
  status: settlementStatusEnum("status").notNull().default("pending"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSettlementSchema = createInsertSchema(reimbursementSettlementsTable).omit({ id: true, createdAt: true });
export type InsertSettlement = z.infer<typeof insertSettlementSchema>;
export type ReimbursementSettlement = typeof reimbursementSettlementsTable.$inferSelect;
