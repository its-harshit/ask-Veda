const mongoose = require('mongoose')
require('dotenv').config()

// Test database connection
async function testDBConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/askveda')
    console.log('✅ Database connected successfully!')
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('📊 Available collections:', collections.map(c => c.name))
    
    // Test User model
    const User = require('./server/models/User')
    const userCount = await User.countDocuments()
    console.log(`👥 Users in database: ${userCount}`)
    
    // Test Chat model
    const Chat = require('./server/models/Chat')
    const chatCount = await Chat.countDocuments()
    console.log(`💬 Chats in database: ${chatCount}`)
    
    // Test Message model
    const Message = require('./server/models/Message')
    const messageCount = await Message.countDocuments()
    console.log(`💭 Messages in database: ${messageCount}`)
    
    console.log('\n🎉 Database test completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Open http://localhost:3000 in your browser')
    console.log('2. Register a new account')
    console.log('3. Create some chats and send messages')
    console.log('4. Check the sidebar to see your chat history')
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure MongoDB is running')
    console.log('2. Check your MONGODB_URI in .env file')
    console.log('3. Ensure MongoDB is accessible')
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

testDBConnection()
