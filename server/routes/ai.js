const express = require('express')
const router = express.Router()

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

// Streaming AI response endpoint
router.post('/stream', authenticateToken, async (req, res) => {
  const { message, chatId } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  // Set headers for streaming
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    // Check if custom AI configuration is available
    const customAiUrl = process.env.CUSTOM_AI_URL
    const customAiModel = process.env.CUSTOM_AI_MODEL
    const customAiApiKey = process.env.CUSTOM_AI_API_KEY

    console.log('Environment variables check:', {
      customAiUrl: customAiUrl ? 'SET' : 'NOT SET',
      customAiModel: customAiModel ? 'SET' : 'NOT SET',
      customAiApiKey: customAiApiKey ? 'SET' : 'NOT SET'
    })

    if (customAiUrl && customAiModel) {
      console.log('Using custom AI model:', { url: customAiUrl, model: customAiModel })
      
      // Prepare headers for your custom model
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add API key if provided
      if (customAiApiKey) {
        headers['Authorization'] = `Bearer ${customAiApiKey}`
      }

      // Prepare the request body for your model
      // Adjust this format based on your model's API requirements
      const requestBody = {
        model: customAiModel,
        messages: [
          { role: 'user', content: message }
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7
      }

      console.log('Sending request to custom AI:', { url: customAiUrl, body: requestBody })

      const response = await fetch(customAiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Custom AI API error: ${response.status} ${response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              res.write('data: [DONE]\n\n')
              return res.end()
            }

            try {
              const parsed = JSON.parse(data)
              // Adjust this based on your model's response format
              const content = parsed.choices?.[0]?.delta?.content || 
                             parsed.content || 
                             parsed.text ||
                             parsed.response
              
              if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`)
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e)
            }
          }
        }
      }
    } else {
      // Fallback to simulated response if custom AI not configured
      console.log('Custom AI not configured, using simulated response')
      const simulatedResponse = `I received your message: "${message}". This is a simulated streaming response from the server. In a real implementation, this would be connected to an AI service like OpenAI's GPT.`
    
          // Simulate streaming by sending characters one by one
      for (let i = 0; i < simulatedResponse.length; i++) {
        const char = simulatedResponse[i]
        
        // Much faster streaming speeds
        let delay = 5 // Base delay (reduced from 30)
        if (char === ' ') {
          delay = 2 // Very fast for spaces (reduced from 10)
        } else if (char === '.' || char === '!' || char === '?') {
          delay = 15 // Short pause at punctuation (reduced from 100)
        } else if (char === ',') {
          delay = 8 // Quick pause for commas (reduced from 50)
        } else {
          delay = 3 + Math.random() * 4 // Fast random delay for regular characters (reduced from 30-50)
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

// Non-streaming AI response endpoint
router.post('/chat', authenticateToken, async (req, res) => {
  const { message, chatId } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  try {
    // Check if custom AI configuration is available
    const customAiUrl = process.env.CUSTOM_AI_URL
    const customAiModel = process.env.CUSTOM_AI_MODEL
    const customAiApiKey = process.env.CUSTOM_AI_API_KEY

    console.log('Environment variables check:', {
      customAiUrl: customAiUrl ? 'SET' : 'NOT SET',
      customAiModel: customAiModel ? 'SET' : 'NOT SET',
      customAiApiKey: customAiApiKey ? 'SET' : 'NOT SET'
    })

    if (customAiUrl && customAiModel) {
      console.log('Using custom AI model for non-streaming:', { url: customAiUrl, model: customAiModel })
      
      // Prepare headers for your custom model
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add API key if provided
      if (customAiApiKey) {
        headers['Authorization'] = `Bearer ${customAiApiKey}`
      }

      // Prepare the request body for your model (non-streaming)
      const requestBody = {
        model: customAiModel,
        messages: [
          { role: 'user', content: message }
        ],
        stream: false,
        max_tokens: 1000,
        temperature: 0.7
      }

      const response = await fetch(customAiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Custom AI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Adjust this based on your model's response format
      const aiResponse = data.choices?.[0]?.message?.content || 
                        data.content || 
                        data.text ||
                        data.response ||
                        'No response from AI model'

      res.json({
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString()
      })
    } else {
      // Fallback to simulated response
      const response = `I received your message: "${message}". This is a simulated response. In a real implementation, this would be connected to an AI service.`
      
      res.json({
        success: true,
        response: response,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Error in AI chat:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
