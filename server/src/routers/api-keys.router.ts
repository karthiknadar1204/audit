import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createApiKey } from "../controllers/api-keys.controller";

const createKeySchema = z.object({
  user_id: z.number().int().positive("user_id must be a valid user id"),
  key: z.string().min(1, "key is required"),
  name: z.string().optional(),
});

const apiKeysRouter = new Hono();

apiKeysRouter.post("/", zValidator("json", createKeySchema), createApiKey);

export default apiKeysRouter;
