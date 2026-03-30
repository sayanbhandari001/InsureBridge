import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const documentTypeEnum = pgEnum("document_type", [
  "bill", "discharge_summary", "prescription", "lab_report", "tpa_form", "insurance_form", "id_proof", "other"
]);
export const documentStatusEnum = pgEnum("document_status", ["pending", "approved", "rejected"]);

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id"),
  uploadedById: integer("uploaded_by_id").notNull(),
  uploaderName: text("uploader_name").notNull(),
  uploaderRole: text("uploader_role").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  documentType: documentTypeEnum("document_type").notNull(),
  url: text("url").notNull(),
  status: documentStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;
