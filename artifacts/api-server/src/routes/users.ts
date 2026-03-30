import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, insertUserSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    res.json(users);
  } catch (err) {
    req.log.error({ err }, "Failed to list users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error });
      return;
    }
    const [user] = await db.insert(usersTable).values(parsed.data).returning();
    res.status(201).json(user);
  } catch (err) {
    req.log.error({ err }, "Failed to create user");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
