import { Schema, model } from 'mongoose'

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