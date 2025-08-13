import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { EXPRESS_API_CONFIG } from '../../config/api'

const AdminExports = () => {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [exportType, setExportType] = useState('chat')
  const [exportId, setExportId] = useState('')
  const [exportFormat, setExportFormat] = useState('json')

  const handleExport = async () => {
    if (!exportId.trim()) {
      setError('Please enter a valid ID')
      return
    }

    console.log('Exporting:', {
      type: exportType,
      id: exportId,
      format: exportFormat
    })

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      let url
      if (exportType === 'chat') {
        url = `${EXPRESS_API_CONFIG.BASE_URL}${EXPRESS_API_CONFIG.ENDPOINTS.ADMIN}/export/chat/${exportId}?format=${exportFormat}`
      } else {
        url = `${EXPRESS_API_CONFIG.BASE_URL}${EXPRESS_API_CONFIG.ENDPOINTS.ADMIN}/export/session/${exportId}?format=${exportFormat}`
      }
      
      console.log('Export URL:', url)

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Export error response:', errorData)
        throw new Error(errorData.error || `Export failed with status: ${response.status}`)
      }

      // Get filename from response headers or generate one
      const contentDisposition = response.headers.get('content-disposition')
      console.log('Content-Disposition header:', contentDisposition)
      
      let filename = `export.${exportFormat}`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
          console.log('Extracted filename from header:', filename)
        } else {
          console.log('No filename found in Content-Disposition header')
        }
      } else {
        console.log('No Content-Disposition header found')
      }
      
      // For chat exports, use the chat ID as filename if not extracted from header
      if (exportType === 'chat' && filename === `export.${exportFormat}`) {
        filename = `${exportId}.${exportFormat}`
        console.log('Using chat ID as filename:', filename)
      }
      // For session exports, use the session ID as filename if not extracted from header
      else if (exportType === 'session' && filename === `export.${exportFormat}`) {
        filename = `${exportId}.${exportFormat}`
        console.log('Using session ID as filename:', filename)
      }
      
      // Ensure correct file extension based on format
      if (exportFormat === 'csv' && !filename.endsWith('.csv')) {
        filename = filename.replace(/\.json$/, '.csv')
      } else if (exportFormat === 'json' && !filename.endsWith('.json')) {
        filename = filename.replace(/\.csv$/, '.json')
      }
      
      console.log('Final filename for download:', filename, 'Format:', exportFormat)

      // Download the file
      const blob = await response.blob()
      const url2 = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url2
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url2)
      document.body.removeChild(a)

      setSuccess(`Export completed successfully! File: ${filename}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Export Data</h2>
        
        <div className="space-y-4">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="chat"
                  checked={exportType === 'chat'}
                  onChange={(e) => setExportType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Chat Export</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="session"
                  checked={exportType === 'session'}
                  onChange={(e) => setExportType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Session Export</span>
              </label>
            </div>
          </div>

          {/* Export ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {exportType === 'chat' ? 'Chat ID' : 'Session ID'}
            </label>
            <input
              type="text"
              value={exportId}
              onChange={(e) => setExportId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter ${exportType === 'chat' ? 'chat' : 'session'} ID...`}
            />
            <p className="mt-1 text-sm text-gray-500">
              {exportType === 'chat' 
                ? 'Enter the chat ID to export all messages from that specific chat'
                : 'Enter the session ID to export all chats and messages from that session'
              }
            </p>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          {/* Export Button */}
          <div className="pt-4">
            <button
              onClick={handleExport}
              disabled={isLoading || !exportId.trim()}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export {exportType === 'chat' ? 'Chat' : 'Session'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chat Export Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-900">Chat Export</h3>
              <p className="mt-1 text-sm text-blue-700">
                Export all messages from a specific chat. You'll need the chat ID from the chats list.
              </p>
            </div>
          </div>
        </div>

        {/* Session Export Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-green-900">Session Export</h3>
              <p className="mt-1 text-sm text-green-700">
                Export all chats and messages from a specific session. You'll need the session ID from the chats list.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Export Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearMessages}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Export Successful</h3>
              <div className="mt-2 text-sm text-green-700">{success}</div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearMessages}
                className="inline-flex text-green-400 hover:text-green-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminExports
