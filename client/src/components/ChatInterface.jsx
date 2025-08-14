import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '../context/ChatContext'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { useParams } from 'react-router-dom'
import MessageList from './MessageList'
import { MagnifyingGlassIcon, PaperClipIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline'
import npciLogo from '../assets/npci-logo.jpg'

const ChatInterface = ({ sidebarOpen, setSidebarOpen }) => {
  const { messages, isLoading, typing, aiTyping, sendMessage, chats, fetchMessages, clearMessages } = useChat()
  const { isConnected } = useSocket()
  const { isAuthenticated } = useAuth()
  const { chatId } = useParams()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const bottomInputRef = useRef(null)
  const [inputValue, setInputValue] = useState('')
  const [justTransitioned, setJustTransitioned] = useState(false)
  // Image upload state
  const [imageData, setImageData] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Handle attachment button click
  const fileInputRef = useRef(null)

  const handleAttachmentClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Limit file size to 1MB to stay within backend limits
      const maxSize = 1024 * 1024 // 1MB
      if (file.size > maxSize) {
        alert('Please select an image smaller than 1MB.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result
        setImagePreview(dataUrl)
        setImageData(dataUrl.split(',')[1])
        setImageFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageData(null)
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Clear any selected image when switching chats
  useEffect(() => {
    setImageData(null)
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [chatId])

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

  // Detect transition from empty to non-empty chat
  useEffect(() => {
    if (messages.length === 1) {
      // Just transitioned from empty to having one message
      setJustTransitioned(true)
      // Focus the bottom input immediately
      setTimeout(() => {
        bottomInputRef.current?.focus()
        setJustTransitioned(false)
      }, 100)
    }
  }, [messages.length])

  // Auto-focus input after AI response is complete
  useEffect(() => {
    if (!isLoading && !aiTyping && !justTransitioned) {
      // If we have messages, focus the bottom input
      if (messages.length > 0) {
        // Check if the last message is from assistant and not streaming
        const lastMessage = messages[messages.length - 1]
        if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.isStreaming) {
          // Small delay to ensure the message is fully rendered
          setTimeout(() => {
            bottomInputRef.current?.focus()
          }, 100)
        }
      } else {
        // If no messages, focus the main input
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    }
  }, [isLoading, aiTyping, messages, justTransitioned])

  const handleSubmit = (e) => {
    e.preventDefault()
    if ((inputValue.trim() || imageData) && !isLoading) {
      const textToSend = inputValue.trim() || '[image]'
      const imageParam = imageData ? { base64: imageData, file: imageFile } : null
      sendMessage(textToSend, chatId, imageParam)
      setInputValue('')
      setImageData(null)
      setImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
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
                        <MagnifyingGlassIcon className="w-4 h-4 text-primary-500" />
                      </div>
                    </div>
                    
                    {/* Input Field */}
                    <div className="flex-1">
                      <input
                        ref={inputRef}
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
                        onClick={handleAttachmentClick}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <PaperClipIcon className="w-4 h-4 text-gray-500" />
                      </button>
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isLoading 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-primary-500 hover:bg-primary-600'
                        }`}
                      >
                        <PaperAirplaneIcon className={`w-4 h-4 ${isLoading ? 'text-gray-500' : 'text-white'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              {imagePreview && (
                <div className="w-full max-w-4xl mx-auto flex flex-col items-start text-left">
                  <div className="relative">
                    <img src={imagePreview} alt="preview" className="w-28 h-28 object-cover rounded-lg shadow-sm ring-1 ring-black/5" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-white shadow-sm rounded-full p-1 hover:bg-gray-50"
                    >
                      <XMarkIcon className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  <span className="mt-2 text-xs text-gray-600">Image ready to send</span>
                </div>
              )}
              
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
              {(typing || aiTyping) && (
                <div className="flex items-center p-4">
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
      
      {/* Hidden file input (single shared instance for both forms) */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Input Area - Always present but hidden when no messages */}
      <div className={`border-t border-gray-200 p-4 bg-background-primary ${messages.length === 0 ? 'hidden' : ''}`}>
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="relative bg-background-primary border border-gray-200 rounded-2xl shadow-medium p-4">
              <div className="flex items-center space-x-3">
                {/* Left Icons */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center">
                    <MagnifyingGlassIcon className="w-4 h-4 text-primary-500" />
                  </div>
                </div>
                
                {/* Input Field */}
                <div className="flex-1">
                  <input
                    ref={bottomInputRef}
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
                    onClick={handleAttachmentClick}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <PaperClipIcon className="w-4 h-4 text-gray-500" />
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isLoading 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-primary-500 hover:bg-primary-600'
                    }`}
                  >
                    <PaperAirplaneIcon className={`w-4 h-4 ${isLoading ? 'text-gray-500' : 'text-white'}`} />
                  </button>
                </div>
              </div>
            </div>
          </form>
          {imagePreview && (
            <div className="mt-3 flex items-center space-x-2">
              <div className="relative">
                <img src={imagePreview} alt="preview" className="w-24 h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-white/70 hover:bg-white rounded-full p-1"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-700" />
                </button>
              </div>
              <span className="text-sm text-gray-600">Image ready to send</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatInterface 