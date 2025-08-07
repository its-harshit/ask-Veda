import React from 'react'
import { Plus, MessageSquare, Settings, User, LogOut, Search, AlertTriangle, HelpCircle } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
// Import your NPCI logo images
import npciLogo from '../assets/npci-logo.jpg'
import npciLogoExpanded from '../assets/NPCI.jpg'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { chats, addChat, clearMessages } = useChat()
  const { user, logout } = useAuth()

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

  const handleLogout = async () => {
    await logout()
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
    <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-16 md:w-16 hover:w-80 bg-gray-50 border-r border-gray-200 transform transition-all duration-300 ease-in-out group`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <img 
            src={npciLogo} 
            alt="NPCI Logo" 
            className="w-full rounded-lg transition-all duration-300 ease-in-out group-hover:opacity-0"
          />
          <img 
            src={npciLogoExpanded} 
            alt="NPCI Logo" 
            className="w-32 h-16 rounded-lg absolute top-4 left-4 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 object-contain"
          />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleNewChat}
            className="w-full h-10 bg-gradient-to-r from-npci-600 to-npci-700 text-white rounded-xl flex items-center justify-center hover:from-npci-700 hover:to-npci-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="text-white font-bold text-2xl group-hover:hidden">+</span>
            <span className="hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100 group-hover:flex"
              >
                <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
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
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {/* Complaints and Help */}
          <button className="flex items-center space-x-3 px-1 py-3 rounded-xl hover:bg-white transition-colors cursor-pointer w-full group-hover:justify-start">
            <AlertTriangle className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Complaints</span>
          </button>
          
          <button className="flex items-center space-x-3 px-1 py-3 rounded-xl hover:bg-white transition-colors cursor-pointer w-full group-hover:justify-start">
            <HelpCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Help</span>
          </button>

          {/* User Info */}
          <button className="flex items-center space-x-3 px-1 py-3 rounded-xl hover:bg-white transition-colors cursor-pointer w-full group-hover:justify-start">
            <div className="w-5 h-5 bg-gradient-to-br from-npci-600 to-npci-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Account</span>
          </button>
          
          <button className="flex items-center space-x-3 px-1 py-3 rounded-xl hover:bg-white transition-colors cursor-pointer w-full group-hover:justify-start">
            <Settings className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Settings</span>
          </button>
          
          <button className="flex items-center space-x-3 px-1 py-3 rounded-xl hover:bg-white transition-colors cursor-pointer w-full group-hover:justify-start">
            <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Profile</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-1 py-3 rounded-xl hover:bg-red-50 transition-colors cursor-pointer w-full text-red-600 hover:text-red-700 group-hover:justify-start"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default Sidebar 