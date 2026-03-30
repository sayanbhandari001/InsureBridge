import { Router } from "express";
import { db } from "@workspace/db";
import { renewalsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

function toNum(v: string | null | undefined) { return v ? parseFloat(v) : null; }

router.get("/renewals", async (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    const items = status
      ? await db.select().from(renewalsTable).where(eq(renewalsTable.status, status as any)).orderBy(renewalsTable.expiryDate)
      : await db.select().from(renewalsTable).orderBy(renewalsTable.expiryDate);

    res.json(items.map(r => ({
      ...r,
      currentSumInsured: parseFloat(r.currentSumInsured),
      newSumInsured: toNum(r.newSumInsured),
      currentPremium: parseFloat(r.currentPremium),
      newPremium: toNum(r.newPremium),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list renewals");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/renewals", async (req, res) => {
  try {
    const { customerId, customerName, policyNumber, insurerName, expiryDate, currentSumInsured, newSumInsured, currentPremium, newPremium, memberCount, notes } = req.body;
    if (!customerId || !customerName || !policyNumber || !insurerName || !expiryDate || !currentSumInsured || !currentPremium) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [renewal] = await db.insert(renewalsTable).values({
      customerId,
      customerName,
      policyNumber,
      insurerName,
      expiryDate: new Date(expiryDate),
      currentSumInsured: String(currentSumInsured),
      newSumInsured: newSumInsured ? String(newSumInsured) : null,
      currentPremium: String(currentPremium),
      newPremium: newPremium ? String(newPremium) : null,
      memberCount: memberCount || 1,
      notes: notes || null,
    }).returning();
    res.status(201).json({ ...renewal, currentSumInsured: parseFloat(renewal.currentSumInsured), newSumInsured: toNum(renewal.newSumInsured), currentPremium: parseFloat(renewal.currentPremium), newPremium: toNum(renewal.newPremium) });
  } catch (err) {
    req.log.error({ err }, "Failed to create renewal");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/renewals/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Record<string, unknown> = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.renewalDate !== undefined) updates.renewalDate = req.body.renewalDate ? new Date(req.body.renewalDate) : null;
    if (req.body.newSumInsured !== undefined) updates.newSumInsured = req.body.newSumInsured ? String(req.body.newSumInsured) : null;
    if (req.body.newPremium !== undefined) updates.newPremium = req.body.newPremium ? String(req.body.newPremium) : null;
    if (req.body.notes !== undefined) updates.notes = req.body.notes;

    const [renewal] = await db.update(renewalsTable).set(updates).where(eq(renewalsTable.id, id)).returning();
    if (!renewal) { res.status(404).json({ error: "Renewal not found" }); return; }
    res.json({ ...renewal, currentSumInsured: parseFloat(renewal.currentSumInsured), newSumInsured: toNum(renewal.newSumInsured), currentPremium: parseFloat(renewal.currentPremium), newPremium: toNum(renewal.newPremium) });
  } catch (err) {
    req.log.error({ err }, "Failed to update renewal");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
