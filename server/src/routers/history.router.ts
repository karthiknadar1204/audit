import { Hono } from "hono";
import { authMiddleware, type AuthEnv } from "../middlewares/auth.middleware";
import { getHistory, getStats } from "../controllers/history.controller";

const historyRouter = new Hono<AuthEnv>();

historyRouter.get("/history", authMiddleware, getHistory);
historyRouter.get("/stats", authMiddleware, getStats);

export default historyRouter;
