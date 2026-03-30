import { Router } from "express";
import { db } from "@workspace/db";
import { networkProvidersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/network-providers", async (req, res) => {
  try {
    const { city, status } = req.query as { city?: string; status?: string };
    const conditions = [];
    if (city) conditions.push(eq(networkProvidersTable.city, city));
    if (status) conditions.push(eq(networkProvidersTable.status, status as any));

    const providers = conditions.length > 0
      ? await db.select().from(networkProvidersTable).where(and(...conditions)).orderBy(networkProvidersTable.name)
      : await db.select().from(networkProvidersTable).orderBy(networkProvidersTable.name);

    res.json(providers);
  } catch (err) {
    req.log.error({ err }, "Failed to list network providers");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/network-providers", async (req, res) => {
  try {
    const { name, type, city, state, address, phone, email, specialities, insurerIds, bedCount, cashlessEnabled } = req.body;
    if (!name || !type || !city || !state || !address) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [provider] = await db.insert(networkProvidersTable).values({
      name,
      type,
      city,
      state,
      address,
      phone: phone || null,
      email: email || null,
      specialities: specialities || [],
      insurerIds: insurerIds || [],
      bedCount: bedCount || null,
      cashlessEnabled: cashlessEnabled ?? true,
    }).returning();
    res.status(201).json(provider);
  } catch (err) {
    req.log.error({ err }, "Failed to create network provider");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
