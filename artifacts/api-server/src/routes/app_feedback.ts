import { Router } from "express";
import { db } from "@workspace/db";
import { appFeedbackTable } from "@workspace/db/schema";

const router = Router();

router.get("/app-feedback", async (req, res) => {
  try {
    const items = await db.select().from(appFeedbackTable).orderBy(appFeedbackTable.createdAt);
    res.json(items);
  } catch (err) {
    req.log.error({ err }, "Failed to list app feedback");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/app-feedback", async (req, res) => {
  try {
    const { userId, userName, userRole, rating, feature, comment } = req.body;
    if (!userId || !userName || !userRole || !rating || !feature) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be 1-5" });
      return;
    }
    const [item] = await db.insert(appFeedbackTable).values({
      userId,
      userName,
      userRole,
      rating,
      feature,
      comment: comment || null,
    }).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error({ err }, "Failed to submit app feedback");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
