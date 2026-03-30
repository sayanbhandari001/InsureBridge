import { Router } from "express";
import { db } from "@workspace/db";
import { ecardsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

function generateCardNumber() {
  return `IB-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

router.get("/ecards", async (req, res) => {
  try {
    const { memberId, status } = req.query as { memberId?: string; status?: string };
    const conditions = [];
    if (memberId) conditions.push(eq(ecardsTable.memberId, parseInt(memberId)));
    if (status) conditions.push(eq(ecardsTable.status, status as any));

    const cards = conditions.length > 0
      ? await db.select().from(ecardsTable).where(and(...conditions)).orderBy(ecardsTable.createdAt)
      : await db.select().from(ecardsTable).orderBy(ecardsTable.createdAt);

    res.json(cards.map(c => ({ ...c, sumInsured: parseFloat(c.sumInsured) })));
  } catch (err) {
    req.log.error({ err }, "Failed to list e-cards");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/ecards", async (req, res) => {
  try {
    const { memberId, memberName, policyNumber, insurerName, tpaName, sumInsured, validFrom, validTo, dependents } = req.body;
    if (!memberId || !memberName || !policyNumber || !insurerName || !tpaName || !sumInsured || !validFrom || !validTo) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [card] = await db.insert(ecardsTable).values({
      memberId,
      memberName,
      policyNumber,
      insurerName,
      tpaName,
      cardNumber: generateCardNumber(),
      sumInsured: String(sumInsured),
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      dependents: dependents || [],
    }).returning();
    res.status(201).json({ ...card, sumInsured: parseFloat(card.sumInsured) });
  } catch (err) {
    req.log.error({ err }, "Failed to create e-card");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/ecards/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Record<string, unknown> = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.sumInsured !== undefined) updates.sumInsured = String(req.body.sumInsured);
    if (req.body.validTo !== undefined) updates.validTo = req.body.validTo ? new Date(req.body.validTo) : null;

    const [card] = await db.update(ecardsTable).set(updates).where(eq(ecardsTable.id, id)).returning();
    if (!card) {
      res.status(404).json({ error: "E-card not found" });
      return;
    }
    res.json({ ...card, sumInsured: parseFloat(card.sumInsured) });
  } catch (err) {
    req.log.error({ err }, "Failed to update e-card");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
