import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verify as verifyJwt } from "hono/jwt";
import { eq } from "drizzle-orm";
import type { AuthEnv } from "./auth.middleware";
import { db } from "../models/db";
import { apiKeysTable } from "../models/schema";

const API_KEY_HEADERS = ["x-api-key", "kitkat-audit-api-key"] as const;

export const verifyAuthMiddleware = async (c: Context<AuthEnv>, next: Next) => {
  let apiKey: string | undefined;
  for (const name of API_KEY_HEADERS) {
    const value = c.req.header(name)?.trim();
    if (value) {
      apiKey = value;
      break;
    }
  }
  if (apiKey) {
    const [row] = await db
      .select({ userId: apiKeysTable.userId })
      .from(apiKeysTable)
      .where(eq(apiKeysTable.key, apiKey));
    if (row) {
      c.set("userId", row.userId);
      return next();
    }
  }

  const token = getCookie(c, "token");
  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = await verifyJwt(token, process.env.JWT_SECRET, "HS256") as { id?: number };
      if (decoded?.id != null) {
        c.set("userId", decoded.id);
        return next();
      }
    } catch {
      // fall through to 401
    }
  }

  return c.json(
    { error: "Unauthorized: provide x-api-key or kitkat-audit-api-key header or log in (session cookie)" },
    401
  );
};
