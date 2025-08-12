import React from 'react'
import { Bars3Icon, PlusIcon, SignalIcon, SignalSlashIcon } from '@heroicons/react/24/outline'

const ChatHeader = ({ sidebarOpen, setSidebarOpen, isConnected }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-background-primary">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
        >
          <Bars3Icon className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">C</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">askVeda</h1>
            <p className="text-sm text-text-secondary">AI Assistant</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-sm text-text-secondary">
          {isConnected ? (
            <>
              <SignalIcon className="w-4 h-4 text-success-500" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <SignalSlashIcon className="w-4 h-4 text-danger-500" />
              <span>Disconnected</span>
            </>
          )}
        </div>
        
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <PlusIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader 