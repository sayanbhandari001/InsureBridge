import { integer, json, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const threadsTable = pgTable("threads", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  participants: json("participants").$type<string[]>().notNull().default([]),
  claimId: integer("claim_id"),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
  messageCount: integer("message_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messagesTable = pgTable("thread_messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull().references(() => threadsTable.id, { onDelete: "cascade" }),
  claimId: integer("claim_id"),
  senderId: integer("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull(),
  content: text("content").notNull(),
  attachments: json("attachments").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertThreadSchema = createInsertSchema(threadsTable).omit({
  id: true,
  lastMessageAt: true,
  messageCount: true,
  createdAt: true,
});

export const insertThreadMessageSchema = createInsertSchema(messagesTable).omit({
  id: true,
  createdAt: true,
});

export type Thread = typeof threadsTable.$inferSelect;
export type InsertThread = z.infer<typeof insertThreadSchema>;
export type ThreadMessage = typeof messagesTable.$inferSelect;
export type InsertThreadMessage = z.infer<typeof insertThreadMessageSchema>;
