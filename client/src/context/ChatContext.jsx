import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useSocket } from './SocketContext'
import { useAuth } from './AuthContext'

const ChatContext = createContext()

const initialState = {
  messages: [],
  currentChat: null,
  chats: [],
  isLoading: false,
  isCreatingChat: false,
  isLoadingChats: false,
  error: null,
  typing: false
}

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload }
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChat: action.payload }
    case 'SET_CHATS':
      return { ...state, chats: action.payload }
    case 'ADD_CHAT':
      return { ...state, chats: [action.payload, ...state.chats] }
    case 'UPDATE_CHAT':
      return { 
        ...state, 
        chats: state.chats.map(chat => 
          chat.id === action.payload.id ? action.payload : chat
        )
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_CREATING_CHAT':
      return { ...state, isCreatingChat: action.payload }
    case 'SET_LOADING_CHATS':
      return { ...state, isLoadingChats: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_TYPING':
      return { ...state, typing: action.payload }
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] }
    default:
      return state
  }
}

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { onMessage, sendMessage: socketSendMessage } = useSocket()
  const { token, isAuthenticated } = useAuth()

  const addMessage = (message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message })
  }

  const setMessages = (messages) => {
    dispatch({ type: 'SET_MESSAGES', payload: messages })
  }

  const setCurrentChat = (chat) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chat })
  }

  const setChats = (chats) => {
    dispatch({ type: 'SET_CHATS', payload: chats })
  }

  const addChat = (chat) => {
    dispatch({ type: 'ADD_CHAT', payload: chat })
  }

  const updateChat = (chat) => {
    dispatch({ type: 'UPDATE_CHAT', payload: chat })
  }

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const setCreatingChat = (creating) => {
    dispatch({ type: 'SET_CREATING_CHAT', payload: creating })
  }

  const setLoadingChats = (loading) => {
    dispatch({ type: 'SET_LOADING_CHATS', payload: loading })
  }

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }

  const setTyping = (typing) => {
    dispatch({ type: 'SET_TYPING', payload: typing })
  }

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' })
  }, [])

  // Check if there's already an empty chat
  const hasEmptyChat = useCallback(() => {
    // Check if current chat has messages in local state
    if (state.messages.length > 0) {
      return false
    }
    
    // Check if any chat in the list is empty
    return state.chats.some(chat => 
      chat.messageCount === 0 || 
      !chat.lastMessage || 
      !chat.lastMessage.content
    )
  }, [state.messages.length, state.chats])

  // API Functions
  const fetchChats = useCallback(async () => {
    if (!isAuthenticated || !token) return

    try {
      setLoadingChats(true)
      const response = await fetch('http://localhost:5000/api/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setChats(data.chats)
      } else {
        setError('Failed to fetch chats')
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
      setError('Network error while fetching chats')
    } finally {
      setLoadingChats(false)
    }
  }, [isAuthenticated, token, setLoadingChats, setChats, setError])

  const createChat = useCallback(async (title = 'New Chat') => {
    if (!isAuthenticated || !token) return null

    // Check if there's already an empty chat
    if (hasEmptyChat()) {
      setError('You already have an empty chat. Please use that one first.')
      return null
    }

    try {
      setCreatingChat(true)
      const response = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      })

      if (response.ok) {
        const data = await response.json()
        addChat(data.chat)
        return data.chat
      } else {
        setError('Failed to create chat')
        return null
      }
    } catch (error) {
      console.error('Error creating chat:', error)
      setError('Network error while creating chat')
      return null
    } finally {
      setCreatingChat(false)
    }
  }, [isAuthenticated, token, hasEmptyChat, setCreatingChat, addChat, setError])

  const fetchMessages = useCallback(async (chatId) => {
    if (!isAuthenticated || !token || !chatId) {
      return
    }

    try {
      setLoading(true)
      // Clear existing messages first to prevent duplicates
      setMessages([])
      
      const response = await fetch(`http://localhost:5000/api/messages/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      } else {
        setError('Failed to fetch messages')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError('Network error while fetching messages')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token, setLoading, setMessages, setError])

  const sendMessage = useCallback(async (content, chatId) => {
    if (!isAuthenticated || !token || !chatId) {
      console.error('Cannot send message:', { isAuthenticated, hasToken: !!token, chatId })
      return
    }

    try {
      // Save user message to database
      const userMessageResponse = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          chatId,
          role: 'user'
        })
      })

      if (!userMessageResponse.ok) {
        console.error('Failed to save user message:', userMessageResponse.status)
        setError('Failed to send message')
        return
      }

      const userMessageData = await userMessageResponse.json()
      const userMessage = userMessageData.messageData

      // Add user message to local state
      addMessage(userMessage)

      // Update chat title if this is the first user message and chat title is still "New Chat"
      const currentChat = state.chats.find(chat => chat.id === chatId)
      if (currentChat && currentChat.title === 'New Chat') {
        const chatTitle = content.length > 30 ? content.substring(0, 30) + '...' : content
        const updateChatResponse = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: chatTitle
          })
        })

        if (updateChatResponse.ok) {
          // Refresh chats to get updated title
          fetchChats()
        }
      }

      // Simulate AI response (you can replace this with actual AI integration)
      setTimeout(async () => {
        const aiContent = `I received your message: "${content}". This is a simulated response. In a real implementation, this would be connected to an AI service.`
        
        // Save AI response to database
        const aiMessageResponse = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: aiContent,
            chatId,
            role: 'assistant'
          })
        })

        if (aiMessageResponse.ok) {
          const aiMessageData = await aiMessageResponse.json()
          const aiMessage = aiMessageData.messageData
          
          // Add AI response to local state
          addMessage(aiMessage)
        } else {
          console.error('Failed to save AI message:', aiMessageResponse.status)
          // Still add to local state even if database save fails
          const aiResponse = {
            id: (Date.now() + 1).toString(),
            content: aiContent,
            role: 'assistant',
            timestamp: new Date().toISOString(),
            chatId: chatId
          }
          addMessage(aiResponse)
        }
      }, 1000)

    } catch (error) {
      console.error('Error sending message:', error)
      setError('Network error while sending message')
    }
  }, [isAuthenticated, token, addMessage, setError, fetchChats, state.chats])

  // Load chats on component mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchChats()
    }
  }, [isAuthenticated, token])

  // Handle incoming socket messages
  useEffect(() => {
    if (onMessage) {
      const handleMessage = (message) => {
        // Only add messages that are not from the current user to prevent duplicates
        if (message.role !== 'user') {
          addMessage(message)
        }
      }
      onMessage(handleMessage)
    }
  }, [onMessage, addMessage])

  const value = {
    ...state,
    addMessage,
    setMessages,
    setCurrentChat,
    setChats,
    addChat,
    updateChat,
    setLoading,
    setCreatingChat,
    setLoadingChats,
    setError,
    setTyping,
    clearMessages,
    sendMessage,
    fetchChats,
    createChat,
    fetchMessages,
    hasEmptyChat
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 