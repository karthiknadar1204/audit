import { Hono } from "hono";
import { getHistory, getStats } from "../controllers/history.controller";

const historyRouter = new Hono();

historyRouter.get("/history", getHistory);
historyRouter.get("/stats", getStats);

export default historyRouter;
