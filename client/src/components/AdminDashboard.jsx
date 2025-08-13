import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { EXPRESS_API_CONFIG } from '../config/api'
import AdminStats from './admin/AdminStats'
import AdminChats from './admin/AdminChats'
import AdminMessages from './admin/AdminMessages'
import AdminUsers from './admin/AdminUsers'
import AdminExports from './admin/AdminExports'

const AdminDashboard = () => {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('stats')
  const [isLoading, setIsLoading] = useState(false)

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: '📊' },
    { id: 'chats', label: 'Chats', icon: '💬' },
    { id: 'messages', label: 'Messages', icon: '📝' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'exports', label: 'Exports', icon: '📤' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStats />
      case 'chats':
        return <AdminChats />
      case 'messages':
        return <AdminMessages />
      case 'users':
        return <AdminUsers />
      case 'exports':
        return <AdminExports />
      default:
        return <AdminStats />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage chats, messages, users and export data
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
