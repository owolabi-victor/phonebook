// tests/phone_api.test.js
import { test, before, beforeEach, after } from 'node:test'
import assert from 'node:assert'
import mongoose from 'mongoose'
import supertest from 'supertest'
import app from '../backend/app.js'  // our Express app
import Person from '../models/person.js'
import helper from './test_helper.js'

// const { nonExistingId, personsInDb } = helper

// Ensure we are in the test environment
assert.strictEqual(process.env.NODE_ENV, 'test', 'NODE_ENV is not set to test')

// Before running tests, ensure the database is connected
// before(async () => {
//   if (mongoose.connection.readyState === 0) {
//     await mongoose.connect(process.env.TEST_MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//   }
// })

// before(async () => {
//   // Clear test DB
//   await Person.deleteMany({})

//   // Insert predictable seed data
//   const persons = [
//     { name: 'Fiyai', number: '12345' },
//     { name: 'Starboyvic', number: '67890' },
//   ]
//   await Person.insertMany(persons)
// })



const api = supertest(app)

before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.TEST_MONGODB_URI)
  }
})

beforeEach(async () => {
  await Person.deleteMany({})
  console.log('cleared')
  await Person.insertMany(helper.initialPersons)
  console.log('saved initial persons')
})

test('all persons are returned', async () => {
  const personsAtStart = await helper.personsInDb()

  const response = await api.get('/api/persons')

  assert.strictEqual(response.body.length, personsAtStart.length)
})




















// const initialPersons = [
//   { name: 'Fiyai', number: '123456789' },
//   { name: 'Starboyvic', number: '6789023457' },
// ]

// before(async () => {
//   if (mongoose.connection.readyState === 0) {
//     await mongoose.connect(process.env.TEST_MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//   }
// })

// beforeEach(async () => {
//   await Person.deleteMany({})

//   let person = new Person(initialPersons[0])
//   await person.save()

//   person = new Person(initialPersons[1])
//   await person.save()
// })



// // Create a test client for our app
// const api = supertest(app)

// // Example test: adding a valid person
test('a valid person can be added', async () => {
  const newPerson = {
    name: 'Starboy Vic',
    number: '123-456-789',
  }

  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  // const response = await api.get('/api/persons')



  // The DB should now contain one more person
  const peopleAtEnd = await helper.personsInDb()
  assert.strictEqual(peopleAtEnd.length, helper.initialPersons.length + 1)

  // And the new person's name should be inside
  const names = peopleAtEnd.map(p => p.name)
  assert(names.includes('Starboy Vic'))
})

// // Example test: adding a person without a name or number fails
test('person without name is not added', async () => {
  const newPerson = {
    number: '123-456-789'
  }

  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(400)

  // const response = await api.get('/api/persons')

  const peopleAtEnd = await helper.personsInDb()
  assert.strictEqual(peopleAtEnd.length, helper.initialPersons.length)
})

test('person without number is not added', async () => {
  const newPerson = {
    name: 'NoNumber Guy'
  }

  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(400)

  // const response = await api.get('/api/persons')

  const peopleAtEnd = await helper.personsInDb()

  assert.strictEqual(peopleAtEnd.length, helper.initialPersons.length)
})

test('a specific person can be viewed', async () => {
  const personAtStart = await helper.personsInDb()
  const personToView = personAtStart[0]


  const resultPerson = await api
    .get(`/api/persons/${personToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)


  assert.deepStrictEqual(resultPerson.body, personToView)
})

test('a person can be deleted', async () => {
  const personsAtStart = await helper.personsInDb()
  const personToDelete = personsAtStart[0]

  await api
    .delete(`/api/persons/${personToDelete.id}`)
    .expect(204)

  const peopleAtEnd = await helper.personsInDb()

  const names = peopleAtEnd.map(p => p.name)
  assert(!names.includes(personToDelete.name))

  assert.strictEqual(peopleAtEnd.length, helper.initialPersons.length - 1)
})



// // Example test: check persons endpoint returns JSON
// test('persons are returned as json', async () => {
//   await api
//     .get('/api/persons')              // request our persons API
//     .expect(200)                      // expect HTTP 200 OK
//     .expect('Content-Type', /application\/json/)
// })

// test('all persons are returned', async () => {
//   const response = await api.get('/api/persons')

//   // adjust 2 to however many seed persons you expect in test DB
//   assert.strictEqual(response.body.length, 2)
// })

// test('a specific person is within the returned persons', async () => {
//   const response = await api.get('/api/persons')

//   const names = response.body.map(p => p.name)
//   assert.strictEqual(names.includes('Fiyai'), true) // adjust to match a test person
// })

// // Close the database connection after tests finish
after(async () => {
  await mongoose.connection.close()
})
