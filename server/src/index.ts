import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import authRouter from "./routers/auth.router";
import verifyRouter from "./routers/verify.router";
import apiKeysRouter from "./routers/api-keys.router";
import historyRouter from "./routers/history.router";

const app = new Hono();

const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";
app.use(
  "*",
  cors({
    origin: clientOrigin,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "x-api-key", "kitkat-audit-api-key"],
  })
);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/health',(c)=>{
  return c.json({ status: 'ok', message: 'Server is running' })
})

// group ordering in hono->https://hono.dev/docs/api/routing#grouping-ordering
app.route('/auth', authRouter);
app.route('/', verifyRouter);
app.route('/api-keys', apiKeysRouter);
app.route('/audit', historyRouter);

export default { 
  port: 3004, 
  fetch: app.fetch, 
}
