// API Configuration for FastAPI backend
export const API_CONFIG = {
  // FastAPI server configuration
  BASE_URL: import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8030',
  ENDPOINTS: {
    STREAM: '/stream',
    UPLOAD_IMAGE: '/upload-image'
  }
};

// Express.js backend configuration
export const EXPRESS_API_CONFIG = {
  BASE_URL: import.meta.env.VITE_EXPRESS_URL || 'http://localhost:5000',
  ENDPOINTS: {
    AUTH: '/api/auth',
    CHATS: '/api/chats',
    MESSAGES: '/api/messages',
    AI: '/api/ai',
    ADMIN: '/api/admin'
  }
};

// Session management
export const generateSessionId = () => {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Chat-specific session management
export const generateChatSessionId = () => {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};
