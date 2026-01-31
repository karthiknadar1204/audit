import { Context, Next } from "hono";
import { eq, and } from "drizzle-orm";
import type { AuthEnv } from "./auth.middleware";
import { db } from "../models/db";
import { apiKeysTable } from "../models/schema";

const API_KEY_HEADER = "kitkat-audit-api-key";

export const apiKeyMiddleware = async (c: Context<AuthEnv>, next: Next) => {
  const apiKey = c.req.header(API_KEY_HEADER);
  if (!apiKey?.trim()) {
    return c.json({ error: "Unauthorized: API key required (kitkat-audit-api-key header)" }, 401);
  }
  const userId = c.get("userId");
  const [row] = await db
    .select()
    .from(apiKeysTable)
    .where(and(eq(apiKeysTable.key, apiKey.trim()), eq(apiKeysTable.userId, userId)));
  if (!row) {
    return c.json({ error: "Unauthorized: invalid or forbidden API key" }, 401);
  }
  await next();
};
