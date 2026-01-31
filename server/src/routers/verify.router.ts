import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { type AuthEnv } from "../middlewares/auth.middleware";
import { verifyAuthMiddleware } from "../middlewares/verify-auth.middleware";
import { verifyContent } from "../controllers/verify.controller";

const verifySchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  context: z.array(z.string()).optional(),
});

const verifyRouter = new Hono<AuthEnv>();

verifyRouter.post("/verify", verifyAuthMiddleware, zValidator("json", verifySchema), verifyContent);

export default verifyRouter;
