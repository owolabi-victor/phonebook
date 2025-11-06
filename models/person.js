// models/person.js
import { Schema, model } from 'mongoose'

// Define schema with validations
const personSchema = new Schema({
  name: {
    type: String,
    minLength: [3, 'Name must be at least 3 characters long'],
    required: [true, 'Name is required']
  },
  number: {
    type: String,
    minLength: [8, 'Phone number must be at least 8 characters long'],
    validate: {
      validator: function(v) {
        // Custom validator: must have at least 8 digits
        return /^\d{8,}$/.test(v.replace(/\D/g, ''))
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'Phone number is required']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true  // This adds createdAt and updatedAt automatically
})

personSchema.index({ name: 1, user: 1 }, { unique: true })


personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

export default model('Person', personSchema)


// Define schema
// const personSchema = new Schema({
//   name: String,
//   number: String,
// })

// // Transform JSON output
// personSchema.set('toJSON', {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString()
//     delete returnedObject._id
//     delete returnedObject.__v
//   }
// })

// // Export model
// export default model('Person', personSchema)

// import mongoose from 'mongoose';