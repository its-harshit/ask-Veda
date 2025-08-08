const express = require('express')
const jwt = require('jsonwebtoken')
const Message = require('../models/Message')
const Chat = require('../models/Chat')
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

// Get messages for a chat
router.get('/chat/:chatId', authenticateUser, async (req, res) => {
  try {
    const { chatId } = req.params
    const { page = 1, limit = 50 } = req.query

    // Check if user has access to this chat
    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({
        error: 'Chat not found'
      })
    }

    const isParticipant = chat.participants.includes(req.user._id) || 
                         chat.createdBy.toString() === req.user._id.toString()

    if (!isParticipant) {
      return res.status(403).json({
        error: 'Access denied'
      })
    }

    // Get messages with pagination
    const messages = await Message.find({ chatId })
      .populate('sender', 'username avatar')
      .sort({ timestamp: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    // Get total count
    const total = await Message.countDocuments({ chatId })

    res.json({
      messages: messages.map(msg => msg.toFullJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({
      error: 'Error fetching messages'
    })
  }
})

// Send a message
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { content, chatId, role = 'user' } = req.body

    if (!content || !chatId) {
      return res.status(400).json({
        error: 'Content and chatId are required'
      })
    }

    // Check if user has access to this chat
    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({
        error: 'Chat not found'
      })
    }

    const isParticipant = chat.participants.includes(req.user._id) || 
                         chat.createdBy.toString() === req.user._id.toString()

    if (!isParticipant) {
      return res.status(403).json({
        error: 'Access denied'
      })
    }

    // Get session ID from token
    const token = req.headers.authorization?.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const sessionId = decoded.sessionId

    // Create new message
    const message = new Message({
      content,
      role,
      chatId,
      sessionId: sessionId,
      sender: req.user._id,
      timestamp: new Date()
    })

    await message.save()

    // Update chat's last message
    await chat.updateLastMessage(message, req.user._id)

    // Populate sender info
    await message.populate('sender', 'username avatar')

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: message.toFullJSON()
    })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({
      error: 'Error sending message'
    })
  }
})

// Mark messages as read
router.put('/:messageId/read', authenticateUser, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId)

    if (!message) {
      return res.status(404).json({
        error: 'Message not found'
      })
    }

    // Check if user has access to this message's chat
    const chat = await Chat.findById(message.chatId)
    if (!chat) {
      return res.status(404).json({
        error: 'Chat not found'
      })
    }

    const isParticipant = chat.participants.includes(req.user._id) || 
                         chat.createdBy.toString() === req.user._id.toString()

    if (!isParticipant) {
      return res.status(403).json({
        error: 'Access denied'
      })
    }

    await message.markAsRead(req.user._id)

    res.json({
      message: 'Message marked as read',
      messageData: message.toFullJSON()
    })
  } catch (error) {
    console.error('Mark as read error:', error)
    res.status(500).json({
      error: 'Error marking message as read'
    })
  }
})

// Delete a message
router.delete('/:messageId', authenticateUser, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId)

    if (!message) {
      return res.status(404).json({
        error: 'Message not found'
      })
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Only message sender can delete message'
      })
    }

    await message.remove()

    res.json({
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({
      error: 'Error deleting message'
    })
  }
})

// Get unread message count for a chat
router.get('/chat/:chatId/unread', authenticateUser, async (req, res) => {
  try {
    const { chatId } = req.params

    // Check if user has access to this chat
    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({
        error: 'Chat not found'
      })
    }

    const isParticipant = chat.participants.includes(req.user._id) || 
                         chat.createdBy.toString() === req.user._id.toString()

    if (!isParticipant) {
      return res.status(403).json({
        error: 'Access denied'
      })
    }

    // Count unread messages
    const unreadCount = await Message.countDocuments({
      chatId,
      sender: { $ne: req.user._id },
      readBy: { $not: { $elemMatch: { user: req.user._id } } }
    })

    res.json({
      unreadCount
    })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({
      error: 'Error fetching unread count'
    })
  }
})

module.exports = router 