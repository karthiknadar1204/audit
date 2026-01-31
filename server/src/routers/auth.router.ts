import { Hono } from "hono";
import { getUser, login, logout, register } from "../controllers/auth.controller";

const authRouter = new Hono();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/user', getUser);
export default authRouter;