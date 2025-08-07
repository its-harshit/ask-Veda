const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'New Chat'
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  lastMessage: {
    content: String,
    timestamp: Date,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  messageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
})

// Index for better query performance
chatSchema.index({ participants: 1, createdAt: -1 })
chatSchema.index({ createdBy: 1, createdAt: -1 })

// Method to update last message
chatSchema.methods.updateLastMessage = function(message, sender) {
  this.lastMessage = {
    content: message.content,
    timestamp: message.timestamp,
    sender: sender
  }
  this.messageCount += 1
  return this.save()
}

// Method to get chat summary
chatSchema.methods.toSummaryJSON = function() {
  return {
    id: this._id,
    title: this.title,
    lastMessage: this.lastMessage,
    messageCount: this.messageCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

module.exports = mongoose.model('Chat', chatSchema) 