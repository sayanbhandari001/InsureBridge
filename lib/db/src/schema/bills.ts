import { pgTable, serial, text, timestamp, integer, pgEnum, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const billStatusEnum = pgEnum("bill_status", [
  "pending", "under_review", "approved", "partially_approved", "rejected"
]);

export interface BillItem {
  description: string;
  amount: number;
  quantity: number;
  category?: string;
}

export const billsTable = pgTable("bills", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id"),
  billNumber: text("bill_number").notNull().unique(),
  hospitalName: text("hospital_name").notNull(),
  patientName: text("patient_name").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  approvedAmount: numeric("approved_amount", { precision: 12, scale: 2 }),
  deductible: numeric("deductible", { precision: 12, scale: 2 }),
  items: json("items").$type<BillItem[]>().notNull().default([]),
  status: billStatusEnum("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at"),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBillSchema = createInsertSchema(billsTable).omit({ id: true, createdAt: true });
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof billsTable.$inferSelect;
