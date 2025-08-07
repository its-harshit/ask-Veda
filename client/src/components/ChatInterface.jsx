import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '../context/ChatContext'
import { useSocket } from '../context/SocketContext'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import { Menu, Plus, Send, Bot, User } from 'lucide-react'

const ChatInterface = ({ sidebarOpen, setSidebarOpen }) => {
  const { messages, isLoading, typing } = useChat()
  const { isConnected } = useSocket()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <ChatHeader 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        isConnected={isConnected}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome to ChatUI
            </h2>
            <p className="text-gray-600 max-w-md">
              Start a conversation by typing a message below. I'm here to help you with any questions or tasks you might have.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
              <div className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors cursor-pointer">
                <h3 className="font-medium text-gray-900 mb-2">Ask me anything</h3>
                <p className="text-sm text-gray-600">Get answers to your questions with detailed explanations</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors cursor-pointer">
                <h3 className="font-medium text-gray-900 mb-2">Code assistance</h3>
                <p className="text-sm text-gray-600">Get help with programming and debugging code</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors cursor-pointer">
                <h3 className="font-medium text-gray-900 mb-2">Writing help</h3>
                <p className="text-sm text-gray-600">Get assistance with writing, editing, and content creation</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors cursor-pointer">
                <h3 className="font-medium text-gray-900 mb-2">Analysis</h3>
                <p className="text-sm text-gray-600">Analyze data, documents, or complex topics</p>
              </div>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
        
        {/* Typing indicator */}
        {typing && (
          <div className="flex items-center space-x-2 p-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
              <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput />
      </div>
    </div>
  )
}

export default ChatInterface 