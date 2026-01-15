// Auth Middleware to protect routes
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET missing')
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      req.user = await User.findById(decoded.id).select('-password')
      if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' })
      }
      next()
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}

// Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    })
}
