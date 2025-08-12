import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { format } from 'date-fns'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { useChat } from '../context/ChatContext'

const Message = ({ message }) => {
  const isUser = message.role === 'user'
  const { streamingMessageId, streamingContent } = useChat()
  const [copiedCode, setCopiedCode] = useState(null)
  
  // Use streaming content if this message is currently streaming
  const displayContent = message.isStreaming && streamingMessageId === message.id 
    ? streamingContent 
    : message.content

  // Function to copy code to clipboard
  const copyToClipboard = async (code, language) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(language)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  // Function to detect and format JSON
  const formatJSON = (content) => {
    try {
      const parsed = JSON.parse(content)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return content
    }
  }

  // Function to detect and format CSV
  const formatCSV = (content) => {
    const lines = content.trim().split('\n')
    if (lines.length < 2) return content
    
    const headers = lines[0].split(',')
    const rows = lines.slice(1).map(line => line.split(','))
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b border-gray-300">
                  {header.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Function to detect content type and format accordingly
  const detectAndFormatContent = (content) => {
    // Check if it's JSON
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      try {
        JSON.parse(content)
        return { type: 'json', content: formatJSON(content) }
      } catch {}
    }
    
    // Check if it's CSV
    if (content.includes(',') && content.split('\n').length > 1) {
      const lines = content.trim().split('\n')
      if (lines.every(line => line.includes(','))) {
        return { type: 'csv', content }
      }
    }
    
    // Check if it's a table (markdown table)
    if (content.includes('|') && content.includes('\n')) {
      const lines = content.trim().split('\n')
      if (lines.some(line => line.includes('|'))) {
        return { type: 'markdown', content }
      }
    }
    
    return { type: 'markdown', content }
  }

  const { type, content } = detectAndFormatContent(displayContent)

  const components = {
    // Enhanced code block with copy functionality
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : 'text'
      const code = String(children).replace(/\n$/, '')
      
      if (!inline && match) {
        return (
          <div className="relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => copyToClipboard(code, language)}
                className="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                {copiedCode === language ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <SyntaxHighlighter
              style={tomorrow}
              language={language}
              PreTag="div"
              className="rounded-lg"
              customStyle={{
                margin: 0,
                padding: '1rem',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        )
      }
      
      return (
        <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono" {...props}>
          {children}
        </code>
      )
    },
    
    // Enhanced table styling
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
          {children}
        </table>
      </div>
    ),
    
    thead: ({ children }) => (
      <thead className="bg-gray-50">
        {children}
      </thead>
    ),
    
    tbody: ({ children }) => (
      <tbody className="divide-y divide-gray-200">
        {children}
      </tbody>
    ),
    
    tr: ({ children, ...props }) => (
      <tr className="hover:bg-gray-50 transition-colors" {...props}>
        {children}
      </tr>
    ),
    
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">
        {children}
      </th>
    ),
    
    td: ({ children }) => (
      <td className="px-4 py-3 text-sm text-gray-900">
        {children}
      </td>
    ),
    
    // Enhanced list styling
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 my-2">
        {children}
      </ul>
    ),
    
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1 my-2">
        {children}
      </ol>
    ),
    
    li: ({ children }) => (
      <li className="text-gray-800">
        {children}
      </li>
    ),
    
    // Enhanced blockquote styling
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 bg-blue-50 py-2 rounded-r my-4">
        {children}
      </blockquote>
    ),
    
    // Enhanced paragraph styling
    p: ({ children }) => (
      <p className="my-2 leading-relaxed">
        {children}
      </p>
    ),
    
    // Enhanced heading styling
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-gray-900 my-4">
        {children}
      </h1>
    ),
    
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-gray-900 my-3">
        {children}
      </h2>
    ),
    
    h3: ({ children }) => (
      <h3 className="text-lg font-medium text-gray-900 my-2">
        {children}
      </h3>
    ),
    
    // Enhanced link styling
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {children}
      </a>
    ),
    
    // Enhanced image styling
    img: ({ src, alt }) => (
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full h-auto rounded-lg shadow-sm my-4"
      />
    ),
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex-1 max-w-5xl ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block rounded-2xl px-4 py-3 max-w-full ${
          isUser 
            ? 'bg-gray-100 text-gray-800' 
            : 'bg-white text-text-primary'
        }`}>
          {isUser ? (
            <span className="text-gray-800 break-words">{displayContent}</span>
          ) : (
            <div className="max-w-none">
              {type === 'csv' ? (
                formatCSV(content)
              ) : (
                <ReactMarkdown 
                  components={components}
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeRaw, rehypeSanitize]}
                >
                  {content}
                </ReactMarkdown>
              )}
              {message.isStreaming && streamingMessageId === message.id && (
                <span className="inline-block w-2 h-4 bg-primary-500 ml-1 streaming-cursor"></span>
              )}
            </div>
          )}
        </div>
        
        <div className={`text-xs text-text-secondary mt-2 ${isUser ? 'text-right' : ''}`}>
          {message.timestamp && format(new Date(message.timestamp), 'HH:mm')}
        </div>
      </div>
    </div>
  )
}

export default Message 