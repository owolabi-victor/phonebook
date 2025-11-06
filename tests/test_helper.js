// tests/test_helper.js
import Person from '../models/person.js'
import User from '../models/user.js'

// Initial persons for seeding the test DB
const initialPersons = [
  {
    name: 'Fiyai',
    number: '12345678', // ✅ valid number (>= 8 digits)
  },
  {
    name: 'Starboyvic',
    number: '87654321', // ✅ valid number
  },
]

// Create a valid but non-existing ID
const nonExistingId = async () => {
  const person = new Person({ name: 'Temp User', number: '11111111' })
  await person.save()
  await person.deleteOne()

  return person._id.toString()
}

// Return all persons currently in DB, formatted as JSON
const personsInDb = async () => {
  const persons = await Person.find({})
  return persons.map(p => p.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}


export default {
  initialPersons,
  nonExistingId,
  personsInDb,
  usersInDb,
}
