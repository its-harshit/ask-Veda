import React from 'react'
import Message from './Message'
import { motion } from 'framer-motion'

const MessageList = ({ messages }) => {
  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <motion.div
          key={message.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Message message={message} />
        </motion.div>
      ))}
    </div>
  )
}

export default MessageList 