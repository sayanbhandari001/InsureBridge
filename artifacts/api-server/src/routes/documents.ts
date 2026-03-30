import { Router } from "express";
import { db } from "@workspace/db";
import { documentsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/documents", async (req, res) => {
  try {
    const { claimId } = req.query as { claimId?: string };
    const docs = claimId
      ? await db.select().from(documentsTable).where(eq(documentsTable.claimId, parseInt(claimId))).orderBy(documentsTable.createdAt)
      : await db.select().from(documentsTable).orderBy(documentsTable.createdAt);
    res.json(docs);
  } catch (err) {
    req.log.error({ err }, "Failed to list documents");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/documents", async (req, res) => {
  try {
    const { claimId, uploadedById, uploaderName, uploaderRole, fileName, fileType, fileSize, documentType, url, notes } = req.body;
    if (!uploadedById || !uploaderName || !uploaderRole || !fileName || !fileType || !fileSize || !documentType || !url) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [doc] = await db.insert(documentsTable).values({
      claimId: claimId || null,
      uploadedById,
      uploaderName,
      uploaderRole,
      fileName,
      fileType,
      fileSize,
      documentType,
      url,
      notes: notes || null,
    }).returning();
    res.status(201).json(doc);
  } catch (err) {
    req.log.error({ err }, "Failed to upload document");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
