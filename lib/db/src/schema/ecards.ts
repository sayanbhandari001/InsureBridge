import { pgTable, serial, text, timestamp, integer, numeric, json, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ecardStatusEnum = pgEnum("ecard_status", ["active", "expired", "suspended", "cancelled"]);

export const ecardsTable = pgTable("ecards", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  memberName: text("member_name").notNull(),
  policyNumber: text("policy_number").notNull(),
  insurerName: text("insurer_name").notNull(),
  tpaName: text("tpa_name").notNull(),
  cardNumber: text("card_number").notNull().unique(),
  sumInsured: numeric("sum_insured", { precision: 12, scale: 2 }).notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  status: ecardStatusEnum("status").notNull().default("active"),
  dependents: json("dependents").$type<string[]>().notNull().default([]),
  expiresAt: timestamp("expires_at").default(sql`NOW() + INTERVAL '1 year'`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEcardSchema = createInsertSchema(ecardsTable).omit({ id: true, createdAt: true, cardNumber: true, expiresAt: true });
export type InsertEcard = z.infer<typeof insertEcardSchema>;
export type Ecard = typeof ecardsTable.$inferSelect;
