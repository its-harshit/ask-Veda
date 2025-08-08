import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '../context/ChatContext'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { useParams } from 'react-router-dom'
import MessageList from './MessageList'
import { Menu, Plus, Send, Bot, User, Search, Paperclip } from 'lucide-react'
import npciLogo from '../assets/npci-logo.jpg'

const ChatInterface = ({ sidebarOpen, setSidebarOpen }) => {
  const { messages, isLoading, typing, sendMessage, chats, fetchMessages, clearMessages } = useChat()
  const { isConnected } = useSocket()
  const { isAuthenticated } = useAuth()
  const { chatId } = useParams()
  const messagesEndRef = useRef(null)
  const [inputValue, setInputValue] = useState('')

  // Load messages when chatId changes
  useEffect(() => {
    if (chatId && isAuthenticated) {
      fetchMessages(chatId)
    } else if (!chatId) {
      clearMessages()
    }
  }, [chatId, isAuthenticated])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      sendMessage(inputValue.trim(), chatId)
      setInputValue('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  // Show loading state while fetching data
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex flex-col h-full bg-background-secondary">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mb-4"></div>
            <p className="text-text-secondary">Loading chat...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background-primary">
      {/* Messages Area - Takes up available space */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-6xl mx-auto h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              {/* Brand */}
              <div className="flex items-center justify-center mb-8">
                <img 
                  src={npciLogo} 
                  alt="NPCI Logo" 
                  className="w-12 h-8 object-contain"
                />
                <h1 className="text-3xl font-bold text-text-primary">askVeda</h1>
              </div>
              
              {/* Main Search Input */}
              <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto mb-8">
                <div className="relative bg-background-primary border border-gray-200 rounded-2xl shadow-medium p-4">
                  <div className="flex items-center space-x-3">
                    {/* Left Icons */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center">
                        <Search className="w-4 h-4 text-primary-500" />
                      </div>
                    </div>
                    
                    {/* Input Field */}
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Ask anything..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full text-lg bg-transparent border-none outline-none placeholder-gray-500 text-text-primary"
                      />
                    </div>
                    
                    {/* Right Icons */}
                    <div className="flex items-center space-x-3">
                      <button 
                        type="button"
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Paperclip className="w-4 h-4 text-gray-500" />
                      </button>
                      <button 
                        type="submit"
                        className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                      >
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              
              {/* Action Buttons - Completely Separate */}
              <div className="flex items-center justify-center space-x-3 mb-8">
                <button className="px-4 py-2 bg-background-tertiary text-text-accent rounded-full flex items-center space-x-2 hover:bg-primary-200 transition-colors">
                  <span className="text-sm">💰</span>
                  <span className="text-sm font-medium">Payments</span>
                </button>
                <button className="px-4 py-2 bg-background-tertiary text-text-accent rounded-full flex items-center space-x-2 hover:bg-primary-200 transition-colors">
                  <span className="text-sm">🏦</span>
                  <span className="text-sm font-medium">UPI</span>
                </button>
                <button className="px-4 py-2 bg-background-tertiary text-text-accent rounded-full flex items-center space-x-2 hover:bg-primary-200 transition-colors">
                  <span className="text-sm">📊</span>
                  <span className="text-sm font-medium">Analytics</span>
                </button>
                <button className="px-4 py-2 bg-background-tertiary text-text-accent rounded-full flex items-center space-x-2 hover:bg-primary-200 transition-colors">
                  <span className="text-sm">🔒</span>
                  <span className="text-sm font-medium">Security</span>
                </button>
                <button className="px-4 py-2 bg-background-tertiary text-text-accent rounded-full flex items-center space-x-2 hover:bg-primary-200 transition-colors">
                  <span className="text-sm">📱</span>
                  <span className="text-sm font-medium">Mobile</span>
                </button>
              </div>
              
              {/* Welcome Message */}
              <p className="text-text-secondary max-w-md">
                {isAuthenticated 
                  ? "Start a conversation by typing a message above. I'm here to help you with any questions or tasks you might have."
                  : "Please log in to start chatting."
                }
              </p>
            </div>
          ) : (
            <>
              <MessageList messages={messages} />
              
              {/* Typing indicator */}
              {typing && (
                <div className="flex items-center space-x-2 p-4">
                  <div className="w-8 h-8 bg-background-tertiary rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                    <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
      
      {/* Input Area - Always present but hidden when no messages */}
      <div className={`border-t border-gray-200 p-4 bg-background-primary ${messages.length === 0 ? 'hidden' : ''}`}>
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="relative bg-background-primary border border-gray-200 rounded-2xl shadow-medium p-4">
              <div className="flex items-center space-x-3">
                {/* Left Icons */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center">
                    <Search className="w-4 h-4 text-primary-500" />
                  </div>
                </div>
                
                {/* Input Field */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Ask anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full text-lg bg-transparent border-none outline-none placeholder-gray-500 text-text-primary"
                  />
                </div>
                
                {/* Right Icons */}
                <div className="flex items-center space-x-2">
                  <button 
                    type="button"
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-gray-500" />
                  </button>
                  <button 
                    type="submit"
                    className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface 