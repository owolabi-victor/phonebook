// backend/controllers/users.js
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import auth from '../utils/auth.js'   // ✅ your correct path

const router = express.Router()

/**
 * SIGNUP
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { username, password, name } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()
    res.status(201).json({ message: 'User created', userId: savedUser._id })
  } catch (error) {
    // Handle duplicate username
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ error: '`username` must be unique' })
    }
    next(error)
  }
})

/**
 * LOGIN
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) return res.status(400).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({ token })
  } catch (error) {
    next(error)
  }
})

/**
 * CURRENT LOGGED-IN USER
 */
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-passwordHash')
      .populate('persons')

    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json(user)
  } catch (error) {
    next(error)
  }
})

export default router
