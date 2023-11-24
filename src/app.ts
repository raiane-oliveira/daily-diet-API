import fastify from 'fastify'
import { users } from './routes/users'

export const app = fastify()

app.register(users, {
  prefix: 'users',
})
