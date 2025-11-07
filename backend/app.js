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

const { MONGODB_URI, PORT: ENV_PORT } = config
const { info, error: _error } = logger
const { requestLogger, unknownEndpoint, errorHandler } = middleware

const app = express()

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Connect to MongoDB
info('Connecting to MongoDB...')
connect(MONGODB_URI)
  .then(() => info('Connected to MongoDB'))
  .catch((err) => _error('MongoDB connection error:', err.message))

// Middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}))

app.use(express.json())
app.use(requestLogger)

// Serve static assets (Vite build)
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))

// API Routes — MUST come BEFORE catch-all
app.use('/api/persons', personsRouter)
app.use('/api/users', usersRouter)

// SPA: Serve index.html for all non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Error handling
app.use(unknownEndpoint)
app.use(errorHandler)

// Start server
const PORT = ENV_PORT || 3001
app.listen(PORT, () => {
  info(`Server running on http://localhost:${PORT}`)
  info(`API: http://localhost:${PORT}/api/persons`)
  info(`Frontend: http://localhost:${PORT}`)
})

export default app