const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(cors())
// Increase body size limit to accommodate large AI responses (tables, code blocks, etc.)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/askveda')

const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => {
  console.log('Connected to MongoDB')
})

// Models
const Chat = require('./models/Chat')
const Message = require('./models/Message')
const User = require('./models/User')

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/chats', require('./routes/chats'))
app.use('/api/messages', require('./routes/messages'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/admin', require('./routes/admin'))

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-chat', (chatId) => {
    socket.join(chatId)
    console.log(`User ${socket.id} joined chat ${chatId}`)
  })

  socket.on('leave-chat', (chatId) => {
    socket.leave(chatId)
    console.log(`User ${socket.id} left chat ${chatId}`)
  })

  socket.on('message', async (data) => {
    try {
      let chatId = data.chatId
      
             // If chatId is 'default', create or find a default chat
       if (chatId === 'default') {
         let defaultChat = await Chat.findOne({ title: 'Default Chat' })
         if (!defaultChat) {
           defaultChat = new Chat({
             title: 'Default Chat',
             createdBy: undefined, // No user authentication yet
             participants: []
           })
           await defaultChat.save()
         }
         chatId = defaultChat._id
       }

      // Save message to database
      const message = new Message({
        content: data.content,
        role: data.role,
        chatId: chatId,
        timestamp: new Date()
      })
      await message.save()

      // Update chat's last message
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: {
          content: data.content,
          timestamp: new Date(),
          sender: null
        },
        $inc: { messageCount: 1 }
      })

      // Broadcast to all users in the chat
      socket.to(chatId.toString()).emit('message', {
        id: message._id,
        content: message.content,
        role: message.role,
        timestamp: message.timestamp,
        chatId: chatId
      })

      console.log('Message saved and broadcasted:', message._id)
    } catch (error) {
      console.error('Error handling message:', error)
    }
  })

  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('typing', data)
  })

  socket.on('stop-typing', (data) => {
    socket.to(data.chatId).emit('stop-typing', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'askVeda API is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 