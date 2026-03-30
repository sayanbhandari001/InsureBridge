import { Router } from "express";
import { db } from "@workspace/db";
import { claimsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

function generateClaimNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `CLM-${timestamp}-${random}`;
}

function toNum(v: string | null | undefined) { return v ? parseFloat(v) : null; }
function toStr(v: unknown) { return v !== undefined && v !== null ? String(v) : null; }

function mapClaim(c: any) {
  return {
    ...c,
    claimedAmount: parseFloat(c.claimedAmount),
    approvedAmount: toNum(c.approvedAmount),
    deductible: toNum(c.deductible),
    coPayAmount: toNum(c.coPayAmount),
    netPayableAmount: toNum(c.netPayableAmount),
    roomRentCharges: toNum(c.roomRentCharges),
    surgeryCharges: toNum(c.surgeryCharges),
    medicineCharges: toNum(c.medicineCharges),
    diagnosticCharges: toNum(c.diagnosticCharges),
    otherCharges: toNum(c.otherCharges),
  };
}

router.get("/claims", async (req, res) => {
  try {
    const { status, customerId, hospitalId, tpaId, insurerId } = req.query as Record<string, string>;
    const conditions = [];
    if (status) conditions.push(eq(claimsTable.status, status as any));
    if (customerId) conditions.push(eq(claimsTable.customerId, parseInt(customerId)));
    if (hospitalId) conditions.push(eq(claimsTable.hospitalId, parseInt(hospitalId)));
    if (tpaId) conditions.push(eq(claimsTable.tpaId, parseInt(tpaId)));
    if (insurerId) conditions.push(eq(claimsTable.insurerId, parseInt(insurerId)));

    const claims = conditions.length > 0
      ? await db.select().from(claimsTable).where(and(...conditions)).orderBy(claimsTable.createdAt)
      : await db.select().from(claimsTable).orderBy(claimsTable.createdAt);

    res.json(claims.map(mapClaim));
  } catch (err) {
    req.log.error({ err }, "Failed to list claims");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/claims", async (req, res) => {
  try {
    const {
      customerId, patientName, hospitalId, hospitalName, insurerId, tpaId,
      claimType, diagnosis, admissionDate, dischargeDate,
      claimedAmount, roomRentCharges, surgeryCharges, medicineCharges, diagnosticCharges, otherCharges,
      policyNumber, icdCode, treatmentType, notes
    } = req.body;

    if (!customerId || !patientName || !claimType || !claimedAmount || !policyNumber) {
      res.status(400).json({ error: "customerId, patientName, claimType, claimedAmount, and policyNumber are required" });
      return;
    }

    const [claim] = await db.insert(claimsTable).values({
      claimNumber: generateClaimNumber(),
      customerId,
      patientName,
      hospitalId: hospitalId || null,
      hospitalName: hospitalName || null,
      insurerId: insurerId || null,
      tpaId: tpaId || null,
      claimType,
      diagnosis: diagnosis || null,
      admissionDate: admissionDate ? new Date(admissionDate) : null,
      dischargeDate: dischargeDate ? new Date(dischargeDate) : null,
      claimedAmount: String(claimedAmount),
      roomRentCharges: toStr(roomRentCharges),
      surgeryCharges: toStr(surgeryCharges),
      medicineCharges: toStr(medicineCharges),
      diagnosticCharges: toStr(diagnosticCharges),
      otherCharges: toStr(otherCharges),
      policyNumber,
      icdCode: icdCode || null,
      treatmentType: treatmentType || null,
      notes: notes || null,
      updatedAt: new Date(),
    }).returning();

    res.status(201).json(mapClaim(claim));
  } catch (err) {
    req.log.error({ err }, "Failed to create claim");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/claims/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [claim] = await db.select().from(claimsTable).where(eq(claimsTable.id, id));
    if (!claim) {
      res.status(404).json({ error: "Claim not found" });
      return;
    }
    res.json(mapClaim(claim));
  } catch (err) {
    req.log.error({ err }, "Failed to get claim");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/claims/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (req.body.status) updates.status = req.body.status;
    if (req.body.approvedAmount !== undefined) updates.approvedAmount = toStr(req.body.approvedAmount);
    if (req.body.deductible !== undefined) updates.deductible = toStr(req.body.deductible);
    if (req.body.coPayAmount !== undefined) updates.coPayAmount = toStr(req.body.coPayAmount);
    if (req.body.netPayableAmount !== undefined) updates.netPayableAmount = toStr(req.body.netPayableAmount);
    if (req.body.notes !== undefined) updates.notes = req.body.notes;
    if (req.body.diagnosis !== undefined) updates.diagnosis = req.body.diagnosis;
    if (req.body.admissionDate !== undefined) updates.admissionDate = req.body.admissionDate ? new Date(req.body.admissionDate) : null;
    if (req.body.dischargeDate !== undefined) updates.dischargeDate = req.body.dischargeDate ? new Date(req.body.dischargeDate) : null;

    const [claim] = await db.update(claimsTable).set(updates).where(eq(claimsTable.id, id)).returning();
    if (!claim) {
      res.status(404).json({ error: "Claim not found" });
      return;
    }
    res.json(mapClaim(claim));
  } catch (err) {
    req.log.error({ err }, "Failed to update claim");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
