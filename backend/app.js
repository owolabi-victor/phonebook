// backend/app.js
import express from 'express'
import { connect } from 'mongoose'
import config from '../utils/config.js'
import logger from '../utils/logger.js'
import middleware from '../utils/middleware.js'
import personsRouter from '../controllers/persons.js'
import usersRouter from '../controllers/users.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fileUpload from 'express-fileupload'




const { MONGODB_URI } = config
const { info, error: _error } = logger
const { requestLogger, unknownEndpoint, errorHandler } = middleware

const app = express()

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Connect to MongoDB
info('testing microphone 102 connecting to', MONGODB_URI)

connect(MONGODB_URI)
  .then(() => {
    info('connected to MongoDB')
  })
  .catch((error) => {
    _error('error connection to MongoDB:', error.message)
  })

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}))

// app.use(express.static('dist'))
app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.json())
app.use(requestLogger)

app.use('/api/persons', personsRouter)
app.use('/api/users', usersRouter)

// Serve frontend for non-API routes
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})


app.use(unknownEndpoint)
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  info(`Server running on port ${PORT}`)
})

export default app