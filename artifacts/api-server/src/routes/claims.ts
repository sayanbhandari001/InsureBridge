import { Router } from "express";
import { db } from "@workspace/db";
import { claimsTable, insertClaimSchema } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

function generateClaimNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `CLM-${timestamp}-${random}`;
}

router.get("/claims", async (req, res) => {
  try {
    const { status, customerId } = req.query as { status?: string; customerId?: string };
    let query = db.select().from(claimsTable);
    
    const conditions = [];
    if (status) {
      conditions.push(eq(claimsTable.status, status as any));
    }
    if (customerId) {
      conditions.push(eq(claimsTable.customerId, parseInt(customerId)));
    }
    
    const claims = conditions.length > 0
      ? await db.select().from(claimsTable).where(and(...conditions)).orderBy(claimsTable.createdAt)
      : await db.select().from(claimsTable).orderBy(claimsTable.createdAt);
    
    res.json(claims.map(c => ({
      ...c,
      claimedAmount: parseFloat(c.claimedAmount),
      approvedAmount: c.approvedAmount ? parseFloat(c.approvedAmount) : null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list claims");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/claims", async (req, res) => {
  try {
    const body = insertClaimSchema.safeParse({
      ...req.body,
      claimedAmount: String(req.body.claimedAmount),
    });
    if (!body.success) {
      res.status(400).json({ error: "Invalid request", details: body.error });
      return;
    }
    const [claim] = await db.insert(claimsTable).values({
      ...body.data,
      claimNumber: generateClaimNumber(),
      updatedAt: new Date(),
    }).returning();
    res.status(201).json({
      ...claim,
      claimedAmount: parseFloat(claim.claimedAmount),
      approvedAmount: claim.approvedAmount ? parseFloat(claim.approvedAmount) : null,
    });
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
    res.json({
      ...claim,
      claimedAmount: parseFloat(claim.claimedAmount),
      approvedAmount: claim.approvedAmount ? parseFloat(claim.approvedAmount) : null,
    });
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
    if (req.body.approvedAmount !== undefined) updates.approvedAmount = String(req.body.approvedAmount);
    if (req.body.notes !== undefined) updates.notes = req.body.notes;
    if (req.body.diagnosis !== undefined) updates.diagnosis = req.body.diagnosis;
    if (req.body.admissionDate !== undefined) updates.admissionDate = req.body.admissionDate ? new Date(req.body.admissionDate) : null;
    if (req.body.dischargeDate !== undefined) updates.dischargeDate = req.body.dischargeDate ? new Date(req.body.dischargeDate) : null;
    
    const [claim] = await db.update(claimsTable).set(updates).where(eq(claimsTable.id, id)).returning();
    if (!claim) {
      res.status(404).json({ error: "Claim not found" });
      return;
    }
    res.json({
      ...claim,
      claimedAmount: parseFloat(claim.claimedAmount),
      approvedAmount: claim.approvedAmount ? parseFloat(claim.approvedAmount) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update claim");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
