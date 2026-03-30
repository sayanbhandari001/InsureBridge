import { pgTable, serial, text, timestamp, integer, numeric, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const relationshipEnum = pgEnum("relationship_type", [
  "self", "spouse", "child", "parent", "parent_in_law", "sibling"
]);
export const genderEnum = pgEnum("gender_type", ["male", "female", "other"]);
export const memberStatusEnum = pgEnum("member_status", ["active", "inactive"]);

export const membersTable = pgTable("members", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  policyNumber: text("policy_number").notNull(),
  name: text("name").notNull(),
  relationship: relationshipEnum("relationship").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: genderEnum("gender").notNull(),
  preExistingConditions: json("pre_existing_conditions").$type<string[]>().notNull().default([]),
  sumInsured: numeric("sum_insured", { precision: 12, scale: 2 }).notNull(),
  status: memberStatusEnum("status").notNull().default("active"),
  addedAt: timestamp("added_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMemberSchema = createInsertSchema(membersTable).omit({ id: true, createdAt: true });
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof membersTable.$inferSelect;
