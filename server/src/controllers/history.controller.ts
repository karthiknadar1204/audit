import { Context } from "hono";
import { eq, desc } from "drizzle-orm";
import type { AuthEnv } from "../middlewares/auth.middleware";
import { db } from "../models/db";
import { auditLogTable } from "../models/schema";

export const getHistory = async (c: Context<AuthEnv>) => {
  try {
    const userId = c.get("userId");

    const logs = await db
      .select({
        id: auditLogTable.id,
        timestamp: auditLogTable.timestamp,
        input_question: auditLogTable.input_question,
        result_action: auditLogTable.result_action,
        result_score: auditLogTable.result_score,
        durationMs: auditLogTable.durationMs,
      })
      .from(auditLogTable)
      .where(eq(auditLogTable.userId, userId))
      .orderBy(desc(auditLogTable.timestamp))
      .limit(50);

    return c.json({
      count: logs.length,
      logs: logs.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        question: log.input_question,
        action: log.result_action,
        trust_score: log.result_score,
        latency_ms: log.durationMs,
      })),
    });
  } catch (error) {
    console.error("History retrieval failed:", error);
    return c.json(
      { status: "error", message: "Internal server error retrieving history" },
      500
    );
  }
};

export const getStats = async (c: Context<AuthEnv>) => {
  try {
    const userId = c.get("userId");

    const logs = await db
      .select({
        result_action: auditLogTable.result_action,
        result_score: auditLogTable.result_score,
      })
      .from(auditLogTable)
      .where(eq(auditLogTable.userId, userId));

    const totalRequests = logs.length;
    const rejectedRequests = logs.filter(
      (l) => l.result_action === "REJECT" || l.result_action === "RETRY"
    ).length;
    const hallucinationRate =
      totalRequests > 0 ? (rejectedRequests / totalRequests) * 100 : 0;
    const totalScore = logs.reduce(
      (sum, log) => sum + (log.result_score ?? 0),
      0
    );
    const averageTrustScore =
      totalRequests > 0 ? totalScore / totalRequests : 0;

    return c.json({
      total_requests: totalRequests,
      average_trust_score: Number(averageTrustScore.toFixed(2)),
      hallucination_rate: Number(hallucinationRate.toFixed(2)) + "%",
    });
  } catch (error) {
    console.error("Stats retrieval failed:", error);
    return c.json(
      { status: "error", message: "Internal server error retrieving stats" },
      500
    );
  }
};
