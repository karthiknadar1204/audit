import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, type AuthEnv } from "../middlewares/auth.middleware";
import { verifyContent } from "../controllers/verify.controller";

const verifySchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  context: z.array(z.string()).optional(),
});

const verifyRouter = new Hono<AuthEnv>();

verifyRouter.post("/verify", authMiddleware, zValidator("json", verifySchema), verifyContent);

export default verifyRouter;
