import React from 'react'
import { Menu, Plus, Wifi, WifiOff } from 'lucide-react'

const ChatHeader = ({ sidebarOpen, setSidebarOpen, isConnected }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">C</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">ChatUI</h1>
            <p className="text-sm text-gray-500">AI Assistant</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span>Disconnected</span>
            </>
          )}
        </div>
        
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Plus className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader 