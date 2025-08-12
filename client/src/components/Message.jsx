import React from 'react'
import ReactMarkdown from 'react-markdown'
import { format } from 'date-fns'
import { useChat } from '../context/ChatContext'

const Message = ({ message }) => {
  const isUser = message.role === 'user'
  const { streamingMessageId, streamingContent } = useChat()
  
  // Use streaming content if this message is currently streaming
  const displayContent = message.isStreaming && streamingMessageId === message.id 
    ? streamingContent 
    : message.content

  const components = {
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code className="bg-gray-100 rounded px-1 py-0.5" {...props}>
          {children}
        </code>
      )
    },
    p: ({ children }) => <p className="m-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside m-0">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside m-0">{children}</ol>,
    li: ({ children }) => <li className="m-0">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 m-0">
        {children}
      </blockquote>
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
              <ReactMarkdown components={components}>
                {displayContent}
              </ReactMarkdown>
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