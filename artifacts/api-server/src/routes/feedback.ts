import { Router } from "express";
import { db } from "@workspace/db";
import { feedbackTable } from "@workspace/db/schema";

const router = Router();

router.get("/feedback", async (req, res) => {
  try {
    const items = await db.select().from(feedbackTable).orderBy(feedbackTable.createdAt);
    res.json(items);
  } catch (err) {
    req.log.error({ err }, "Failed to list feedback");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/feedback", async (req, res) => {
  try {
    const { customerId, customerName, claimId, rating, category, comment, targetEntity } = req.body;
    if (!customerId || !customerName || !rating || !category || !targetEntity) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }
    const [item] = await db.insert(feedbackTable).values({
      customerId,
      customerName,
      claimId: claimId || null,
      rating,
      category,
      comment: comment || null,
      targetEntity,
    }).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error({ err }, "Failed to submit feedback");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
