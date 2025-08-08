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

async function testMessages() {
  try {
    console.log('🔍 Testing messages API...')
    
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
    
    // Get chats
    console.log('\n💬 Getting chats...')
    const chatsResponse = await makeRequest('http://localhost:5000/api/chats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Chats response:', chatsResponse)
    
    if (chatsResponse.status === 200 && chatsResponse.data.chats && chatsResponse.data.chats.length > 0) {
      const firstChat = chatsResponse.data.chats[0]
      console.log('\n📝 Testing messages for chat:', firstChat.id)
      
      // Get messages for first chat
      const messagesResponse = await makeRequest(`http://localhost:5000/api/messages/chat/${firstChat.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Messages response:', messagesResponse)
      
      if (messagesResponse.status === 200 && messagesResponse.data.messages) {
        console.log('\n📋 Message details:')
        messagesResponse.data.messages.forEach((msg, index) => {
          console.log(`Message ${index + 1}:`, {
            id: msg.id,
            content: msg.content,
            role: msg.role,
            timestamp: msg.timestamp,
            chatId: msg.chatId
          })
        })
      }
    } else {
      console.log('❌ No chats found')
    }
    
    console.log('\n✅ Messages test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testMessages()
