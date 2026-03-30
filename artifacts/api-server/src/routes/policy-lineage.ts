import { Router } from "express";
import { db } from "@workspace/db";
import { portabilityRequestsTable, renewalsTable } from "@workspace/db/schema";
import { eq, or } from "drizzle-orm";

const router = Router();

router.get("/policy-lineage/:policyNumber", async (req, res) => {
  try {
    const { policyNumber } = req.params;

    const portabilities = await db
      .select()
      .from(portabilityRequestsTable)
      .where(
        or(
          eq(portabilityRequestsTable.policyNumber, policyNumber),
          eq(portabilityRequestsTable.newPolicyNumber, policyNumber)
        )
      );

    const renewals = await db
      .select()
      .from(renewalsTable)
      .where(
        or(
          eq(renewalsTable.policyNumber, policyNumber),
          eq(renewalsTable.newPolicyNumber, policyNumber)
        )
      );

    const events: Array<Record<string, unknown>> = [
      ...portabilities.map(p => ({
        type: "portability",
        id: p.id,
        policyNumber: p.policyNumber,
        newPolicyNumber: p.newPolicyNumber,
        fromInsurerName: p.fromInsurerName,
        toInsurerName: p.toInsurerName,
        customerName: p.customerName,
        status: p.status,
        sumInsured: parseFloat(p.sumInsured),
        newSumInsured: p.newSumInsured ? parseFloat(p.newSumInsured) : null,
        effectiveDate: p.effectiveDate,
        requestedAt: p.requestedAt,
        portabilityReason: p.portabilityReason,
      })),
      ...renewals.map(r => ({
        type: "renewal",
        id: r.id,
        policyNumber: r.policyNumber,
        newPolicyNumber: r.newPolicyNumber,
        insurerName: r.insurerName,
        customerName: r.customerName,
        status: r.status,
        currentSumInsured: parseFloat(r.currentSumInsured),
        newSumInsured: r.newSumInsured ? parseFloat(r.newSumInsured) : null,
        currentPremium: parseFloat(r.currentPremium),
        newPremium: r.newPremium ? parseFloat(r.newPremium) : null,
        expiryDate: r.expiryDate,
        renewalDate: r.renewalDate,
        memberCount: r.memberCount,
        notes: r.notes,
      })),
    ];

    events.sort((a, b) => {
      const aDate = new Date((a.requestedAt ?? a.expiryDate ?? 0) as string).getTime();
      const bDate = new Date((b.requestedAt ?? b.expiryDate ?? 0) as string).getTime();
      return aDate - bDate;
    });

    res.json({ policyNumber, events });
  } catch (err) {
    req.log.error({ err }, "Failed to get policy lineage");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
