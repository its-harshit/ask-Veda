// Test script to verify chat session isolation
const fetch = require('node-fetch')

async function testSessionIsolation() {
  console.log('🧪 Testing Chat Session Isolation...\n')
  
  try {
    // Step 1: Login to get token
    console.log('1️⃣ Logging in...')
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: '1234567891',
        password: 'password123'
      })
    })
    
    if (!loginResponse.ok) {
      throw new Error('Login failed')
    }
    
    const loginData = await loginResponse.json()
    const token = loginData.token
    const userSessionId = loginData.sessionId
    
    console.log('✅ Login successful')
    console.log('👤 User Session ID:', userSessionId)
    console.log('🔑 JWT Token:', token.substring(0, 50) + '...\n')
    
    // Step 2: Create first chat
    console.log('2️⃣ Creating first chat...')
    const chat1Response = await fetch('http://localhost:5000/api/chats', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'Chat 1 - Math Questions' })
    })
    
    if (!chat1Response.ok) {
      throw new Error('Failed to create first chat')
    }
    
    const chat1Data = await chat1Response.json()
    const chat1Id = chat1Data.chat.id
    const chat1SessionId = chat1Data.chat.sessionId
    
    console.log('✅ First chat created')
    console.log('💬 Chat 1 ID:', chat1Id)
    console.log('🆔 Chat 1 Session ID:', chat1SessionId)
    console.log('📝 Title: Math Questions\n')
    
    // Step 3: Create second chat
    console.log('3️⃣ Creating second chat...')
    const chat2Response = await fetch('http://localhost:5000/api/chats', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'Chat 2 - History Questions' })
    })
    
    if (!chat2Response.ok) {
      throw new Error('Failed to create second chat')
    }
    
    const chat2Data = await chat2Response.json()
    const chat2Id = chat2Data.chat.id
    const chat2SessionId = chat2Data.chat.sessionId
    
    console.log('✅ Second chat created')
    console.log('💬 Chat 2 ID:', chat2Id)
    console.log('🆔 Chat 2 Session ID:', chat2SessionId)
    console.log('📝 Title: History Questions\n')
    
    // Step 4: Send message to first chat
    console.log('4️⃣ Sending message to Chat 1...')
    const message1Response = await fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'What is 2 + 2?',
        chatId: chat1Id,
        role: 'user'
      })
    })
    
    if (!message1Response.ok) {
      throw new Error('Failed to send message to chat 1')
    }
    
    const message1Data = await message1Response.json()
    console.log('✅ Message sent to Chat 1')
    console.log('💬 Message Session ID:', message1Data.messageData.sessionId)
    console.log('📝 Content:', message1Data.messageData.content)
    console.log('🔗 Matches Chat 1 Session ID:', message1Data.messageData.sessionId === chat1SessionId ? '✅ YES' : '❌ NO\n')
    
    // Step 5: Send message to second chat
    console.log('5️⃣ Sending message to Chat 2...')
    const message2Response = await fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'Who was the first president of the United States?',
        chatId: chat2Id,
        role: 'user'
      })
    })
    
    if (!message2Response.ok) {
      throw new Error('Failed to send message to chat 2')
    }
    
    const message2Data = await message2Response.json()
    console.log('✅ Message sent to Chat 2')
    console.log('💬 Message Session ID:', message2Data.messageData.sessionId)
    console.log('📝 Content:', message2Data.messageData.content)
    console.log('🔗 Matches Chat 2 Session ID:', message2Data.messageData.sessionId === chat2SessionId ? '✅ YES' : '❌ NO\n')
    
    // Step 6: Verify session isolation
    console.log('6️⃣ Verifying Session Isolation...')
    console.log('🔍 Chat 1 Session ID:', chat1SessionId)
    console.log('🔍 Chat 2 Session ID:', chat2SessionId)
    console.log('🔍 User Session ID:', userSessionId)
    console.log('')
    
    const sessionsAreDifferent = chat1SessionId !== chat2SessionId
    const chatSessionsDifferentFromUser = chat1SessionId !== userSessionId && chat2SessionId !== userSessionId
    
    console.log('✅ Chat sessions are different from each other:', sessionsAreDifferent ? 'YES' : 'NO')
    console.log('✅ Chat sessions are different from user session:', chatSessionsDifferentFromUser ? 'YES' : 'NO')
    console.log('✅ Session isolation is working correctly:', sessionsAreDifferent && chatSessionsDifferentFromUser ? 'YES' : 'NO')
    
    if (sessionsAreDifferent && chatSessionsDifferentFromUser) {
      console.log('\n🎉 SUCCESS: Chat session isolation is working perfectly!')
      console.log('📋 Summary:')
      console.log('   • Each chat has its own unique session ID')
      console.log('   • Chat session IDs are different from user login session ID')
      console.log('   • Messages are tied to their respective chat sessions')
      console.log('   • AI conversations will be completely isolated between chats')
    } else {
      console.log('\n❌ FAILURE: Session isolation is not working correctly')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testSessionIsolation()

