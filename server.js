import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
const app = express()

// Middleware
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

// Data storage
let persons = [
  { id: 1, name: "John Doe", number: "123-456-7890" },
  { id: 2, name: "Jane Smith", number: "987-654-3210" }
]

const generateId = () => {
  return Math.floor(Math.random() * 1000000) + 1
}

// Routes
app.get('/', (req, res) => {
  res.send('<h1>Phonebook API is running 🚀</h1><p>Use <code>/api/persons</code> to get data</p>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).json({ error: 'Person not found' })
  }
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }
  
  const existingPerson = persons.find(p => p.name === body.name)
  if (existingPerson) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }
  
  const person = {
    id: body.id || generateId(),
    name: body.name,
    number: body.number
  }
  
  persons = persons.concat(person)
  response.status(201).json(person)
})

app.put('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const body = request.body
  
  const personIndex = persons.findIndex(p => p.id === id)
  
  if (personIndex === -1) {
    return response.status(404).json({ error: 'Person not found' })
  }
  
  const updatedPerson = {
    id: id,
    name: body.name || persons[personIndex].name,
    number: body.number || persons[personIndex].number
  }
  
  persons[personIndex] = updatedPerson
  response.json(updatedPerson)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  
  const initialLength = persons.length
  persons = persons.filter(person => person.id !== id)
  
  if (persons.length < initialLength) {
    response.status(204).end()
  } else {
    response.status(404).json({ error: 'Person not found' })
  }
})

// Error handling
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// Port configuration for Render
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
