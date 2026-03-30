import { Router } from "express";
import { db } from "@workspace/db";
import { billsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/bills", async (req, res) => {
  try {
    const { claimId, status } = req.query as { claimId?: string; status?: string };
    const conditions = [];
    if (claimId) conditions.push(eq(billsTable.claimId, parseInt(claimId)));
    if (status) conditions.push(eq(billsTable.status, status as any));
    
    const bills = conditions.length > 0
      ? await db.select().from(billsTable).where(and(...conditions)).orderBy(billsTable.createdAt)
      : await db.select().from(billsTable).orderBy(billsTable.createdAt);
    
    res.json(bills.map(b => ({
      ...b,
      totalAmount: parseFloat(b.totalAmount),
      approvedAmount: b.approvedAmount ? parseFloat(b.approvedAmount) : null,
      deductible: b.deductible ? parseFloat(b.deductible) : null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list bills");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bills", async (req, res) => {
  try {
    const { claimId, billNumber, hospitalName, patientName, totalAmount, items, notes } = req.body;
    if (!billNumber || !hospitalName || !patientName || !totalAmount || !items) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [bill] = await db.insert(billsTable).values({
      claimId: claimId || null,
      billNumber,
      hospitalName,
      patientName,
      totalAmount: String(totalAmount),
      items,
      notes: notes || null,
      submittedAt: new Date(),
    }).returning();
    res.status(201).json({
      ...bill,
      totalAmount: parseFloat(bill.totalAmount),
      approvedAmount: bill.approvedAmount ? parseFloat(bill.approvedAmount) : null,
      deductible: bill.deductible ? parseFloat(bill.deductible) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create bill");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bills/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Record<string, unknown> = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.approvedAmount !== undefined) updates.approvedAmount = req.body.approvedAmount !== null ? String(req.body.approvedAmount) : null;
    if (req.body.deductible !== undefined) updates.deductible = req.body.deductible !== null ? String(req.body.deductible) : null;
    if (req.body.notes !== undefined) updates.notes = req.body.notes;
    if (req.body.processedAt !== undefined) updates.processedAt = req.body.processedAt ? new Date(req.body.processedAt) : null;
    
    const [bill] = await db.update(billsTable).set(updates).where(eq(billsTable.id, id)).returning();
    if (!bill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }
    res.json({
      ...bill,
      totalAmount: parseFloat(bill.totalAmount),
      approvedAmount: bill.approvedAmount ? parseFloat(bill.approvedAmount) : null,
      deductible: bill.deductible ? parseFloat(bill.deductible) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update bill");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
