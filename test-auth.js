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

async function testAuth() {
  try {
    console.log('🔍 Testing authentication API...')
    
    // Test registration
    console.log('\n📝 Testing registration...')
    const registerResponse = await makeRequest('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser2',
        mobile: '1234567891',
        password: 'password123'
      })
    })
    
    console.log('Registration response:', registerResponse)
    
    // Test login
    console.log('\n🔑 Testing login...')
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
    
    // Test with wrong password
    console.log('\n❌ Testing login with wrong password...')
    const wrongLoginResponse = await makeRequest('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobile: '1234567891',
        password: 'wrongpassword'
      })
    })
    
    console.log('Wrong password response:', wrongLoginResponse)
    
    console.log('\n✅ Authentication test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAuth()
