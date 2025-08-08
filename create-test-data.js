const https = require('https')
const http = require('http')

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const isHttps = urlObj.protocol === 'https:'
    const client = isHttps ? https : http
    
    const req = client.request(urlObj, options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({ status: res.statusCode, data: jsonData })
        } catch (error) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    if (options.body) {
      req.write(options.body)
    }
    req.end()
  })
}

async function createTestData() {
  try {
    console.log('🔍 Creating test data...')
    
    // First login to get token
    console.log('\n🔑 Logging in...')
    const loginResponse = await makeRequest('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobile: '1234567891',
        password: 'password123'
      })
    })
    
    console.log('Login response:', loginResponse)
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed')
      return
    }
    
    const token = loginResponse.data.token
    
    // Create a test chat
    console.log('\n💬 Creating test chat...')
    const createChatResponse = await makeRequest('http://localhost:5000/api/chats', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Chat'
      })
    })
    
    console.log('Create chat response:', createChatResponse)
    
    if (createChatResponse.status === 201) {
      const chatId = createChatResponse.data.chat.id
      console.log('✅ Chat created with ID:', chatId)
      
      // Add some test messages
      console.log('\n📝 Adding test messages...')
      
      const messages = [
        { content: 'Hello! This is a test message.', role: 'user' },
        { content: 'Hi there! I received your test message. This is a simulated AI response.', role: 'assistant' },
        { content: 'How are you doing today?', role: 'user' },
        { content: 'I\'m doing well, thank you for asking! How can I help you today?', role: 'assistant' }
      ]
      
      for (const message of messages) {
        const messageResponse = await makeRequest('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: message.content,
            role: message.role,
            chatId: chatId
          })
        })
        
        console.log(`Message "${message.content.substring(0, 20)}..." response:`, messageResponse.status)
      }
      
      // Get the chat again to see the updated data
      console.log('\n📋 Getting updated chat...')
      const getChatResponse = await makeRequest(`http://localhost:5000/api/chats/${chatId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Updated chat response:', getChatResponse)
      
      // Get messages for the chat
      console.log('\n📝 Getting messages...')
      const messagesResponse = await makeRequest(`http://localhost:5000/api/messages/chat/${chatId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Messages response:', messagesResponse)
      
    } else {
      console.log('❌ Failed to create chat')
    }
    
    console.log('\n✅ Test data creation completed!')
    console.log('\n📋 Now you can:')
    console.log('1. Open http://localhost:3000 in your browser')
    console.log('2. Login with mobile: 1234567891, password: password123')
    console.log('3. You should see the "Test Chat" in the sidebar')
    console.log('4. Click on it to see the messages')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

createTestData()
