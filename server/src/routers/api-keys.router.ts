import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, type AuthEnv } from "../middlewares/auth.middleware";
import { createApiKey, listApiKeys } from "../controllers/api-keys.controller";

const createKeySchema = z.object({
  key: z.string().min(1).optional(),
  name: z.string().optional(),
});

const apiKeysRouter = new Hono<AuthEnv>();

apiKeysRouter.get("/", authMiddleware, listApiKeys);
apiKeysRouter.post("/", authMiddleware, zValidator("json", createKeySchema), createApiKey);

export default apiKeysRouter;
