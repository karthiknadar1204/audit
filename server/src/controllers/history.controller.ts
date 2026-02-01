import { Context } from "hono";
import { eq, desc } from "drizzle-orm";
import { db } from "../models/db";
import { auditLogTable, apiKeysTable } from "../models/schema";

const API_KEY_HEADERS = ["x-api-key", "kitkat-audit-api-key"] as const;

function getApiKey(c: Context): string | null {
  for (const name of API_KEY_HEADERS) {
    const value = c.req.header(name);
    if (value?.trim()) return value.trim();
  }
  const query = c.req.query("api_key");
  if (query?.trim()) return query.trim();
  return null;
}

async function getUserIdFromApiKey(apiKey: string): Promise<number | null> {
  const [row] = await db
    .select({ userId: apiKeysTable.userId })
    .from(apiKeysTable)
    .where(eq(apiKeysTable.key, apiKey));
  return row?.userId ?? null;
}

export const getHistory = async (c: Context) => {
  try {
    const apiKey = getApiKey(c);
    if (!apiKey) {
      return c.json(
        { status: "error", message: "API key required (x-api-key or kitkat-audit-api-key header, or api_key query)" },
        401
      );
    }
    const userId = await getUserIdFromApiKey(apiKey);
    if (userId == null) {
      return c.json({ status: "error", message: "Invalid API key" }, 401);
    }

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

export const getStats = async (c: Context) => {
  try {
    const apiKey = getApiKey(c);
    if (!apiKey) {
      return c.json(
        { status: "error", message: "API key required (x-api-key or kitkat-audit-api-key header, or api_key query)" },
        401
      );
    }
    const userId = await getUserIdFromApiKey(apiKey);
    if (userId == null) {
      return c.json({ status: "error", message: "Invalid API key" }, 401);
    }

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
