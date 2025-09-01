// backend/index.js
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import express from 'express'
import { set, connect, Schema, model } from 'mongoose';
const Person = require('./models/person') // import model

const app = express()


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

set('strictQuery', false);

const url = process.env.MONGODB_URI;
console.log("MONGODB_URI from env:", process.env.MONGODB_URI);
console.log('connecting to', url);

connect(url)
  .then(() => {
    console.log('✅ connected to MongoDB');
  })
  .catch(error => {
    console.log('❌ error connecting to MongoDB:', error.message);
  });

const personSchema = new Schema({
  name: String,
  number: String,
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

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

export default model('Person', personSchema);
