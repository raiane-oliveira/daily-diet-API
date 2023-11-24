import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../app'
import { execSync } from 'node:child_process'
import request from 'supertest'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  it('should be able to list all meals', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      username: 'johndoe',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'New meal',
      description: 'New meal description',
      is_in_diet: true,
      timestamp: new Date(),
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'New meal',
        description: 'New meal description',
        is_in_diet: true,
      }),
    ])
  })

  it('should be able to list a single meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      username: 'johndoe',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'New meal',
      description: 'New meal description',
      is_in_diet: true,
      timestamp: new Date(),
    })

    const { body } = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealResponse = await request(app.server)
      .get(`/meals/${body.meals[0].id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(mealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'New meal',
        description: 'New meal description',
        is_in_diet: true,
      }),
    )
  })

  it('should be able to create a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      username: 'johndoe',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'New meal',
        description: 'New meal description',
        is_in_diet: true,
        timestamp: new Date(),
      })
      .expect(201)
  })

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      username: 'johndoe',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'New meal',
      description: 'New meal description',
      is_in_diet: true,
      timestamp: new Date(),
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'New meal 2',
      description: 'New meal description 2',
      is_in_diet: false,
      timestamp: new Date(),
    })

    const { body } = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const id = body.meals[0].id

    await request(app.server)
      .delete(`/meals/${id}`)
      .set('Cookie', cookies)
      .expect(204)

    const listMealsAfterDeleteResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(listMealsAfterDeleteResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'New meal 2',
        description: 'New meal description 2',
        is_in_diet: false,
      }),
    ])
  })
})
