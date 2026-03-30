import { Router } from "express";
import { db } from "@workspace/db";
import { threadsTable, messagesTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/threads", async (req, res) => {
  try {
    const threads = await db.select().from(threadsTable).orderBy(threadsTable.createdAt);
    res.json(threads);
  } catch (err) {
    req.log.error({ err }, "Failed to list threads");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/threads", async (req, res) => {
  try {
    const { subject, claimId, participants } = req.body;
    if (!subject || !participants) {
      res.status(400).json({ error: "subject and participants are required" });
      return;
    }
    const [thread] = await db.insert(threadsTable).values({
      subject,
      claimId: claimId || null,
      participants: participants || [],
    }).returning();
    res.status(201).json(thread);
  } catch (err) {
    req.log.error({ err }, "Failed to create thread");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/messages", async (req, res) => {
  try {
    const { claimId, threadId } = req.query as { claimId?: string; threadId?: string };
    
    if (threadId) {
      const msgs = await db.select().from(messagesTable)
        .where(eq(messagesTable.threadId, parseInt(threadId)))
        .orderBy(messagesTable.createdAt);
      res.json(msgs);
      return;
    }
    
    if (claimId) {
      const msgs = await db.select().from(messagesTable)
        .where(eq(messagesTable.claimId, parseInt(claimId)))
        .orderBy(messagesTable.createdAt);
      res.json(msgs);
      return;
    }
    
    const msgs = await db.select().from(messagesTable).orderBy(messagesTable.createdAt);
    res.json(msgs);
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const { threadId, claimId, senderId, senderName, senderRole, content, attachments } = req.body;
    if (!threadId || !senderId || !senderName || !senderRole || !content) {
      res.status(400).json({ error: "threadId, senderId, senderName, senderRole, content are required" });
      return;
    }
    const [message] = await db.insert(messagesTable).values({
      threadId,
      claimId: claimId || null,
      senderId,
      senderName,
      senderRole,
      content,
      attachments: attachments || [],
    }).returning();
    
    await db.update(threadsTable)
      .set({ 
        lastMessageAt: new Date(), 
        messageCount: sql`${threadsTable.messageCount} + 1`
      })
      .where(eq(threadsTable.id, threadId));
    
    res.status(201).json(message);
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
