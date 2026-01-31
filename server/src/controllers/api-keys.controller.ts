import { Context } from "hono";
import { db } from "../models/db";
import { apiKeysTable } from "../models/schema";

type CreateKeyBody = { user_id: number; key: string; name?: string };
type CreateKeyInput = { out: { json: CreateKeyBody } };

export const createApiKey = async (
  c: Context<object, "/", CreateKeyInput>
) => {
  try {
    const { user_id, key, name } = c.req.valid("json");

    const [created] = await db
      .insert(apiKeysTable)
      .values({
        userId: user_id,
        key: key.trim(),
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
