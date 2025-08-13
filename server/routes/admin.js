const express = require('express')
const jwt = require('jsonwebtoken')
const Chat = require('../models/Chat')
const Message = require('../models/Message')
const User = require('../models/User')
const router = express.Router()

// Middleware to authenticate admin user
const authenticateAdmin = async (req, res, next) => {
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

    // For now, we'll allow any authenticated user to access admin routes
    // In production, you should add an isAdmin field to the User model
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token'
    })
  }
}

// Get all chats with pagination and filters
router.get('/chats', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, sessionId, userId, search } = req.query
    const skip = (page - 1) * limit

    let query = {}

    // Filter by session ID
    if (sessionId) {
      query.sessionId = sessionId
    }

    // Filter by user
    if (userId) {
      query.$or = [
        { createdBy: userId },
        { participants: userId }
      ]
    }

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' }
    }

    const chats = await Chat.find(query)
      .populate('createdBy', 'username mobile')
      .populate('participants', 'username mobile')
      .populate('lastMessage.sender', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Chat.countDocuments(query)

    res.json({
      chats: chats.map(chat => ({
        id: chat._id,
        title: chat.title,
        sessionId: chat.sessionId,
        createdBy: chat.createdBy,
        participants: chat.participants,
        lastMessage: chat.lastMessage,
        messageCount: chat.messageCount,
        isActive: chat.isActive,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Admin get chats error:', error)
    res.status(500).json({
      error: 'Error fetching chats'
    })
  }
})

// Get all messages with pagination and filters
router.get('/messages', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, chatId, sessionId, userId, role } = req.query
    const skip = (page - 1) * limit

    let query = {}

    // Filter by chat ID
    if (chatId) {
      query.chatId = chatId
    }

    // Filter by session ID
    if (sessionId) {
      query.sessionId = sessionId
    }

    // Filter by user
    if (userId) {
      query.sender = userId
    }

    // Filter by role
    if (role) {
      query.role = role
    }

    const messages = await Message.find(query)
      .populate('chatId', 'title sessionId')
      .populate('sender', 'username mobile')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Message.countDocuments(query)

    res.json({
      messages: messages.map(message => ({
        id: message._id,
        content: message.content,
        role: message.role,
        chatId: message.chatId,
        sessionId: message.sessionId,
        sender: message.sender,
        timestamp: message.timestamp,
        isRead: message.isRead,
        createdAt: message.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Admin get messages error:', error)
    res.status(500).json({
      error: 'Error fetching messages'
    })
  }
})

// Get all users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const skip = (page - 1) * limit

    let query = {}

    // Search by username or mobile
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ]
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await User.countDocuments(query)

    res.json({
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        mobile: user.mobile,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Admin get users error:', error)
    res.status(500).json({
      error: 'Error fetching users'
    })
  }
})

// Export chat data as JSON or CSV
router.get('/export/chat/:chatId', authenticateAdmin, async (req, res) => {
  console.log('=== EXPORT CHAT ROUTE HIT ===')
  try {
    const { format = 'json' } = req.query
    
    console.log('Export chat request:', {
      chatId: req.params.chatId,
      format: format,
      query: req.query
    })

    const chat = await Chat.findById(req.params.chatId)
      .populate('createdBy', 'username mobile')
      .populate('participants', 'username mobile')

    if (!chat) {
      return res.status(404).json({
        error: 'Chat not found'
      })
    }

    const messages = await Message.find({ chatId: chat._id })
      .populate('sender', 'username mobile')
      .sort({ timestamp: 1 })

    const exportData = {
      chat: {
        id: chat._id,
        title: chat.title,
        sessionId: chat.sessionId,
        createdBy: chat.createdBy,
        participants: chat.participants,
        messageCount: chat.messageCount,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      },
      messages: messages.map(message => ({
        id: message._id,
        content: message.content,
        role: message.role,
        sender: message.sender,
        timestamp: message.timestamp,
        createdAt: message.createdAt
      }))
    }

    console.log('Export format:', format)
    
    if (format === 'json') {
      console.log('Exporting as JSON')
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="${chat._id}.json"`)
      console.log('Sending JSON with filename:', `${chat._id}.json`)
      res.json(exportData)
    } else if (format === 'csv') {
      console.log('Exporting as CSV')
      // Convert to conversation format CSV
      const conversationRows = []
      
      // Group messages into conversation pairs
      for (let i = 0; i < messages.length; i += 2) {
        const userMessage = messages[i]
        const assistantMessage = messages[i + 1]
        
        if (userMessage && userMessage.role === 'user') {
          const userQuestion = userMessage.content.replace(/"/g, '""') // Escape quotes
          const assistantResponse = assistantMessage && assistantMessage.role === 'assistant' 
            ? assistantMessage.content.replace(/"/g, '""') // Escape quotes
            : ''
          
          conversationRows.push([
            `"${userQuestion}"`,
            `"${assistantResponse}"`
          ])
        }
      }
      
      // Create CSV with conversation format
      const csvData = [
        ['User\'s Question', 'Assistant\'s Response'],
        ...conversationRows
      ]
      
      const csvContent = csvData.map(row => row.join(',')).join('\n')
      
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${chat._id}.csv"`)
      console.log('Sending CSV with filename:', `${chat._id}.csv`)
      res.send(csvContent)
    } else {
      res.status(400).json({
        error: 'Unsupported format'
      })
    }
  } catch (error) {
    console.error('Admin export chat error:', error)
    res.status(500).json({
      error: 'Error exporting chat'
    })
  }
})

// Export session data as JSON or CSV
router.get('/export/session/:sessionId', authenticateAdmin, async (req, res) => {
  try {
    const { format = 'json' } = req.query

    const chats = await Chat.find({ sessionId: req.params.sessionId })
      .populate('createdBy', 'username mobile')
      .populate('participants', 'username mobile')

    if (chats.length === 0) {
      return res.status(404).json({
        error: 'Session not found'
      })
    }

    const chatIds = chats.map(chat => chat._id)
    const messages = await Message.find({ chatId: { $in: chatIds } })
      .populate('sender', 'username mobile')
      .populate('chatId', 'title')
      .sort({ timestamp: 1 })

    const exportData = {
      sessionId: req.params.sessionId,
      chats: chats.map(chat => ({
        id: chat._id,
        title: chat.title,
        createdBy: chat.createdBy,
        participants: chat.participants,
        messageCount: chat.messageCount,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      })),
      messages: messages.map(message => ({
        id: message._id,
        content: message.content,
        role: message.role,
        chatId: message.chatId,
        sender: message.sender,
        timestamp: message.timestamp,
        createdAt: message.createdAt
      }))
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="${req.params.sessionId}.json"`)
      console.log('Sending session JSON with filename:', `${req.params.sessionId}.json`)
      res.json(exportData)
    } else if (format === 'csv') {
      // Convert to CSV format
      const csvData = [
        ['Message ID', 'Role', 'Content', 'Chat Title', 'Sender', 'Timestamp', 'Created At'],
        ...messages.map(message => [
          message._id,
          message.role,
          `"${message.content.replace(/"/g, '""')}"`, // Escape quotes in content
          message.chatId?.title || 'Unknown Chat',
          message.sender?.username || 'System',
          message.timestamp,
          message.createdAt
        ])
      ]
      
      const csvContent = csvData.map(row => row.join(',')).join('\n')
      
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${req.params.sessionId}.csv"`)
      console.log('Sending session CSV with filename:', `${req.params.sessionId}.csv`)
      res.send(csvContent)
    } else {
      res.status(400).json({
        error: 'Unsupported format'
      })
    }
  } catch (error) {
    console.error('Admin export session error:', error)
    res.status(500).json({
      error: 'Error exporting session'
    })
  }
})

// Get chat details with messages
router.get('/chats/:chatId', authenticateAdmin, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('createdBy', 'username mobile')
      .populate('participants', 'username mobile')

    if (!chat) {
      return res.status(404).json({
        error: 'Chat not found'
      })
    }

    const messages = await Message.find({ chatId: chat._id })
      .populate('sender', 'username mobile')
      .sort({ timestamp: 1 })

    res.json({
      chat: {
        id: chat._id,
        title: chat.title,
        sessionId: chat.sessionId,
        createdBy: chat.createdBy,
        participants: chat.participants,
        lastMessage: chat.lastMessage,
        messageCount: chat.messageCount,
        isActive: chat.isActive,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      },
      messages: messages.map(message => ({
        id: message._id,
        content: message.content,
        role: message.role,
        sender: message.sender,
        timestamp: message.timestamp,
        isRead: message.isRead,
        createdAt: message.createdAt
      }))
    })
  } catch (error) {
    console.error('Admin get chat details error:', error)
    res.status(500).json({
      error: 'Error fetching chat details'
    })
  }
})

// Get dashboard statistics
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalChats = await Chat.countDocuments()
    const totalMessages = await Message.countDocuments()
    
    // Get unique session IDs
    const uniqueSessions = await Chat.distinct('sessionId')
    const totalSessions = uniqueSessions.length

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    })
    
    const recentChats = await Chat.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    })
    
    const recentMessages = await Message.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    })

    res.json({
      totalUsers,
      totalChats,
      totalMessages,
      totalSessions,
      recentActivity: {
        users: recentUsers,
        chats: recentChats,
        messages: recentMessages
      }
    })
  } catch (error) {
    console.error('Admin get stats error:', error)
    res.status(500).json({
      error: 'Error fetching statistics'
    })
  }
})

module.exports = router
