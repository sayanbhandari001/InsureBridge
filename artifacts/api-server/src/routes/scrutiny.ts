import { Router } from "express";
import { db } from "@workspace/db";
import { scrutinyCasesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

function numOrNull(v: unknown) { return v !== undefined && v !== null ? String(v) : null; }

router.get("/scrutiny", async (req, res) => {
  try {
    const { status, claimId } = req.query as { status?: string; claimId?: string };
    const conditions = [];
    if (status) conditions.push(eq(scrutinyCasesTable.status, status as any));
    if (claimId) conditions.push(eq(scrutinyCasesTable.claimId, parseInt(claimId)));

    const cases = conditions.length > 0
      ? await db.select().from(scrutinyCasesTable).where(and(...conditions)).orderBy(scrutinyCasesTable.createdAt)
      : await db.select().from(scrutinyCasesTable).orderBy(scrutinyCasesTable.createdAt);

    res.json(cases.map(c => ({
      ...c,
      billAmount: parseFloat(c.billAmount),
      scrutinizedAmount: c.scrutinizedAmount ? parseFloat(c.scrutinizedAmount) : null,
      deductions: c.deductions ? parseFloat(c.deductions) : null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list scrutiny cases");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/scrutiny", async (req, res) => {
  try {
    const { claimId, claimNumber, patientName, billAmount, assignedTo, remarks } = req.body;
    if (!patientName || !billAmount) {
      res.status(400).json({ error: "patientName and billAmount are required" });
      return;
    }
    const [sc] = await db.insert(scrutinyCasesTable).values({
      claimId: claimId || null,
      claimNumber: claimNumber || null,
      patientName,
      billAmount: String(billAmount),
      deductionReasons: [],
      assignedTo: assignedTo || null,
      remarks: remarks || null,
    }).returning();
    res.status(201).json({ ...sc, billAmount: parseFloat(sc.billAmount), scrutinizedAmount: null, deductions: null });
  } catch (err) {
    req.log.error({ err }, "Failed to create scrutiny case");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/scrutiny/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Record<string, unknown> = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.scrutinizedAmount !== undefined) updates.scrutinizedAmount = numOrNull(req.body.scrutinizedAmount);
    if (req.body.deductions !== undefined) updates.deductions = numOrNull(req.body.deductions);
    if (req.body.deductionReasons) updates.deductionReasons = req.body.deductionReasons;
    if (req.body.remarks !== undefined) updates.remarks = req.body.remarks;
    if (req.body.completedAt !== undefined) updates.completedAt = req.body.completedAt ? new Date(req.body.completedAt) : null;

    const [sc] = await db.update(scrutinyCasesTable).set(updates).where(eq(scrutinyCasesTable.id, id)).returning();
    if (!sc) {
      res.status(404).json({ error: "Scrutiny case not found" });
      return;
    }
    res.json({
      ...sc,
      billAmount: parseFloat(sc.billAmount),
      scrutinizedAmount: sc.scrutinizedAmount ? parseFloat(sc.scrutinizedAmount) : null,
      deductions: sc.deductions ? parseFloat(sc.deductions) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update scrutiny case");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
