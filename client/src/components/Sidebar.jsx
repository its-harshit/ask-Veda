import React, { useState, useEffect } from 'react'
import { Plus, MessageSquare, Settings, User, LogOut, Search, AlertTriangle, HelpCircle, Menu, Info } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
// Import your NPCI logo images
import npciLogo from '../assets/npci-logo.jpg'
import npciLogoExpanded from '../assets/NPCI.jpg'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { chats, createChat, clearMessages, isLoading, isCreatingChat, isLoadingChats, hasEmptyChat, error } = useChat()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { chatId } = useParams()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showError, setShowError] = useState(false)

  const handleNewChat = async () => {
    const newChat = await createChat('New Chat')
    if (newChat) {
      clearMessages()
      navigate(`/chat/${newChat.id}`)
      setShowMobileMenu(false)
    } else if (error) {
      setShowError(true)
      setTimeout(() => setShowError(false), 5000) // Hide error after 5 seconds
    }
  }

  const handleChatClick = (chat) => {
    navigate(`/chat/${chat.id}`)
    setShowMobileMenu(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
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

  const formatLastMessage = (lastMessage) => {
    if (!lastMessage || !lastMessage.content) return 'No messages yet'
    return lastMessage.content.length > 30 
      ? lastMessage.content.substring(0, 30) + '...'
      : lastMessage.content
  }

  const getChatTitle = (chat) => {
    console.log('Chat data for title:', chat)
    
    // If chat has a custom title, use it
    if (chat.title && chat.title !== 'New Chat') {
      return chat.title
    }
    
    // If chat has a last message from user, use that as title
    if (chat.lastMessage && chat.lastMessage.content && chat.lastMessage.role === 'user') {
      const content = chat.lastMessage.content
      return content.length > 30 ? content.substring(0, 30) + '...' : content
    }
    
    // Default fallback
    return 'New Chat'
  }

  const isEmptyChat = (chat) => {
    return chat.messageCount === 0 || !chat.lastMessage || !chat.lastMessage.content
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-14 md:w-18 hover:w-80 bg-background-primary border-r border-gray-200 transform transition-all duration-300 ease-in-out group`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <img 
              src={npciLogo} 
              alt="NPCI Logo" 
              className="w-12 rounded-lg transition-all duration-300 ease-in-out group-hover:opacity-0"
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
              disabled={isCreatingChat || hasEmptyChat()}
              className="w-full h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-medium hover:shadow-large transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-gradient-to-r group-hover:from-primary-500 group-hover:to-primary-600 group-hover:text-white"
              title={hasEmptyChat() ? "You already have an empty chat. Use that one first." : "Create new chat"}
            >
              {/* Collapsed state - Light circle with dark plus */}
              <div className="mt-1 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:hidden">
                <Plus className="w-4 h-4 text-gray-700" />
              </div>
              
              {/* Expanded state - Original gradient design */}
              <span className="hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {isCreatingChat ? 'Creating...' : hasEmptyChat() ? 'New Chat' : 'New Chat'}
              </span>
            </button>
            
            {/* Error message */}
            {showError && error && (
              <div className="mt-2 p-2 bg-warning-50 border border-warning-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-warning-600" />
                  <p className="text-xs text-warning-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <div className="">
              {isLoadingChats ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center py-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">No chats yet</p>
                  <p className="text-xs text-gray-400 mt-1">Create your first chat!</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    className={`flex items-center space-x-3 p-1 group-hover:p-2 rounded-lg hover:bg-background-tertiary transition-all duration-200 cursor-pointer ${
                      chatId === chat.id ? 'bg-background-tertiary shadow-soft border border-primary-200' : ''
                    } ${isEmptyChat(chat) ? 'border-l-4 border-l-primary-500' : ''}`}
                  >
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                      chatId === chat.id ? 'text-primary-500' : isEmptyChat(chat) ? 'text-primary-500' : 'text-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className={`text-sm font-medium truncate ${
                        chatId === chat.id ? 'text-text-accent' : isEmptyChat(chat) ? 'text-text-accent' : 'text-text-primary'
                      }`}>
                        {getChatTitle(chat)}
                        {isEmptyChat(chat) && (
                          <span className="ml-1 text-xs text-primary-500">(Empty)</span>
                        )}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {formatDate(chat.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {/* Complaints and Help - Placeholder buttons */}
            <button className="flex items-center space-x-3 px-1 py-3 rounded-xl hover:bg-background-tertiary transition-colors cursor-pointer w-full group-hover:justify-start">
              <AlertTriangle className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">Complaints</span>
            </button>
            
            <button className="flex items-center space-x-3 px-1 py-3 rounded-xl hover:bg-background-tertiary transition-colors cursor-pointer w-full group-hover:justify-start">
              <HelpCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">Help</span>
            </button>

            {/* User Info */}
            <button className="flex items-center space-x-3 px-1 py-3 rounded-xl hover:bg-background-tertiary transition-colors cursor-pointer w-full group-hover:justify-start">
              <div className="w-5 h-5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-xs">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">Account</span>
            </button>
            
            <button className="flex items-center space-x-3 px-1 py-3 rounded-xl hover:bg-background-tertiary transition-colors cursor-pointer w-full group-hover:justify-start">
              <Settings className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">Settings</span>
            </button>
            
            <button className="flex items-center space-x-3 px-1 py-3 rounded-xl hover:bg-background-tertiary transition-colors cursor-pointer w-full group-hover:justify-start">
              <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">Profile</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-1 py-3 rounded-xl hover:bg-danger-50 transition-colors cursor-pointer w-full text-danger-600 hover:text-danger-700 group-hover:justify-start"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <img 
                    src={npciLogoExpanded} 
                    alt="NPCI Logo" 
                    className="w-32 h-16 object-contain"
                  />
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Menu className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={handleNewChat}
                  disabled={isCreatingChat || hasEmptyChat()}
                  className="w-full h-10 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-medium hover:shadow-large transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={hasEmptyChat() ? "You already have an empty chat. Use that one first." : "Create new chat"}
                >
                  {isCreatingChat ? 'Creating...' : hasEmptyChat() ? 'Empty Chat Exists' : 'New Chat'}
                </button>
                
                {/* Error message for mobile */}
                {showError && error && (
                  <div className="mt-2 p-2 bg-warning-50 border border-warning-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Info className="w-4 h-4 text-warning-600" />
                      <p className="text-xs text-warning-700">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {isLoadingChats ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
                    </div>
                  ) : chats.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-text-secondary">No chats yet</p>
                      <p className="text-xs text-gray-400 mt-1">Create your first chat!</p>
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => handleChatClick(chat)}
                        className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-background-tertiary transition-colors cursor-pointer ${
                          chatId === chat.id ? 'bg-background-tertiary border border-primary-200' : ''
                        } ${isEmptyChat(chat) ? 'border-l-4 border-l-primary-500' : ''}`}
                      >
                        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                          chatId === chat.id ? 'text-primary-500' : isEmptyChat(chat) ? 'text-primary-500' : 'text-gray-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            chatId === chat.id ? 'text-text-accent' : isEmptyChat(chat) ? 'text-text-accent' : 'text-text-primary'
                          }`}>
                            {getChatTitle(chat)}
                            {isEmptyChat(chat) && (
                              <span className="ml-1 text-xs text-primary-500">(Empty)</span>
                            )}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {formatDate(chat.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 space-y-2">
                <button className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-background-tertiary transition-colors cursor-pointer w-full">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-text-primary">{user?.username || 'User'}</p>
                    <p className="text-xs text-text-secondary">{user?.mobile || ''}</p>
                  </div>
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-danger-50 transition-colors cursor-pointer w-full text-danger-600 hover:text-danger-700"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar 