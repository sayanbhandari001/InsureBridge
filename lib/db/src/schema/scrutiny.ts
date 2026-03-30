import { pgTable, serial, text, timestamp, integer, numeric, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scrutinyStatusEnum = pgEnum("scrutiny_status", ["pending", "in_review", "completed", "escalated"]);

export const scrutinyCasesTable = pgTable("scrutiny_cases", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id"),
  claimNumber: text("claim_number"),
  patientName: text("patient_name").notNull(),
  billAmount: numeric("bill_amount", { precision: 12, scale: 2 }).notNull(),
  scrutinizedAmount: numeric("scrutinized_amount", { precision: 12, scale: 2 }),
  deductions: numeric("deductions", { precision: 12, scale: 2 }),
  deductionReasons: json("deduction_reasons").$type<string[]>().notNull().default([]),
  status: scrutinyStatusEnum("status").notNull().default("pending"),
  assignedTo: text("assigned_to"),
  remarks: text("remarks"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertScrutinySchema = createInsertSchema(scrutinyCasesTable).omit({ id: true, createdAt: true });
export type InsertScrutiny = z.infer<typeof insertScrutinySchema>;
export type ScrutinyCase = typeof scrutinyCasesTable.$inferSelect;
