import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { EXPRESS_API_CONFIG } from '../../config/api'

const AdminStats = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${EXPRESS_API_CONFIG.BASE_URL}${EXPRESS_API_CONFIG.ENDPOINTS.ADMIN}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading statistics</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
      description: 'Registered users'
    },
    {
      title: 'Total Chats',
      value: stats.totalChats,
      icon: '💬',
      color: 'bg-green-500',
      description: 'Active conversations'
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: '📝',
      color: 'bg-purple-500',
      description: 'All messages sent'
    },
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: '🔄',
      color: 'bg-yellow-500',
      description: 'Unique chat sessions'
    }
  ]

  const recentActivityCards = [
    {
      title: 'New Users (7 days)',
      value: stats.recentActivity.users,
      icon: '👤',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'New Chats (7 days)',
      value: stats.recentActivity.chats,
      icon: '💬',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'New Messages (7 days)',
      value: stats.recentActivity.messages,
      icon: '📝',
      color: 'bg-purple-100 text-purple-800'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${stat.color} text-white`}>
                      <span className="text-lg">{stat.icon}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity (Last 7 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentActivityCards.map((stat, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchStats}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Stats
        </button>
      </div>
    </div>
  )
}

export default AdminStats
