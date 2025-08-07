import React from 'react'
import { Plus, MessageSquare, Settings, User, LogOut } from 'lucide-react'
import { useChat } from '../context/ChatContext'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { chats, addChat, clearMessages } = useChat()

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date().toISOString(),
      messages: []
    }
    addChat(newChat)
    clearMessages()
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleNewChat}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="sidebar-item"
              >
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {chat.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(chat.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {chats.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No chat history yet</p>
                <p className="text-gray-400 text-xs mt-1">Start a new conversation to see it here</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="sidebar-item w-full">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm">Settings</span>
          </button>
          
          <button className="sidebar-item w-full">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm">Profile</span>
          </button>
          
          <button className="sidebar-item w-full text-red-600 hover:text-red-700">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default Sidebar 