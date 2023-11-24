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
})
