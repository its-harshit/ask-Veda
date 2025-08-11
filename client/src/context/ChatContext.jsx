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
  typing: false,
  streamingMessageId: null,
  streamingContent: '',
  aiTyping: false
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
    case 'START_STREAMING':
      return { 
        ...state, 
        streamingMessageId: action.payload.messageId,
        streamingContent: ''
      }
    case 'UPDATE_STREAMING':
      return { 
        ...state, 
        streamingContent: action.payload.content
      }
    case 'STOP_STREAMING':
      return { 
        ...state, 
        streamingMessageId: null,
        streamingContent: ''
      }
    case 'SET_AI_TYPING':
      return { ...state, aiTyping: action.payload }
    case 'UPDATE_MESSAGE':
      console.log('Reducer: UPDATE_MESSAGE', { 
        messageId: action.payload.messageId, 
        updates: action.payload.updates,
        currentMessages: state.messages.length,
        messageIds: state.messages.map(m => m.id)
      })
      const updatedMessages = state.messages.map(msg =>
        msg.id === action.payload.messageId ? { ...msg, ...action.payload.updates } : msg
      )
      console.log('Reducer: Updated messages count:', updatedMessages.length)
      return {
        ...state,
        messages: updatedMessages
      }
    case 'REMOVE_DUPLICATES':
      const uniqueMessages = state.messages.filter((msg, index, self) => 
        index === self.findIndex(m => m.content === msg.content && m.role === msg.role)
      )
      console.log('Reducer: Removed duplicates, messages count:', uniqueMessages.length)
      return {
        ...state,
        messages: uniqueMessages
      }
    default:
      return state
  }
}

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { onMessage, sendMessage: socketSendMessage } = useSocket()
  const { token, isAuthenticated } = useAuth()

  const addMessage = (message) => {
    console.log('Adding message:', { messageId: message.id, role: message.role, isStreaming: message.isStreaming })
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

  const startStreaming = (messageId) => {
    dispatch({ type: 'START_STREAMING', payload: { messageId } })
  }

  const updateStreamingContent = (content) => {
    dispatch({ type: 'UPDATE_STREAMING', payload: { content } })
  }

  const stopStreaming = () => {
    dispatch({ type: 'STOP_STREAMING' })
  }

  const setAiTyping = (typing) => {
    dispatch({ type: 'SET_AI_TYPING', payload: typing })
  }

  const updateMessage = (messageId, updates) => {
    console.log('Updating message:', { messageId, updates, currentMessages: state.messages.length })
    dispatch({ type: 'UPDATE_MESSAGE', payload: { messageId, updates } })
  }

  const removeDuplicates = () => {
    console.log('Removing duplicate messages')
    dispatch({ type: 'REMOVE_DUPLICATES' })
  }

  // Helper function to generate realistic AI responses
  const generateAIResponse = (userMessage) => {
    const responses = [
      `I understand you're asking about "${userMessage}". Let me provide you with a comprehensive answer. This is a simulated response that demonstrates the streaming functionality. The text appears character by character to create a more engaging user experience.`,
      
      `Great question! "${userMessage}" is an interesting topic. Here's what I can tell you: This streaming response shows how modern AI chat interfaces work, with text appearing gradually rather than all at once. It makes the conversation feel more natural and interactive.`,
      
      `Thanks for your message: "${userMessage}". I'm here to help! This is a demonstration of streaming output where the response appears progressively. In a real implementation, this would be connected to an AI service like OpenAI's GPT or similar models.`,
      
      `I received your query about "${userMessage}". Let me break this down for you: Streaming responses provide a better user experience by showing content as it's generated. This creates anticipation and makes the interaction feel more dynamic and responsive.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Function to handle real AI streaming (can be connected to OpenAI, Anthropic, etc.)
  const streamAIResponse = async (userMessage, streamingMessageId, updateContent) => {
    try {
      console.log('Starting real AI streaming for message:', userMessage)
      
      // Use the real AI streaming endpoint
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          chatId: chatId
        })
      })

      console.log('AI streaming response status:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`AI streaming error: ${response.status} ${response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              console.log('AI streaming completed')
              return fullContent
            }
            
            try {
              const parsed = JSON.parse(data)
              console.log('Received streaming data:', parsed)
              if (parsed.content) {
                fullContent += parsed.content
                updateContent(fullContent)
                console.log('Updated content:', fullContent)
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e)
            }
          }
        }
      }
      
      return fullContent
    } catch (error) {
      console.error('Error in AI streaming:', error)
      
      // Fallback to simulated response if real AI fails
      console.log('Falling back to simulated response')
      const aiContent = generateAIResponse(userMessage)
      
      // Simulate streaming by adding characters one by one
      let currentContent = ''
      for (let i = 0; i < aiContent.length; i++) {
        currentContent += aiContent[i]
        updateContent(currentContent)
        
        // Much faster streaming speeds
        let delay = 5 // Base delay (reduced from 30)
        if (aiContent[i] === ' ') {
          delay = 2 // Very fast for spaces (reduced from 10)
        } else if (aiContent[i] === '.' || aiContent[i] === '!' || aiContent[i] === '?') {
          delay = 15 // Short pause at punctuation (reduced from 100)
        } else if (aiContent[i] === ',') {
          delay = 8 // Quick pause for commas (reduced from 50)
        } else {
          delay = 3 + Math.random() * 4 // Fast random delay for regular characters (reduced from 30-50)
        }
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      
      return aiContent
    }
  }

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
      
      // Preserve any streaming messages before clearing
      const streamingMessages = state.messages.filter(msg => msg.isStreaming)
      
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
        // Combine database messages with any streaming messages
        const allMessages = [...data.messages, ...streamingMessages]
        setMessages(allMessages)
      } else {
        setError('Failed to fetch messages')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError('Network error while fetching messages')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token, setLoading, setMessages, setError, state.messages])

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

      // Show AI typing indicator
      setAiTyping(true)
      
      // Wait a bit to show typing indicator
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
      
      // Hide typing indicator and start streaming
      setAiTyping(false)
      
      // Create a temporary AI message for streaming
      const streamingMessageId = `streaming-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const tempAiMessage = {
        id: streamingMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        chatId: chatId,
        isStreaming: true
      }

      // Add temporary AI message to local state
      addMessage(tempAiMessage)
      startStreaming(streamingMessageId)

      // Simulate streaming AI response
      const aiContent = await streamAIResponse(content, streamingMessageId, updateStreamingContent)
      
      // Stop streaming and save final message to database
      stopStreaming()
      
      // Always update the streaming message with final content
      // This ensures we don't create duplicate messages
      updateMessage(streamingMessageId, { content: aiContent, isStreaming: false })
      
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
        
        // Update the existing message with database information
        console.log('Updating with final message from database:', { streamingMessageId, aiMessage })
        updateMessage(streamingMessageId, { ...aiMessage, isStreaming: false })
      } else {
        console.error('Failed to save AI message:', aiMessageResponse.status)
        // Message is already updated with content, just ensure it's marked as not streaming
        console.log('Database save failed, keeping local message:', { streamingMessageId, aiContent })
      }

      // Remove any duplicate messages that might have been created
      setTimeout(() => removeDuplicates(), 100)

    } catch (error) {
      console.error('Error sending message:', error)
      setError('Network error while sending message')
      stopStreaming()
    }
  }, [isAuthenticated, token, addMessage, setError, fetchChats, state.chats, startStreaming, updateStreamingContent, stopStreaming, dispatch, state.messages, streamAIResponse])

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
        // Only add messages that are not from the current user and not already in our state
        if (message.role !== 'user' && !state.messages.some(msg => msg.id === message.id)) {
          console.log('Adding socket message:', { messageId: message.id, role: message.role })
          addMessage(message)
        }
      }
      onMessage(handleMessage)
    }
  }, [onMessage, addMessage, state.messages])

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
    hasEmptyChat,
    startStreaming,
    updateStreamingContent,
    stopStreaming,
    setAiTyping,
    updateMessage,
    removeDuplicates,
    streamAIResponse
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