import request from 'supertest'
import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest'
import { app } from '../app'
import { execSync } from 'node:child_process'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  it('should be able to create a new user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        username: 'johndoe',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    expect(cookies).toBeDefined()
  })
})
