import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { z } from 'zod'

export async function usersRoutes(app: FastifyInstance) {
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

    const createdUser = await knex('users')
      .insert({
        id: randomUUID(),
        username: data.username,
      })
      .returning('id')

    reply.setCookie('session_id', createdUser[0].id, {
      path: '/',
      maxAge: 60 * 60 * 7, // days
    })

    return reply.code(201).send('User created with successful.')
  })
}
