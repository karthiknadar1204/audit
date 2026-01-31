import { Context } from "hono";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import type { AuthEnv } from "../middlewares/auth.middleware";
import { db } from "../models/db";
import { apiKeysTable } from "../models/schema";

type CreateKeyBody = { key?: string; name?: string };
type CreateKeyInput = { out: { json: CreateKeyBody } };

function generateApiKey(): string {
  return `ak_${randomBytes(24).toString("hex")}`;
}

export const listApiKeys = async (c: Context<AuthEnv>) => {
  try {
    const userId = c.get("userId");
    const keys = await db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.userId, userId));
    return c.json(keys, 200);
  } catch (error) {
    console.error("List API keys failed:", error);
    return c.json({ error: "Failed to list API keys" }, 500);
  }
};

export const createApiKey = async (
  c: Context<AuthEnv, "/", CreateKeyInput>
) => {
  try {
    const userId = c.get("userId");
    const { key: providedKey, name } = c.req.valid("json");
    const key = providedKey?.trim() ? providedKey.trim() : generateApiKey();

    const [created] = await db
      .insert(apiKeysTable)
      .values({
        userId,
        key,
        name: name?.trim() || null,
      })
      .returning({
        id: apiKeysTable.id,
        user_id: apiKeysTable.userId,
        key: apiKeysTable.key,
        name: apiKeysTable.name,
        created_at: apiKeysTable.created_at,
      });

    return c.json(created, 201);
  } catch (error: unknown) {
    const msg = (error as { message?: string })?.message ?? "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return c.json({ error: "API key already exists" }, 409);
    }
    if (msg.includes("foreign key") || msg.includes("violates foreign key")) {
      return c.json({ error: "User not found" }, 404);
    }
    console.error("Create API key failed:", error);
    return c.json({ error: "Failed to create API key" }, 500);
  }
};
