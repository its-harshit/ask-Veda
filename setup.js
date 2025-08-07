const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up ChatUI...\n')

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' })
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`)
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v16 or higher.')
  process.exit(1)
}

// Install server dependencies
console.log('\n📦 Installing server dependencies...')
try {
  execSync('npm install', { stdio: 'inherit' })
  console.log('✅ Server dependencies installed')
} catch (error) {
  console.error('❌ Failed to install server dependencies')
  process.exit(1)
}

// Install client dependencies
console.log('\n📦 Installing client dependencies...')
try {
  execSync('npm install', { cwd: './client', stdio: 'inherit' })
  console.log('✅ Client dependencies installed')
} catch (error) {
  console.error('❌ Failed to install client dependencies')
  process.exit(1)
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env')
if (!fs.existsSync(envPath)) {
  console.log('\n🔧 Creating .env file...')
  const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chatui

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client Configuration
CLIENT_URL=http://localhost:3000
`
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env file created')
} else {
  console.log('✅ .env file already exists')
}

console.log('\n🎉 Setup complete!')
console.log('\n📋 Next steps:')
console.log('1. Start MongoDB (local or cloud)')
console.log('2. Update .env file with your MongoDB connection string')
console.log('3. Run "npm run dev" to start the application')
console.log('4. Open http://localhost:3000 in your browser')
console.log('\n📖 For more information, see README.md') 