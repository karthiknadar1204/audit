import "dotenv/config";
import { Hono } from 'hono'
import authRouter from './routers/auth.router'
import verifyRouter from './routers/verify.router'
import apiKeysRouter from './routers/api-keys.router'

const app = new Hono()

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

export default { 
  port: 3004, 
  fetch: app.fetch, 
}
