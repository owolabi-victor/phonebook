// utils/auth.js
import jwt from 'jsonwebtoken'
import User from '../models/user.js'

const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token, access denied' })
  }

  const token = authHeader.replace('Bearer ', '')
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // CRITICAL: Ensure id exists and is string
    if (!decoded.id || typeof decoded.id !== 'string') {
      return res.status(401).json({ error: 'Invalid token payload' })
    }

    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = { id: decoded.id }  // ← always string
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' })
  }
}

export default auth