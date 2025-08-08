const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Session = require('../models/Session')
const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, mobile, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ mobile }, { username }]
    })

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this mobile number or username already exists'
      })
    }

    // Create new user
    const user = new User({
      username,
      mobile,
      password
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: user.toPublicJSON()
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      error: 'Error creating user'
    })
  }
})

// Login route
router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body

    if (!mobile || !password) {
      return res.status(400).json({
        error: 'Mobile and password are required'
      })
    }

    // Find user by mobile
    const user = await User.findOne({ mobile })
    if (!user) {
      return res.status(401).json({
        error: 'Invalid mobile or password'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid mobile or password'
      })
    }

    // Update user's online status
    user.isOnline = true
    user.lastSeen = new Date()
    await user.save()

    // Create session
    const sessionId = Session.generateSessionId()
    const session = new Session({
      sessionId,
      userId: user._id,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    })
    await session.save()

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        sessionId: sessionId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      sessionId,
      user: user.toPublicJSON()
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error: 'Error during login'
    })
  }
})

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        error: 'No token provided'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    res.json({
      user: user.toPublicJSON()
    })
  } catch (error) {
    console.error('Auth error:', error)
    res.status(401).json({
      error: 'Invalid token'
    })
  }
})

// Logout route
router.post('/logout', async (req, res) => {
  try {
    // Get session ID from token
    const token = req.headers.authorization?.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const sessionId = decoded.sessionId

    // Deactivate session
    if (sessionId) {
      const session = await Session.findOne({ sessionId })
      if (session) {
        await session.deactivate()
      }
    }

    // Update user's online status
    const user = await User.findById(req.user._id)
    if (user) {
      user.isOnline = false
      user.lastSeen = new Date()
      await user.save()
    }

    res.json({
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      error: 'Error during logout'
    })
  }
})

module.exports = router 