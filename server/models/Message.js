const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
    default: 'user'
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sessionId: {
    type: String,
    required: false,
    default: null
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }]
}, {
  timestamps: true
})

// Index for better query performance
messageSchema.index({ chatId: 1, timestamp: 1 })
messageSchema.index({ sender: 1, timestamp: -1 })

// Method to mark as read
messageSchema.methods.markAsRead = function(userId) {
  if (!this.readBy.some(read => read.user.toString() === userId.toString())) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    })
    this.isRead = true
    return this.save()
  }
  return Promise.resolve(this)
}

// Method to get message summary
messageSchema.methods.toSummaryJSON = function() {
  return {
    id: this._id,
    content: this.content,
    role: this.role,
    timestamp: this.timestamp,
    isRead: this.isRead,
    sender: this.sender
  }
}

// Method to get full message data
messageSchema.methods.toFullJSON = function() {
  return {
    id: this._id,
    content: this.content,
    role: this.role,
    chatId: this.chatId,
    sessionId: this.sessionId,
    sender: this.sender,
    timestamp: this.timestamp,
    isRead: this.isRead,
    readBy: this.readBy,
    attachments: this.attachments,
    metadata: this.metadata,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

module.exports = mongoose.model('Message', messageSchema) 