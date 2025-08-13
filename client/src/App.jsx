import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ChatInterface from './components/ChatInterface'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import AuthContainer from './components/AuthContainer'
import AdminDashboard from './components/AdminDashboard'
import { ChatProvider } from './context/ChatContext'
import { SocketProvider } from './context/SocketContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthProvider>
      <div className="h-screen bg-background-secondary">
        <SocketProvider>
          <ChatProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<AuthContainer />} />
              <Route path="/register" element={<AuthContainer />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <div className="flex h-full">
                    <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                    <div className="flex-1 flex flex-col">
                      <ChatInterface sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/chat/:chatId" element={
                <ProtectedRoute>
                  <div className="flex h-full">
                    <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                    <div className="flex-1 flex flex-col">
                      <ChatInterface sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Redirect to home for unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ChatProvider>
        </SocketProvider>
      </div>
    </AuthProvider>
  )
}

export default App 