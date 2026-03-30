import { pgTable, serial, text, timestamp, integer, boolean, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const providerTypeEnum = pgEnum("provider_type", ["hospital", "clinic", "diagnostic", "pharmacy", "specialist"]);
export const providerStatusEnum = pgEnum("provider_status", ["active", "inactive", "suspended"]);

export const networkProvidersTable = pgTable("network_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: providerTypeEnum("type").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email"),
  specialities: json("specialities").$type<string[]>().notNull().default([]),
  insurerIds: json("insurer_ids").$type<number[]>().notNull().default([]),
  bedCount: integer("bed_count"),
  cashlessEnabled: boolean("cashless_enabled").notNull().default(true),
  status: providerStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNetworkProviderSchema = createInsertSchema(networkProvidersTable).omit({ id: true, createdAt: true });
export type InsertNetworkProvider = z.infer<typeof insertNetworkProviderSchema>;
export type NetworkProvider = typeof networkProvidersTable.$inferSelect;
