import { Router } from "express";
import { db } from "@workspace/db";
import {
  claimsTable, billsTable, threadsTable, feedbackTable,
  notificationsTable, reimbursementSettlementsTable, membersTable
} from "@workspace/db/schema";
import { count, eq, avg, sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const [claimStats] = await db.select({
      total: count(),
      pending: count(sql`CASE WHEN ${claimsTable.status} = 'submitted' OR ${claimsTable.status} = 'under_review' OR ${claimsTable.status} = 'pending_documents' THEN 1 END`),
      approved: count(sql`CASE WHEN ${claimsTable.status} = 'approved' OR ${claimsTable.status} = 'settled' THEN 1 END`),
      rejected: count(sql`CASE WHEN ${claimsTable.status} = 'rejected' THEN 1 END`),
    }).from(claimsTable);

    const [billStats] = await db.select({
      totalBillAmount: sql<number>`COALESCE(SUM(${billsTable.totalAmount}), 0)`,
      approvedBillAmount: sql<number>`COALESCE(SUM(${billsTable.approvedAmount}), 0)`,
    }).from(billsTable);

    const [threadStats] = await db.select({
      openThreads: count(),
    }).from(threadsTable);

    const [feedbackStats] = await db.select({
      totalFeedback: count(),
      averageRating: avg(feedbackTable.rating),
    }).from(feedbackTable);

    const [notifStats] = await db.select({
      unread: count(sql`CASE WHEN ${notificationsTable.isRead} = false THEN 1 END`),
    }).from(notificationsTable);

    const [settlementStats] = await db.select({
      pending: count(sql`CASE WHEN ${reimbursementSettlementsTable.status} = 'pending' OR ${reimbursementSettlementsTable.status} = 'processing' THEN 1 END`),
    }).from(reimbursementSettlementsTable);

    const [memberStats] = await db.select({
      active: count(sql`CASE WHEN ${membersTable.status} = 'active' THEN 1 END`),
    }).from(membersTable);

    res.json({
      totalClaims: Number(claimStats.total),
      pendingClaims: Number(claimStats.pending),
      approvedClaims: Number(claimStats.approved),
      rejectedClaims: Number(claimStats.rejected),
      totalBillAmount: parseFloat(String(billStats.totalBillAmount)) || 0,
      approvedBillAmount: parseFloat(String(billStats.approvedBillAmount)) || 0,
      openThreads: Number(threadStats.openThreads),
      totalFeedback: Number(feedbackStats.totalFeedback),
      averageRating: parseFloat(String(feedbackStats.averageRating)) || 0,
      unreadNotifications: Number(notifStats.unread),
      pendingSettlements: Number(settlementStats.pending),
      activeMembers: Number(memberStats.active),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
