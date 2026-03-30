import { Router } from "express";
import { db } from "@workspace/db";
import { callLogsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/calls", async (req, res) => {
  try {
    const { claimId } = req.query as { claimId?: string };
    const logs = claimId
      ? await db.select().from(callLogsTable).where(eq(callLogsTable.claimId, parseInt(claimId))).orderBy(callLogsTable.callDate)
      : await db.select().from(callLogsTable).orderBy(callLogsTable.callDate);
    res.json(logs);
  } catch (err) {
    req.log.error({ err }, "Failed to list call logs");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/calls", async (req, res) => {
  try {
    const { claimId, callerId, callerName, callerRole, receiverName, receiverRole, direction, duration, outcome, notes, callDate } = req.body;
    if (!callerId || !callerName || !callerRole || !receiverName || !receiverRole || !direction || !outcome || !callDate) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [log] = await db.insert(callLogsTable).values({
      claimId: claimId || null,
      callerId,
      callerName,
      callerRole,
      receiverName,
      receiverRole,
      direction,
      duration: duration || null,
      outcome,
      notes: notes || null,
      callDate: new Date(callDate),
    }).returning();
    res.status(201).json(log);
  } catch (err) {
    req.log.error({ err }, "Failed to create call log");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
