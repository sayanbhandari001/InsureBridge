import { Router } from "express";
import { db } from "@workspace/db";
import { portabilityRequestsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/portability", async (req, res) => {
  try {
    const requests = await db.select().from(portabilityRequestsTable).orderBy(portabilityRequestsTable.createdAt);
    res.json(requests.map(r => ({
      ...r,
      sumInsured: parseFloat(r.sumInsured),
      newSumInsured: r.newSumInsured ? parseFloat(r.newSumInsured) : null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list portability requests");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/portability", async (req, res) => {
  try {
    const { customerId, customerName, fromInsurerName, toInsurerName, policyNumber, sumInsured, newSumInsured, portabilityReason, previousClaimHistory, requestedAt } = req.body;
    if (!customerId || !customerName || !fromInsurerName || !toInsurerName || !policyNumber || !sumInsured || !requestedAt) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [request] = await db.insert(portabilityRequestsTable).values({
      customerId,
      customerName,
      fromInsurerName,
      toInsurerName,
      policyNumber,
      sumInsured: String(sumInsured),
      newSumInsured: newSumInsured ? String(newSumInsured) : null,
      portabilityReason: portabilityReason || null,
      previousClaimHistory: previousClaimHistory || null,
      requestedAt: new Date(requestedAt),
    }).returning();
    res.status(201).json({ ...request, sumInsured: parseFloat(request.sumInsured), newSumInsured: request.newSumInsured ? parseFloat(request.newSumInsured) : null });
  } catch (err) {
    req.log.error({ err }, "Failed to create portability request");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/portability/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Record<string, unknown> = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.effectiveDate !== undefined) updates.effectiveDate = req.body.effectiveDate ? new Date(req.body.effectiveDate) : null;
    if (req.body.notes !== undefined) updates.notes = req.body.notes;

    const [request] = await db.update(portabilityRequestsTable).set(updates).where(eq(portabilityRequestsTable.id, id)).returning();
    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    res.json({ ...request, sumInsured: parseFloat(request.sumInsured), newSumInsured: request.newSumInsured ? parseFloat(request.newSumInsured) : null });
  } catch (err) {
    req.log.error({ err }, "Failed to update portability request");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
