const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userAgent: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  logoutTime: {
    type: Date,
    default: null
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
sessionSchema.index({ sessionId: 1 })
sessionSchema.index({ userId: 1 })
sessionSchema.index({ isActive: 1, lastActivity: -1 })

// Method to generate session ID
sessionSchema.statics.generateSessionId = function() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Method to update last activity
sessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date()
  return this.save()
}

// Method to deactivate session
sessionSchema.methods.deactivate = function() {
  this.isActive = false
  this.logoutTime = new Date()
  return this.save()
}

// Method to get session summary
sessionSchema.methods.toSummaryJSON = function() {
  return {
    id: this._id,
    sessionId: this.sessionId,
    userId: this.userId,
    isActive: this.isActive,
    lastActivity: this.lastActivity,
    loginTime: this.loginTime,
    logoutTime: this.logoutTime,
    createdAt: this.createdAt
  }
}

module.exports = mongoose.model('Session', sessionSchema)
