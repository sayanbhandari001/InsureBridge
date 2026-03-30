import { pgTable, serial, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notificationTypeEnum = pgEnum("notification_type", [
  "message", "claim_update", "document", "bill", "settlement", "system"
]);

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull(),
  relatedId: integer("related_id"),
  relatedType: text("related_type"),
  isRead: boolean("is_read").notNull().default(false),
  expiresAt: timestamp("expires_at").default(sql`NOW() + INTERVAL '1 year'`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({ id: true, createdAt: true, expiresAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;
