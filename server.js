// server.js
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'

const app = express()

// Middleware - set up before routes
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

// Custom morgan for POST data
morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
  skip: (req) => req.method !== 'POST'
}))

// MongoDB connection
const password = process.argv[2]

if (!password) {
  console.log('Please provide the password as an argument: node server.js <password>')
  process.exit(1)
}

const url = `mongodb+srv://vicowolabi22:${password}@fullstack.mnah0zl.mongodb.net/phonebook?retryWrites=true&w=majority&appName=fullstack`

mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
    // Test the connection by counting documents
    Person.countDocuments({})
      .then(count => {
        console.log(`Found ${count} persons in MongoDB`)
      })
      .catch(err => {
        console.log('Error counting documents:', err.message)
      })
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
  })

// Person schema and model
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  number: {
    type: String,
    required: true
  }
})

// Transform the returned object
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)

// Routes
app.get('/', (req, res) => {
  res.send('<h1>Phonebook API is running 🚀</h1><p>Use <code>/api/persons</code> to get data</p>')
})

// Get all persons from MongoDB
app.get('/api/persons', (request, response, next) => {
  console.log('GET /api/persons called - fetching from MongoDB...')
  
  Person.find({})
    .then(persons => {
      console.log(`Found ${persons.length} persons in MongoDB:`)
      persons.forEach(person => {
        console.log(`- ${person.name}: ${person.number}`)
      })
      response.json(persons)
    })
    .catch(error => {
      console.log('Error fetching persons:', error.message)
      next(error)
    })
})

// Get single person from MongoDB
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})

// Add new person to MongoDB
app.post('/api/persons', (request, response, next) => {
  const body = request.body
  
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }
  
  const person = new Person({
    name: body.name,
    number: body.number
  })
  
  person.save()
    .then(savedPerson => {
      response.status(201).json(savedPerson)
    })
    .catch(error => next(error))
})

// Update person in MongoDB
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  
  const person = {
    name: body.name,
    number: body.number
  }
  
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})

// Delete person from MongoDB
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      if (result) {
        response.status(204).end()
      } else {
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})

// Info endpoint
app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    const info = `
      <p>Phonebook has info for ${count} people</p>
      <p>${new Date()}</p>
    `
    response.send(info)
  })
})

// Error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'name must be unique' })
  }
  
  next(error)
}

// Unknown endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

// Port configuration
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
