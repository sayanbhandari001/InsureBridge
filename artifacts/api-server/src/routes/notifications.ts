import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

router.get("/notifications", async (req, res) => {
  try {
    const { userId, unreadOnly } = req.query as { userId?: string; unreadOnly?: string };
    const conditions = [];
    if (userId) conditions.push(eq(notificationsTable.userId, parseInt(userId)));
    if (unreadOnly === "true") conditions.push(eq(notificationsTable.isRead, false));

    const items = conditions.length > 0
      ? await db.select().from(notificationsTable).where(and(...conditions)).orderBy(desc(notificationsTable.createdAt))
      : await db.select().from(notificationsTable).orderBy(desc(notificationsTable.createdAt));

    res.json(items);
  } catch (err) {
    req.log.error({ err }, "Failed to list notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/notifications", async (req, res) => {
  try {
    const { userId, title, message, type, relatedId, relatedType } = req.body;
    if (!userId || !title || !message || !type) {
      res.status(400).json({ error: "userId, title, message, and type are required" });
      return;
    }
    const [notif] = await db.insert(notificationsTable).values({
      userId,
      title,
      message,
      type,
      relatedId: relatedId || null,
      relatedType: relatedType || null,
    }).returning();
    res.status(201).json(notif);
  } catch (err) {
    req.log.error({ err }, "Failed to create notification");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [notif] = await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, id))
      .returning();
    if (!notif) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    res.json(notif);
  } catch (err) {
    req.log.error({ err }, "Failed to mark notification as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/read-all", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.userId, userId));
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    req.log.error({ err }, "Failed to mark all notifications as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
