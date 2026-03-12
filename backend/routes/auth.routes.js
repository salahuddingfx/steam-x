import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  console.warn('JWT_SECRET is missing in .env file. Authentication tokens are disabled until it is set.')
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const requireJwtSecret = (res) => {
  if (!JWT_SECRET) {
    res.status(500).json({ error: 'Server auth configuration is incomplete.' })
    return false
  }
  return true
}

router.post('/register', async (req, res) => {
  try {
    if (!requireJwtSecret(res)) return

    const name = String(req.body?.name || '').trim()
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')

    if (name.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' })
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' })
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must include at least 1 uppercase letter and 1 number.' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'User already exists' })

    const user = new User({ name, email, password })
    await user.save()

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, favorites: user.favorites, watchlist: user.watchlist },
      token,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    if (!requireJwtSecret(res)) return

    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')

    if (!EMAIL_REGEX.test(email) || !password) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })

    const userObj = user.toObject()
    delete userObj.password

    res.json({ user: userObj, token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) return res.status(404).json({ error: 'User not found' })

    if (Array.isArray(req.body.favorites)) user.favorites = req.body.favorites
    if (Array.isArray(req.body.watchlist)) user.watchlist = req.body.watchlist
    if (typeof req.body.name === 'string' && req.body.name.trim().length >= 2) {
      user.name = req.body.name.trim()
    }

    await user.save()

    const updatedUser = user.toObject()
    delete updatedUser.password

    res.json(updatedUser)
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/change-password', protect, async (req, res) => {
  try {
    const currentPassword = String(req.body?.currentPassword || '')
    const newPassword = String(req.body?.newPassword || '')

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'New password must be 8+ chars and include uppercase + number.' })
    }

    const user = await User.findById(req.user.id).select('+password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/delete', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id)
    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
