import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/health',(c)=>{
  return c.json({ status: 'ok', message: 'Server is running' })
})

export default { 
  port: 3004, 
  fetch: app.fetch, 
}
