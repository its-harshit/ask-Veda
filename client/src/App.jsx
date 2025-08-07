import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import ChatInterface from './components/ChatInterface'
import Sidebar from './components/Sidebar'
import { ChatProvider } from './context/ChatContext'
import { SocketProvider } from './context/SocketContext'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50">
      <SocketProvider>
        <ChatProvider>
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          <div className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<ChatInterface sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
              <Route path="/chat/:chatId" element={<ChatInterface sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
            </Routes>
          </div>
        </ChatProvider>
      </SocketProvider>
    </div>
  )
}

export default App 