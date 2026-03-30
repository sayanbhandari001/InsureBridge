import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

const RETENTION_TABLES = [
  { name: "claims", label: "Claims" },
  { name: "call_logs", label: "Call Logs" },
  { name: "messages", label: "Messages" },
  { name: "threads", label: "Message Threads" },
  { name: "documents", label: "Documents" },
  { name: "bills", label: "Bills" },
  { name: "feedback", label: "Feedback" },
  { name: "ecards", label: "E-Cards" },
  { name: "portability_requests", label: "Portability Requests" },
  { name: "renewals", label: "Renewals" },
  { name: "scrutiny_cases", label: "Scrutiny Cases" },
  { name: "reimbursement_settlements", label: "Settlements" },
  { name: "members", label: "Members" },
  { name: "notifications", label: "Notifications" },
  { name: "app_feedback", label: "App Feedback" },
];

// GET /api/retention — summary stats for all tables
router.get("/retention", async (req, res) => {
  try {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const tableStats = await Promise.all(
      RETENTION_TABLES.map(async (t) => {
        const result = await db.execute(sql.raw(`
          SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE expires_at < NOW()) AS expired,
            COUNT(*) FILTER (WHERE expires_at >= NOW() AND expires_at < '${in30Days.toISOString()}') AS expiring_30d,
            COUNT(*) FILTER (WHERE expires_at >= NOW() AND expires_at < '${in90Days.toISOString()}') AS expiring_90d,
            MIN(expires_at) AS soonest_expiry,
            MAX(expires_at) AS latest_expiry
          FROM ${t.name}
        `));
        const row = result.rows[0] as any;
        return {
          table: t.name,
          label: t.label,
          total: parseInt(row.total),
          expired: parseInt(row.expired),
          expiring30d: parseInt(row.expiring_30d),
          expiring90d: parseInt(row.expiring_90d),
          soonestExpiry: row.soonest_expiry,
          latestExpiry: row.latest_expiry,
        };
      })
    );

    const totals = tableStats.reduce(
      (acc, t) => ({
        total: acc.total + t.total,
        expired: acc.expired + t.expired,
        expiring30d: acc.expiring30d + t.expiring30d,
        expiring90d: acc.expiring90d + t.expiring90d,
      }),
      { total: 0, expired: 0, expiring30d: 0, expiring90d: 0 }
    );

    res.json({ tables: tableStats, totals, retentionPeriodDays: 365 });
  } catch (err) {
    req.log.error({ err }, "Failed to get retention stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/retention/purge — delete all expired records (admin only)
router.delete("/retention/purge", async (req, res) => {
  try {
    const purgeResults: Record<string, number> = {};

    for (const t of RETENTION_TABLES) {
      const result = await db.execute(
        sql.raw(`DELETE FROM ${t.name} WHERE expires_at < NOW() RETURNING id`)
      );
      purgeResults[t.label] = result.rows.length;
    }

    const totalPurged = Object.values(purgeResults).reduce((a, b) => a + b, 0);
    res.json({ success: true, totalPurged, details: purgeResults, purgedAt: new Date().toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to purge expired records");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
