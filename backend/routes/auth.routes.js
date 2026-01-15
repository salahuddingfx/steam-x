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

// ----------------------
// 1. PUBLIC ROUTES
// ----------------------

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    
    // Check if user exists
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'User already exists' })
    
    // Create new user
    // Note: Password will be hashed automatically by User.js pre-save hook
    const user = new User({ name, email, password })
    await user.save()
    
    // Generate Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    
    res.status(201).json({ 
        user: { id: user._id, name: user.name, email: user.email }, 
        token 
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Find user and explicitly select password (since select: false in model)
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
         return res.status(400).json({ error: 'Invalid credentials' })
    }

    // ✅ Secure Check: Only use bcrypt to compare
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
         return res.status(400).json({ error: 'Invalid credentials' })
    }
    
    // Update last login (optional)
    // user.lastLogin = new Date()
    // await user.save({ validateBeforeSave: false }) 

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    
    // Remove password from response
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

// ----------------------
// 2. PROTECTED ROUTES
// ----------------------

// Get Current User
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update Profile (Sync Favorites & Watchlist)
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    
    if (!user) return res.status(404).json({ error: "User not found" })

    if (req.body.favorites) user.favorites = req.body.favorites
    if (req.body.watchlist) user.watchlist = req.body.watchlist
    if (req.body.name) user.name = req.body.name

    await user.save()
    
    // Return updated user without password
    const updatedUser = user.toObject()
    delete updatedUser.password
    
    res.json(updatedUser)
  } catch (error) {
     console.error('Profile update error:', error)
     res.status(500).json({ error: error.message })
  }
})

// ✅ NEW: Change Password
router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Find user with password
        const user = await User.findById(req.user.id).select('+password');
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        // Set new password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ NEW: Delete Account
router.delete('/delete', protect, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router