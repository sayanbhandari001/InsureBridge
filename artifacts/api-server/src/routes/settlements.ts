import { Router } from "express";
import { db } from "@workspace/db";
import { reimbursementSettlementsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

function toNum(v: string | null | undefined) { return v ? parseFloat(v) : null; }
function toStr(v: unknown) { return v !== undefined && v !== null ? String(v) : null; }

router.get("/reimbursement-settlements", async (req, res) => {
  try {
    const { claimId, status } = req.query as { claimId?: string; status?: string };
    const conditions = [];
    if (claimId) conditions.push(eq(reimbursementSettlementsTable.claimId, parseInt(claimId)));
    if (status) conditions.push(eq(reimbursementSettlementsTable.status, status as any));

    const items = conditions.length > 0
      ? await db.select().from(reimbursementSettlementsTable).where(and(...conditions)).orderBy(reimbursementSettlementsTable.createdAt)
      : await db.select().from(reimbursementSettlementsTable).orderBy(reimbursementSettlementsTable.createdAt);

    res.json(items.map(s => ({
      ...s,
      totalBillAmount: parseFloat(s.totalBillAmount),
      admissibleAmount: toNum(s.admissibleAmount),
      deductible: toNum(s.deductible),
      coPayAmount: toNum(s.coPayAmount),
      nonAdmissibleAmount: toNum(s.nonAdmissibleAmount),
      netPayableAmount: toNum(s.netPayableAmount),
      roomRentCharges: toNum(s.roomRentCharges),
      surgeryCharges: toNum(s.surgeryCharges),
      medicineCharges: toNum(s.medicineCharges),
      diagnosticCharges: toNum(s.diagnosticCharges),
      otherCharges: toNum(s.otherCharges),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list settlements");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reimbursement-settlements", async (req, res) => {
  try {
    const { claimId, claimNumber, patientName, policyNumber, hospitalName, admissionDate, dischargeDate, totalBillAmount, roomRentCharges, surgeryCharges, medicineCharges, diagnosticCharges, otherCharges, remarks } = req.body;
    if (!patientName || !policyNumber || !hospitalName || !totalBillAmount) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [s] = await db.insert(reimbursementSettlementsTable).values({
      claimId: claimId || null,
      claimNumber: claimNumber || null,
      patientName,
      policyNumber,
      hospitalName,
      admissionDate: admissionDate ? new Date(admissionDate) : null,
      dischargeDate: dischargeDate ? new Date(dischargeDate) : null,
      totalBillAmount: String(totalBillAmount),
      roomRentCharges: toStr(roomRentCharges),
      surgeryCharges: toStr(surgeryCharges),
      medicineCharges: toStr(medicineCharges),
      diagnosticCharges: toStr(diagnosticCharges),
      otherCharges: toStr(otherCharges),
      nonAdmissibleReasons: [],
      remarks: remarks || null,
    }).returning();
    res.status(201).json({ ...s, totalBillAmount: parseFloat(s.totalBillAmount) });
  } catch (err) {
    req.log.error({ err }, "Failed to create settlement");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/reimbursement-settlements/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Record<string, unknown> = {};
    const body = req.body;
    if (body.status) updates.status = body.status;
    if (body.admissibleAmount !== undefined) updates.admissibleAmount = toStr(body.admissibleAmount);
    if (body.deductible !== undefined) updates.deductible = toStr(body.deductible);
    if (body.coPayAmount !== undefined) updates.coPayAmount = toStr(body.coPayAmount);
    if (body.nonAdmissibleAmount !== undefined) updates.nonAdmissibleAmount = toStr(body.nonAdmissibleAmount);
    if (body.netPayableAmount !== undefined) updates.netPayableAmount = toStr(body.netPayableAmount);
    if (body.nonAdmissibleReasons) updates.nonAdmissibleReasons = body.nonAdmissibleReasons;
    if (body.paymentMode !== undefined) updates.paymentMode = body.paymentMode;
    if (body.utrNumber !== undefined) updates.utrNumber = body.utrNumber;
    if (body.settlementDate !== undefined) updates.settlementDate = body.settlementDate ? new Date(body.settlementDate) : null;
    if (body.remarks !== undefined) updates.remarks = body.remarks;

    const [s] = await db.update(reimbursementSettlementsTable).set(updates).where(eq(reimbursementSettlementsTable.id, id)).returning();
    if (!s) { res.status(404).json({ error: "Settlement not found" }); return; }
    res.json({ ...s, totalBillAmount: parseFloat(s.totalBillAmount), admissibleAmount: toNum(s.admissibleAmount), deductible: toNum(s.deductible), coPayAmount: toNum(s.coPayAmount), nonAdmissibleAmount: toNum(s.nonAdmissibleAmount), netPayableAmount: toNum(s.netPayableAmount) });
  } catch (err) {
    req.log.error({ err }, "Failed to update settlement");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
