import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import { useSocket } from '../context/SocketContext'
import { useParams } from 'react-router-dom'

const MessageInput = () => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef(null)
  const { addMessage, setTyping } = useChat()
  const { sendMessage } = useSocket()
  const { chatId } = useParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const userMessage = {
      id: Date.now(),
      content: message.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
      chatId: chatId || 'default' // Use default chat if no chatId
    }

    addMessage(userMessage)
    setMessage('')
    setIsTyping(false)

    // Simulate AI response
    setTyping(true)
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        content: generateAIResponse(message.trim()),
        role: 'assistant',
        timestamp: new Date().toISOString(),
        chatId: chatId || 'default'
      }
      addMessage(aiMessage)
      setTyping(false)
    }, 1000 + Math.random() * 2000)

    // Send via socket with chatId
    sendMessage(userMessage)
  }

  const generateAIResponse = (userMessage) => {
    const responses = [
      "I understand your question about '" + userMessage + "'. Let me help you with that.",
      "That's an interesting topic! Here's what I can tell you about '" + userMessage + "'.",
      "Great question! '" + userMessage + "' is something I can definitely help you with.",
      "I'd be happy to assist you with '" + userMessage + "'. Here's what I know about this topic.",
      "Thanks for asking about '" + userMessage + "'. Let me provide you with some helpful information."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [message])

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="input-field min-h-[44px] max-h-[120px] pr-12"
          rows={1}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          <button
            type="button"
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <Paperclip className="w-4 h-4 text-gray-500" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <Smile className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={!message.trim()}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <Send className="w-4 h-4" />
        <span>Send</span>
      </button>
    </form>
  )
}

export default MessageInput 