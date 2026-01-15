import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.warn("⚠️ JWT_SECRET is missing in .env file! Authentication is insecure.");
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'User exists' })
    
    const user = new User({ name, email, password })
    await user.save()
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ user: { id: user._id, name, email }, token })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Find user including password field (select false by default)
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
         return res.status(400).json({ error: 'Invalid credentials' })
    }

    // Check credentials (BCRYPT or PLAIN TEXT FALLBACK)
    // Legacy support: Check if password matches plain text directly first (prototype safe)
    let isMatch = false
    
    if (user.password === password) {
        isMatch = true 
        // Optional: Upgrade to hash here if we wanted
    } else {
        // Try bcrypt
        isMatch = await bcrypt.compare(password, user.password)
    }

    if (!isMatch) {
         return res.status(400).json({ error: 'Invalid credentials' })
    }
    
    // Update user stats (mock)
    user.lastLogin = new Date()
    await user.save()

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    
    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ 
        user: userObj, 
        token 
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get Current User (Protected)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update Profile (Sync Favorites & History)
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    
    if (req.body.favorites) {
      user.favorites = req.body.favorites
    }
    
    if (req.body.watchlist) {
        // Renaming/Mapping depending on what frontend sends
        // The User model has 'watchlist' which serves as history/continue watching
        user.watchlist = req.body.watchlist
    }
    
    // Allow updating other fields if needed
    if (req.body.name) user.name = req.body.name

    await user.save()
    res.json(user)
  } catch (error) {
     console.error('Profile update error:', error)
     res.status(500).json({ error: error.message })
  }
})

export default router
