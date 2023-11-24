import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { z } from 'zod'

export async function users(app: FastifyInstance) {
  app.post('/', async (req, reply) => {
    const createUserSchema = z.object({
      username: z.string(),
    })

    const userSchemaParse = createUserSchema.safeParse(req.body)
    if (!userSchemaParse.success) {
      return reply.code(400).send({
        error: 'Missing username field!',
      })
    }

    const { data } = userSchemaParse

    await knex('users').insert({
      id: randomUUID(),
      username: data.username,
    })

    return reply.code(201).send('User created with successful.')
  })
}
