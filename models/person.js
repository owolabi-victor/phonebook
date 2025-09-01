// models/person.js
import { set, connect, Schema, model } from 'mongoose'

// URL comes from environment variables
const url = process.env.MONGODB_URI

console.log('connecting to', url)

set('strictQuery', false)
connect(url)
  .then(() => {
    console.log('✅ connected to MongoDB')
  })
  .catch(error => {
    console.log('❌ error connecting to MongoDB:', error.message)
  })

// Define schema
const personSchema = new Schema({
  name: String,
  number: String,
})

// Transform JSON output
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// Export model
export default model('Person', personSchema)
