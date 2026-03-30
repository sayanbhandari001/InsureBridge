import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const feedbackCategoryEnum = pgEnum("feedback_category", [
  "claim_process", "communication", "hospital_service", "tpa_service", "insurer_service", "overall"
]);
export const feedbackTargetEnum = pgEnum("feedback_target", ["hospital", "tpa", "insurer", "overall"]);

export const feedbackTable = pgTable("feedback", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  claimId: integer("claim_id"),
  rating: integer("rating").notNull(),
  category: feedbackCategoryEnum("category").notNull(),
  comment: text("comment"),
  targetEntity: feedbackTargetEnum("target_entity").notNull(),
  expiresAt: timestamp("expires_at").default(sql`NOW() + INTERVAL '1 year'`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedbackTable).omit({ id: true, createdAt: true, expiresAt: true });
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbackTable.$inferSelect;
