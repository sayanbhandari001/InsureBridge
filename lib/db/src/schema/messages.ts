import { pgTable, serial, text, timestamp, integer, json } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const threadsTable = pgTable("threads", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  claimId: integer("claim_id"),
  participants: json("participants").$type<string[]>().notNull().default([]),
  lastMessageAt: timestamp("last_message_at"),
  messageCount: integer("message_count").notNull().default(0),
  expiresAt: timestamp("expires_at").default(sql`NOW() + INTERVAL '1 year'`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull(),
  claimId: integer("claim_id"),
  senderId: integer("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull(),
  content: text("content").notNull(),
  attachments: json("attachments").$type<string[]>().notNull().default([]),
  expiresAt: timestamp("expires_at").default(sql`NOW() + INTERVAL '1 year'`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertThreadSchema = createInsertSchema(threadsTable).omit({ id: true, createdAt: true, messageCount: true, expiresAt: true });
export type InsertThread = z.infer<typeof insertThreadSchema>;
export type Thread = typeof threadsTable.$inferSelect;

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
