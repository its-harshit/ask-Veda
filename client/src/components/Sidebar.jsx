import React, { useState, useEffect } from 'react'
import { PlusIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon, UserIcon, ExclamationTriangleIcon, QuestionMarkCircleIcon, Bars3Icon, InformationCircleIcon, TrashIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
// Import your NPCI logo images
import npciLogo from '../assets/npci-logo.jpg'
import npciLogoExpanded from '../assets/NPCI.jpg'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { chats, createChat, clearMessages, isLoading, isCreatingChat, isLoadingChats, hasEmptyChat, error, removeChat } = useChat()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { chatId } = useParams()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showError, setShowError] = useState(false)
  const [hoveredSection, setHoveredSection] = useState(null)
  const [isHovering, setIsHovering] = useState(false)

  const handleNewChat = async () => {
    // Prevent multiple clicks while creating
    if (isCreatingChat) {
      return
    }

    // If there's already an empty chat, navigate to it instead of creating a new one
    if (hasEmptyChat()) {
      const emptyChat = chats.find(chat => 
        chat.messageCount === 0 || 
        !chat.lastMessage || 
        !chat.lastMessage.content
      )
      if (emptyChat) {
        navigate(`/chat/${emptyChat.id}`)
        setShowMobileMenu(false)
        return
      }
    }
    
    // Create new chat only if no empty chat exists
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

  const handleDeleteChat = (e, chatIdToDelete) => {
    e.stopPropagation() // Prevent chat selection
    removeChat(chatIdToDelete)
    
    // If we're currently in the deleted chat, navigate to a new chat
    if (chatId === chatIdToDelete) {
      handleNewChat()
    }
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
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Hover Container - includes both sidebar and pane area */}
      <div 
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out`}
        style={{ 
          width: isHovering && hoveredSection ? '320px' : '64px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false)
          setHoveredSection(null)
        }}
      >
        {/* Main Sidebar - Always narrow */}
        <div className="w-16 h-full bg-background-primary border-r border-gray-200">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-3 border-b border-gray-200 flex justify-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm border border-gray-200/50 flex items-center justify-center overflow-hidden icon-3d">
                <img 
                  src={npciLogo} 
                  alt="NPCI Logo" 
                  className="w-6 h-6 object-contain drop-shadow-sm"
                />
              </div>
            </div>

            {/* Navigation Icons */}
            <div className="flex-1 p-2 space-y-2">
              {/* Complaints */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredSection('complaints')}
              >
                <button className="w-full p-3 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 shadow-sm hover:shadow-md border border-orange-200/50 hover:border-orange-300/70 transition-all duration-300 cursor-pointer flex justify-center hover:scale-110 hover:-translate-y-0.5 group icon-3d">
                  <div className="relative">
                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 group-hover:text-orange-700 transition-all duration-300 drop-shadow-sm" />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </button>
              </div>

              {/* New Chat */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredSection('newchat')}
              >
                <button
                  onClick={handleNewChat}
                  disabled={isCreatingChat}
                  className="w-full p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 shadow-sm hover:shadow-md border border-green-200/50 hover:border-green-300/70 transition-all duration-300 cursor-pointer flex justify-center disabled:opacity-50 hover:scale-110 hover:-translate-y-0.5 disabled:hover:scale-100 disabled:hover:-translate-y-0 group icon-3d"
                >
                  <div className="relative">
                    {isCreatingChat ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent"></div>
                    ) : (
                      <PlusIcon className="w-5 h-5 text-green-600 group-hover:text-green-700 transition-all duration-300 drop-shadow-sm" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </button>
              </div>

              {/* Chat History */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredSection('chats')}
              >
                <button className="w-full p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 shadow-sm hover:shadow-md border border-blue-200/50 hover:border-blue-300/70 transition-all duration-300 cursor-pointer flex justify-center hover:scale-110 hover:-translate-y-0.5 group icon-3d">
                  <div className="relative">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-all duration-300 drop-shadow-sm" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Icons */}
            <div className="p-2 border-t border-gray-200 space-y-2">
              {/* Help */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredSection('help')}
              >
                <button className="w-full p-3 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 shadow-sm hover:shadow-md border border-purple-200/50 hover:border-purple-300/70 transition-all duration-300 cursor-pointer flex justify-center hover:scale-110 hover:-translate-y-0.5 group icon-3d">
                  <div className="relative">
                    <QuestionMarkCircleIcon className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-all duration-300 drop-shadow-sm" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </button>
              </div>

              {/* Settings */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredSection('settings')}
              >
                <button className="w-full p-3 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 shadow-sm hover:shadow-md border border-slate-200/50 hover:border-slate-300/70 transition-all duration-300 cursor-pointer flex justify-center hover:scale-110 hover:-translate-y-0.5 group icon-3d">
                  <div className="relative">
                    <Cog6ToothIcon className="w-5 h-5 text-slate-600 group-hover:text-slate-700 transition-all duration-300 drop-shadow-sm" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-400/20 to-transparent rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </button>
              </div>

              {/* User Profile */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredSection('profile')}
              >
                <button className="w-full p-3 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 hover:from-primary-100 hover:to-primary-200/70 shadow-sm hover:shadow-md border border-primary-200/50 hover:border-primary-300/70 transition-all duration-300 cursor-pointer flex justify-center hover:scale-110 hover:-translate-y-0.5 group icon-3d">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center transition-all duration-300 drop-shadow-sm shadow-inner">
                      <span className="text-white font-semibold text-xs">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Pane - Inside the same container */}
        {isHovering && hoveredSection && (
          <div 
            className="absolute left-16 top-0 h-full w-64 bg-background-primary border-r border-gray-200 shadow-xl transform transition-all duration-300 ease-out"
            style={{
              opacity: isHovering && hoveredSection ? 1 : 0,
              transform: `translateX(${isHovering && hoveredSection ? '0' : '-20px'})`,
              transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Complaints Section */}
            {hoveredSection === 'complaints' && (
              <div className="p-6 h-full animate-fade-in">
                <div className="flex items-center space-x-3 mb-6 animate-slide-down">
                  <ExclamationTriangleIcon className="w-6 h-6 text-primary-500" />
                  <h2 className="text-lg font-semibold text-text-primary">Complaints</h2>
                </div>
                <div className="space-y-4 animate-slide-up-stagger">
                  <div className="p-4 bg-background-tertiary rounded-lg">
                    <h3 className="font-medium text-text-primary mb-2">Payment Issues</h3>
                    <p className="text-sm text-text-secondary">Report payment failures or disputes</p>
                  </div>
                  <div className="p-4 bg-background-tertiary rounded-lg">
                    <h3 className="font-medium text-text-primary mb-2">Service Quality</h3>
                    <p className="text-sm text-text-secondary">Issues with AI responses or service</p>
                  </div>
                  <div className="p-4 bg-background-tertiary rounded-lg">
                    <h3 className="font-medium text-text-primary mb-2">Technical Problems</h3>
                    <p className="text-sm text-text-secondary">App bugs or technical difficulties</p>
                  </div>
                  <div className="p-4 bg-background-tertiary rounded-lg">
                    <h3 className="font-medium text-text-primary mb-2">Other Issues</h3>
                    <p className="text-sm text-text-secondary">General complaints and feedback</p>
                  </div>
                </div>
              </div>
            )}

          {/* New Chat Section */}
          {hoveredSection === 'newchat' && (
            <div className="p-6 h-full animate-fade-in">
                              <div className="flex items-center space-x-3 mb-6 animate-slide-down">
                  <PlusIcon className="w-6 h-6 text-primary-500" />
                  <h2 className="text-lg font-semibold text-text-primary">Create New Chat</h2>
                </div>
              <div className="space-y-4 animate-slide-up-stagger">
                <button
                  onClick={handleNewChat}
                  disabled={isCreatingChat}
                  className="w-full p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-medium hover:shadow-large transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingChat ? 'Creating...' : hasEmptyChat() ? 'Go to Empty Chat' : 'New Chat'}
                </button>
                
                {showError && error && (
                  <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <InformationCircleIcon className="w-4 h-4 text-warning-600" />
                      <p className="text-sm text-warning-700">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat History Section */}
          {hoveredSection === 'chats' && (
            <div className="p-6 h-full flex flex-col animate-fade-in">
                              <div className="flex items-center space-x-3 mb-6 animate-slide-down">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-500" />
                  <h2 className="text-lg font-semibold text-text-primary">Chat History</h2>
                </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 animate-slide-up-stagger">
                {isLoadingChats ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-text-secondary">No chats yet</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first chat!</p>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleChatClick(chat)}
                      className={`p-3 rounded-lg hover:bg-background-tertiary transition-colors cursor-pointer group ${
                        chatId === chat.id ? 'bg-background-tertiary border border-primary-200' : ''
                      } ${isEmptyChat(chat) ? 'border-l-4 border-l-primary-500' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            chatId === chat.id ? 'text-text-accent' : isEmptyChat(chat) ? 'text-text-accent' : 'text-text-primary'
                          }`}>
                            {getChatTitle(chat)}
                          </p>
                          <p className="text-xs text-text-secondary mt-1">
                            {formatDate(chat.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteChat(e, chat.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-600"
                          title="Delete chat"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Help Section */}
          {hoveredSection === 'help' && (
            <div className="p-6 h-full animate-fade-in">
                              <div className="flex items-center space-x-3 mb-6 animate-slide-down">
                  <QuestionMarkCircleIcon className="w-6 h-6 text-primary-500" />
                  <h2 className="text-lg font-semibold text-text-primary">Help & Support</h2>
                </div>
              <div className="space-y-4 animate-slide-up-stagger">
                <div className="p-4 bg-background-tertiary rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">FAQ</h3>
                  <p className="text-sm text-text-secondary">Frequently asked questions</p>
                </div>
                <div className="p-4 bg-background-tertiary rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">Contact Support</h3>
                  <p className="text-sm text-text-secondary">Get help from our team</p>
                </div>
                <div className="p-4 bg-background-tertiary rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">Documentation</h3>
                  <p className="text-sm text-text-secondary">Learn how to use askVeda</p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {hoveredSection === 'settings' && (
            <div className="p-6 h-full animate-fade-in">
                              <div className="flex items-center space-x-3 mb-6 animate-slide-down">
                  <Cog6ToothIcon className="w-6 h-6 text-primary-500" />
                  <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
                </div>
              <div className="space-y-4 animate-slide-up-stagger">
                <div className="p-4 bg-background-tertiary rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">Preferences</h3>
                  <p className="text-sm text-text-secondary">Customize your experience</p>
                </div>
                <div className="p-4 bg-background-tertiary rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">Privacy</h3>
                  <p className="text-sm text-text-secondary">Manage your privacy settings</p>
                </div>
                <div className="p-4 bg-background-tertiary rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">Account</h3>
                  <p className="text-sm text-text-secondary">Account management</p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Section */}
          {hoveredSection === 'profile' && (
            <div className="p-6 h-full animate-fade-in">
                              <div className="flex items-center space-x-3 mb-6 animate-slide-down">
                  <UserIcon className="w-6 h-6 text-primary-500" />
                  <h2 className="text-lg font-semibold text-text-primary">Profile</h2>
                </div>
              
              <div className="space-y-4 animate-slide-up-stagger">
                <div className="p-4 bg-background-tertiary rounded-lg">
                  <h3 className="font-medium text-text-primary mb-1">{user?.username || 'User'}</h3>
                  <p className="text-sm text-text-secondary">{user?.mobile || 'No phone number'}</p>
                </div>
                
                <div className="space-y-2">
                  <button className="w-full p-3 text-left rounded-lg hover:bg-background-tertiary transition-colors">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-text-primary">Edit Profile</span>
                    </div>
                  </button>
                  
                  <button className="w-full p-3 text-left rounded-lg hover:bg-background-tertiary transition-colors">
                    <div className="flex items-center space-x-3">
                      <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-text-primary">Complaints</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full p-3 text-left rounded-lg hover:bg-danger-50 transition-colors text-danger-600 hover:text-danger-700"
                  >
                    <div className="flex items-center space-x-3">
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        )}
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

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
                    <Bars3Icon className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={handleNewChat}
                  disabled={isCreatingChat}
                  className="w-full h-10 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-medium hover:shadow-large transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={hasEmptyChat() ? "Navigate to existing empty chat" : "Create new chat"}
                >
                  {isCreatingChat ? 'Creating...' : hasEmptyChat() ? 'Go to Empty Chat' : 'New Chat'}
                </button>
                
                {/* Error message for mobile */}
                {showError && error && (
                  <div className="mt-2 p-2 bg-warning-50 border border-warning-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <InformationCircleIcon className="w-4 h-4 text-warning-600" />
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
                      <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
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