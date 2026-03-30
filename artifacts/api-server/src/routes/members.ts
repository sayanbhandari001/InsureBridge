import { Router } from "express";
import { db } from "@workspace/db";
import { membersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/members", async (req, res) => {
  try {
    const { policyNumber, customerId } = req.query as { policyNumber?: string; customerId?: string };
    const conditions = [];
    if (policyNumber) conditions.push(eq(membersTable.policyNumber, policyNumber));
    if (customerId) conditions.push(eq(membersTable.customerId, parseInt(customerId)));

    const items = conditions.length > 0
      ? await db.select().from(membersTable).where(and(...conditions)).orderBy(membersTable.createdAt)
      : await db.select().from(membersTable).orderBy(membersTable.createdAt);

    res.json(items.map(m => ({ ...m, sumInsured: parseFloat(m.sumInsured) })));
  } catch (err) {
    req.log.error({ err }, "Failed to list members");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/members", async (req, res) => {
  try {
    const { customerId, policyNumber, name, relationship, dateOfBirth, gender, preExistingConditions, sumInsured, addedAt } = req.body;
    if (!customerId || !policyNumber || !name || !relationship || !dateOfBirth || !gender || !sumInsured || !addedAt) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [member] = await db.insert(membersTable).values({
      customerId,
      policyNumber,
      name,
      relationship,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      preExistingConditions: preExistingConditions || [],
      sumInsured: String(sumInsured),
      addedAt: new Date(addedAt),
    }).returning();
    res.status(201).json({ ...member, sumInsured: parseFloat(member.sumInsured) });
  } catch (err) {
    req.log.error({ err }, "Failed to add member");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
