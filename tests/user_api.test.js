// tests/user_api.test.js
import { strict as assert } from 'assert'
import bcrypt from 'bcrypt'
import supertest from 'supertest'
import app from '../backend/app.js'
import User from '../models/user.js'
import helper from './test_helper.js'
import { test, describe, beforeEach, after } from 'node:test'
import mongoose from 'mongoose'


const { usersInDb } = helper


const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    // Clear all users before each test
    await User.deleteMany({})

    // Add one default "root" user
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'starboyvic',
      name: 'Owolabi Victor',
      password: 'salainen', // this gets hashed by our router
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })
  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert(result.body.error.includes('`username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

})

after(async () => {
  await mongoose.connection.close()
})
