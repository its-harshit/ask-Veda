import React from 'react'
import { User, Bot, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { format } from 'date-fns'

const Message = ({ message }) => {
  const [copied, setCopied] = React.useState(false)
  const isUser = message.role === 'user'

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <div className="relative">
          <SyntaxHighlighter
            style={tomorrow}
            language={match[1]}
            PreTag="div"
            className="rounded-lg"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
          <button
            onClick={() => copyToClipboard(String(children))}
            className="absolute top-2 right-2 p-1 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      )
    },
    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="text-gray-700">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-600 mb-4">
        {children}
      </blockquote>
    ),
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start space-x-3 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-primary-500' : 'bg-gray-200'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-gray-600" />
          )}
        </div>
        
        <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
          <div className={`inline-block rounded-2xl px-4 py-3 max-w-full ${
            isUser 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            {isUser ? (
              <span className="text-white break-words">{message.content}</span>
            ) : (
              <ReactMarkdown components={components} className="prose prose-sm max-w-none">
                {message.content}
              </ReactMarkdown>
            )}
          </div>
          
          <div className={`text-xs text-gray-500 mt-2 ${isUser ? 'text-right' : ''}`}>
            {message.timestamp && format(new Date(message.timestamp), 'HH:mm')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Message 