const express = require('express')
const jwt = require('jsonwebtoken')
const Chat = require('../models/Chat')
const Message = require('../models/Message')
const User = require('../models/User')
const router = express.Router()

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
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

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token'
    })
  }
}

// Get all chats for user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [
        { createdBy: req.user._id },
        { participants: req.user._id }
      ]
    })
    .populate('lastMessage.sender', 'username avatar')
    .populate('participants', 'username avatar isOnline')
    .sort({ updatedAt: -1 })

    res.json({
      chats: chats.map(chat => chat.toSummaryJSON())
    })
  } catch (error) {
    console.error('Get chats error:', error)
    res.status(500).json({
      error: 'Error fetching chats'
    })
  }
})

// Create new chat
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { title = 'New Chat' } = req.body

    // Get session ID from token
    const token = req.headers.authorization?.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const sessionId = decoded.sessionId

    if (!sessionId) {
      return res.status(400).json({
        error: 'Invalid session. Please login again.'
      })
    }

    const chat = new Chat({
      title,
      createdBy: req.user._id,
      participants: [req.user._id],
      sessionId: sessionId
    })

    await chat.save()

    // Populate creator info
    await chat.populate('createdBy', 'username avatar')

    res.status(201).json({
      message: 'Chat created successfully',
      chat: chat.toSummaryJSON()
    })
  } catch (error) {
    console.error('Create chat error:', error)
    res.status(500).json({
      error: 'Error creating chat'
    })
  }
})

// Get specific chat
router.get('/:chatId', authenticateUser, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'username avatar isOnline')
      .populate('createdBy', 'username avatar')

    if (!chat) {
      return res.status(404).json({
        error: 'Chat not found'
      })
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      participant => participant._id.toString() === req.user._id.toString()
    ) || chat.createdBy._id.toString() === req.user._id.toString()

    if (!isParticipant) {
      return res.status(403).json({
        error: 'Access denied'
      })
    }

    res.json({
      chat: chat.toSummaryJSON()
    })
  } catch (error) {
    console.error('Get chat error:', error)
    res.status(500).json({
      error: 'Error fetching chat'
    })
  }
})

// Update chat
router.put('/:chatId', authenticateUser, async (req, res) => {
  try {
    const { title } = req.body

    const chat = await Chat.findById(req.params.chatId)

    if (!chat) {
      return res.status(404).json({
        error: 'Chat not found'
      })
    }

    // Check if user is creator
    if (chat.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Only chat creator can update chat'
      })
    }

    chat.title = title || chat.title
    await chat.save()

    res.json({
      message: 'Chat updated successfully',
      chat: chat.toSummaryJSON()
    })
  } catch (error) {
    console.error('Update chat error:', error)
    res.status(500).json({
      error: 'Error updating chat'
    })
  }
})

// Delete chat
router.delete('/:chatId', authenticateUser, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)

    if (!chat) {
      return res.status(404).json({
        error: 'Chat not found'
      })
    }

    // Check if user is creator
    if (chat.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Only chat creator can delete chat'
      })
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chatId: chat._id })

    // Delete the chat
    await chat.remove()

    res.json({
      message: 'Chat deleted successfully'
    })
  } catch (error) {
    console.error('Delete chat error:', error)
    res.status(500).json({
      error: 'Error deleting chat'
    })
  }
})

// Add participant to chat
router.post('/:chatId/participants', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.body

    const chat = await Chat.findById(req.params.chatId)

    if (!chat) {
      return res.status(404).json({
        error: 'Chat not found'
      })
    }

    // Check if user is creator
    if (chat.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Only chat creator can add participants'
      })
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    // Add user to participants if not already there
    if (!chat.participants.includes(userId)) {
      chat.participants.push(userId)
      await chat.save()
    }

    res.json({
      message: 'Participant added successfully',
      chat: chat.toSummaryJSON()
    })
  } catch (error) {
    console.error('Add participant error:', error)
    res.status(500).json({
      error: 'Error adding participant'
    })
  }
})

module.exports = router 