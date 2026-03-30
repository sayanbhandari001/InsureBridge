import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const appFeedbackFeatureEnum = pgEnum("app_feedback_feature", [
  "claims", "chat", "billing", "documents", "overall", "tpa_tools", "reports"
]);

export const appFeedbackTable = pgTable("app_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userName: text("user_name").notNull(),
  userRole: text("user_role").notNull(),
  rating: integer("rating").notNull(),
  feature: appFeedbackFeatureEnum("feature").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAppFeedbackSchema = createInsertSchema(appFeedbackTable).omit({ id: true, createdAt: true });
export type InsertAppFeedback = z.infer<typeof insertAppFeedbackSchema>;
export type AppFeedback = typeof appFeedbackTable.$inferSelect;
