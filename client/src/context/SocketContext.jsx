import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const { chatId } = useParams()

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    newSocket.on('message', (data) => {
      console.log('Received message:', data)
      // You can add a callback here to handle received messages
      // For now, we'll let the ChatContext handle message addition
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Join chat when chatId changes
  useEffect(() => {
    if (socket && isConnected && chatId) {
      console.log('Joining chat:', chatId)
      socket.emit('join-chat', chatId)
    }
  }, [socket, isConnected, chatId])

  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.emit('message', message)
    }
  }

  const joinChat = (chatId) => {
    if (socket && isConnected) {
      socket.emit('join-chat', chatId)
    }
  }

  const leaveChat = (chatId) => {
    if (socket && isConnected) {
      socket.emit('leave-chat', chatId)
    }
  }

  const onMessage = (callback) => {
    if (socket) {
      socket.on('message', callback)
    }
  }

  const value = {
    socket,
    isConnected,
    sendMessage,
    joinChat,
    leaveChat,
    onMessage
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
} 