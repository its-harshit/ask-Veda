const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up askVeda...\n')

// Check if .env file exists
const envPath = path.join(__dirname, '.env')
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...')
  const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/askveda

# JWT Configuration
JWT_SECRET=aea874c7535ec05a16deb028a4eeba848977bd036a5da688e220bedf7ee606ea600940c540442821556a27c9ce63bb51421a9c82dd9eac5b0232ff27de894c1a

# Client Configuration
CLIENT_URL=http://localhost:3000
`
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env file created successfully!')
} else {
  console.log('✅ .env file already exists')
}

console.log('\n📋 Setup Instructions:')
console.log('1. Make sure MongoDB is running on your system')
console.log('2. Install dependencies: npm run install-all')
console.log('3. Start the development server: npm run dev')
console.log('4. Open http://localhost:3000 in your browser')
console.log('5. Register a new account to get started')
console.log('\n🎉 Happy coding!') 