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

  app.get('/summary', async (req, reply) => {
    const sessionId = req.cookies.session_id

    const totalMealsData = await knex('meals')
      .select()
      .where('user_id', sessionId)

    const totalMeals = totalMealsData.length

    const bestStreakOfMealsInDiet = totalMealsData.reduce((acc, meal) => {
      if (meal.is_in_diet) {
        acc += 1
      } else {
        acc = 0
      }

      return acc
    }, 0)

    const totalMealsInDiet = await knex('meals')
      .select()
      .count('name', {
        as: 'total_meals_in_diet',
      })
      .where({
        is_in_diet: true,
        user_id: sessionId,
      })
      .first()

    const totalMealsOutDiet = await knex('meals')
      .select()
      .count('name', {
        as: 'total_meals_out_diet',
      })
      .where({
        is_in_diet: false,
        user_id: sessionId,
      })
      .first()

    return reply.send({
      summary: {
        total_meals: totalMeals,
        ...totalMealsInDiet,
        ...totalMealsOutDiet,
        best_streak_meals_in_diet: bestStreakOfMealsInDiet,
      },
    })
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

  app.put('/:id', async (req, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMealParamsSchema.parse(req.params)
    const sessionId = req.cookies.session_id

    const getMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      timestamp: z.coerce.date().optional(),
      is_in_diet: z.boolean().optional(),
    })

    const {
      description,
      is_in_diet: isInDiet,
      name,
      timestamp,
    } = getMealBodySchema.parse(req.body)

    await knex('meals')
      .update({
        description,
        is_in_diet: isInDiet,
        name,
        timestamp,
      })
      .where({
        id,
        user_id: sessionId,
      })

    return reply.status(204).send('Meal updated with successful.')
  })
}
