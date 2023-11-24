import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.get('/', async (req, reply) => {
    const sessionId = String(req.cookies.session_id)
    const _meals = await knex('meals').select('*').where({ user_id: sessionId })
    const meals = _meals.map((meal) => ({
      ...meal,
      is_in_diet: Boolean(meal.is_in_diet),
    }))

    return reply.status(200).send({
      meals,
    })
  })

  app.get('/:id', async (req, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMealParamsSchema.parse(req.params)
    const sessionId = req.cookies.session_id

    const _meal = await knex('meals')
      .select()
      .where({
        id,
        user_id: sessionId,
      })
      .first()

    const meal = { ..._meal, is_in_diet: Boolean(_meal?.is_in_diet) }

    return reply.send({ meal })
  })

  app.post('/', async (req, reply) => {
    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      timestamp: z.coerce.date(),
      is_in_diet: z.boolean(),
    })

    const meal = createMealSchema.parse(req.body)
    const sessionId = req.cookies.session_id

    await knex('meals').insert({
      id: randomUUID(),
      description: meal.description,
      name: meal.name,
      is_in_diet: meal.is_in_diet,
      timestamp: meal.timestamp,
      user_id: sessionId,
    })

    return reply.status(201).send('Meal created with successful.')
  })

  app.delete('/:id', async (req, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(req.params)
    const sessionId = req.cookies.session_id

    await knex('meals').delete().where({
      id,
      user_id: sessionId,
    })

    return reply.status(204).send('Meal deleted with successful.')
  })
}
