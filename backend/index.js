import dotenv from 'dotenv';
import express from 'express';
import { set, connect } from 'mongoose';
import Person from '../models/person.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables first
dotenv.config();

const app = express();
app.use(express.json());

// MongoDB connection
set('strictQuery', false);

// Add validation for MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not defined');
  process.exit(1);
}

console.log('connecting to MongoDB...');

connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ connected to MongoDB');
  })
  .catch(error => {
    console.log('❌ error connecting to MongoDB:', error.message);
    process.exit(1);
  });

// API routes
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons);
    })
    .catch(error => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' });
  }

  const person = new Person({
    name: body.name,
    number: body.number
  });

  person.save()
    .then(savedPerson => {
      response.status(201).json(savedPerson);
    })
    .catch(error => next(error));
});

// Serve frontend static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all handler for frontend routes (safer approach)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, request, response, next) => {
  console.error(error.message);
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  response.status(500).json({ error: 'something went wrong' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});