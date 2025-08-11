# askVeda - Modern Chat Interface

A beautiful, modern chat application inspired by Perplexity's UI, built with React.js and MongoDB. Features real-time messaging, markdown support, code highlighting, and a responsive design.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design inspired by Perplexity
- **Real-time Messaging**: Socket.IO integration for instant message delivery
- **Streaming AI Responses**: Character-by-character streaming output for natural conversation flow
- **Markdown Support**: Rich text formatting with React Markdown
- **Code Highlighting**: Syntax highlighting for code blocks
- **Message History**: Persistent chat history with MongoDB
- **User Authentication**: JWT-based authentication system
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Typing Indicators**: Real-time typing status with AI typing indicators
- **Message Timestamps**: Automatic timestamp display
- **Copy Code**: One-click code copying functionality
- **Dark/Light Mode Ready**: Built with theming support
- **AI Service Ready**: Easy integration with OpenAI, Anthropic, and other AI services

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **React Markdown** - Markdown rendering
- **React Syntax Highlighter** - Code syntax highlighting

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd askveda
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment example
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Run the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   # Terminal 1 - Server
   npm run server
   
   # Terminal 2 - Client
   cd client && npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏗️ Project Structure

```
askveda/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── index.js          # Server entry point
├── package.json          # Root dependencies
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/askveda

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client Configuration
CLIENT_URL=http://localhost:3000
```

### MongoDB Setup

1. **Local MongoDB**:
   - Install MongoDB locally
   - Start MongoDB service
   - Use `mongodb://localhost:27017/askveda`

2. **MongoDB Atlas (Cloud)**:
   - Create MongoDB Atlas account
   - Create a cluster
   - Get connection string
   - Update `MONGODB_URI` in `.env`

## 🚀 Usage

### Development

```bash
# Start both server and client
npm run dev

# Start only server
npm run server

# Start only client
cd client && npm run dev
```

### Production

```bash
# Build client
cd client && npm run build

# Start production server
npm start
```

## 📱 Features in Detail

### Chat Interface
- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Message History**: Persistent storage in MongoDB
- **Typing Indicators**: Shows when someone is typing
- **Message Timestamps**: Automatic time display
- **Markdown Support**: Rich text formatting
- **Code Highlighting**: Syntax highlighting for code blocks
- **Copy Code**: One-click code copying

### User Experience
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Framer Motion animations
- **Modern UI**: Clean, professional design
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line
- **Auto-scroll**: Automatically scrolls to new messages

### Authentication
- **JWT Tokens**: Secure authentication
- **User Registration**: Create new accounts
- **User Login**: Secure login system
- **Password Hashing**: bcrypt password security

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get specific chat
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat

### Messages
- `GET /api/messages/chat/:chatId` - Get chat messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message

### AI Integration
- `POST /api/ai/stream` - Streaming AI response (Server-Sent Events)
- `POST /api/ai/chat` - Non-streaming AI response

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Perplexity's beautiful UI design
- Built with modern web technologies
- Real-time features powered by Socket.IO
- Styled with Tailwind CSS

## 🤖 AI Integration

### FastAPI Backend Integration

The app now supports **FastAPI backend integration** with intelligent fallback to simulated responses. This provides a robust chat experience that works with your custom AI models while maintaining reliability.

#### Features

- **FastAPI Integration**: Direct connection to your FastAPI backend at `localhost:8004`
- **Real-time Streaming**: Character-by-character streaming from your AI model
- **Automatic Fallback**: Graceful fallback to simulated responses if FastAPI is unavailable
- **Session Management**: Unique session IDs for conversation continuity
- **Image Support**: Ready for image upload functionality via base64 encoding
- **Dual Architecture**: Client-side direct connection + server-side proxy support

#### Configuration

1. **Environment Setup** - Add to your `.env` file:
```env
# FastAPI Backend Configuration (for Vite client)
VITE_FASTAPI_URL=http://localhost:8004

# FastAPI Backend Configuration (for Node.js server)
FASTAPI_URL=http://localhost:8004

# Fallback to hardcoded responses if FastAPI is unavailable
VITE_USE_FALLBACK=true
```

2. **FastAPI Endpoint Structure** - Your FastAPI server should provide:
```
POST /stream
Content-Type: application/json

{
  "session_id": "session_1234567890_abc123",
  "query": "{\"text\":\"user message\",\"image_base64\":\"\"}"
}
```

### Customizing Responses

You can customize the AI responses by modifying the `generateAIResponse` function in `client/src/context/ChatContext.jsx`:

```javascript
const generateAIResponse = (userMessage) => {
  const responses = [
    `I understand you're asking about "${userMessage}". This is a simulated response from askVeda AI assistant.`,
    `Thank you for your message: "${userMessage}". I'm here to help with your queries.`,
    // Add your custom responses here
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}
```

### Customizing Streaming Behavior

You can customize the streaming experience by modifying:

- **Typing speed**: Adjust delays in the `streamAIResponse` function
- **Response variations**: Update the response templates in `generateAIResponse`
- **Typing indicators**: Modify the AI typing indicator timing  
- **Cursor animation**: Update the CSS animation in `index.css`

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Port Already in Use**:
   - Change PORT in `.env`
   - Kill existing processes on the port

3. **Socket.IO Connection Issues**:
   - Check CORS configuration
   - Verify client URL in server config
   - Ensure both server and client are running

4. **Build Errors**:
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

5. **AI Streaming Issues**:
   - Check API key configuration
   - Verify network connectivity to AI service
   - Check rate limits and quotas
   - Ensure proper error handling in streaming functions

### Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation

---

**Happy Chatting! 🎉** 