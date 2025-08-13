const express = require('express')
const fetch = require('node-fetch')
const router = express.Router()
const Chat = require('../models/Chat')

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  // Here you would verify the JWT token
  // For now, we'll just check if it exists
  if (!token || token === 'invalid') {
    return res.status(403).json({ error: 'Invalid token' })
  }

  next()
}

// Helper function to generate session ID
const generateSessionId = () => {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Streaming AI response endpoint with FastAPI proxy
router.post('/stream', authenticateToken, async (req, res) => {
  const { message, chatId, imageData } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  // Set headers for streaming
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    // Try FastAPI endpoint first if configured
    const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8004'
    
    // Get session ID from the chat for conversation isolation
    let sessionId
    if (chatId) {
      const chat = await Chat.findById(chatId)
      sessionId = chat?.sessionId || generateSessionId()
      console.log('Using chat-specific session ID for AI:', sessionId)
    } else {
      sessionId = generateSessionId()
      console.log('No chatId provided, using generated session ID:', sessionId)
    }

    try {
      console.log('Attempting FastAPI proxy to:', `${fastApiUrl}/stream`)
      
      const fastApiResponse = await fetch(`${fastApiUrl}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          query: JSON.stringify({
            text: message,
            image_base64: imageData || ""
          })
        }),
      })

      if (fastApiResponse.ok && fastApiResponse.body) {
        console.log('FastAPI proxy successful, streaming response...')
        
        // Proxy the streaming response
        const reader = fastApiResponse.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          const chunk = decoder.decode(value)
          res.write(chunk)
        }

        res.end()
        return
      } else {
        throw new Error(`FastAPI responded with status: ${fastApiResponse.status}`)
      }

    } catch (fastApiError) {
      console.warn('FastAPI proxy failed, using fallback:', fastApiError.message)
      
      // Fallback to simulated response
      const simulatedResponse = `I received your message: "${message}". This is a simulated streaming response from the server. FastAPI is currently unavailable, so I'm using the fallback response system.`
    
      // Simulate streaming by sending characters one by one
      for (let i = 0; i < simulatedResponse.length; i++) {
        const char = simulatedResponse[i]
        
        // Fast streaming speeds
        let delay = 5 // Base delay
        if (char === ' ') {
          delay = 2 // Very fast for spaces
        } else if (char === '.' || char === '!' || char === '?') {
          delay = 15 // Short pause at punctuation
        } else if (char === ',') {
          delay = 8 // Quick pause for commas
        } else {
          delay = 3 + Math.random() * 4 // Fast random delay for regular characters
        }

        await new Promise(resolve => setTimeout(resolve, delay))
        
        res.write(`data: ${JSON.stringify({ content: char })}\n\n`)
      }

      res.write('data: [DONE]\n\n')
      res.end()
    }

  } catch (error) {
    console.error('Error in AI streaming:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Non-streaming AI response endpoint with FastAPI proxy
router.post('/chat', authenticateToken, async (req, res) => {
  const { message, chatId, imageData } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  try {
    // Try FastAPI endpoint first if configured
    const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8004'
    
    // Get session ID from the chat for conversation isolation
    let sessionId
    if (chatId) {
      const chat = await Chat.findById(chatId)
      sessionId = chat?.sessionId || generateSessionId()
      console.log('Using chat-specific session ID for AI:', sessionId)
    } else {
      sessionId = generateSessionId()
      console.log('No chatId provided, using generated session ID:', sessionId)
    }

    try {
      console.log('Attempting FastAPI proxy to:', `${fastApiUrl}/stream`)
      
      const fastApiResponse = await fetch(`${fastApiUrl}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          query: JSON.stringify({
            text: message,
            image_base64: imageData || ""
          })
        }),
      })

      if (fastApiResponse.ok) {
        // For non-streaming, we collect all the response
        let fullResponse = ''
        
        if (fastApiResponse.body) {
          const reader = fastApiResponse.body.getReader()
          const decoder = new TextDecoder()

          while (true) {
            const { done, value } = await reader.read()
            
            if (done) break
            
            const chunk = decoder.decode(value)
            fullResponse += chunk
          }
        } else {
          const responseText = await fastApiResponse.text()
          fullResponse = responseText
        }

        console.log('FastAPI proxy successful')
        res.json({
          success: true,
          response: fullResponse,
          timestamp: new Date().toISOString(),
          source: 'fastapi'
        })
        return

      } else {
        throw new Error(`FastAPI responded with status: ${fastApiResponse.status}`)
      }

    } catch (fastApiError) {
      console.warn('FastAPI proxy failed, using fallback:', fastApiError.message)
      
      // Fallback to simulated response
      const response = `I received your message: "${message}". This is a simulated response. FastAPI is currently unavailable, so I'm using the fallback response system.`
      
      res.json({
        success: true,
        response: response,
        timestamp: new Date().toISOString(),
        source: 'fallback'
      })
    }

  } catch (error) {
    console.error('Error in AI chat:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
