import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSocket } from './SocketContext'

const ChatContext = createContext()

const initialState = {
  messages: [],
  currentChat: null,
  chats: [],
  isLoading: false,
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
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
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
  const { chatId } = useParams()
  const { onMessage } = useSocket()

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

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }

  const setTyping = (typing) => {
    dispatch({ type: 'SET_TYPING', payload: typing })
  }

  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' })
  }

  // Listen for incoming messages from socket
  useEffect(() => {
    onMessage((data) => {
      // Only add message if it's not from the current user
      if (data.role !== 'user') {
        addMessage({
          id: data.id,
          content: data.content,
          role: data.role,
          timestamp: data.timestamp,
          chatId: data.chatId
        })
      }
    })
  }, [onMessage])

  const value = {
    ...state,
    addMessage,
    setMessages,
    setCurrentChat,
    setChats,
    addChat,
    setLoading,
    setError,
    setTyping,
    clearMessages
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