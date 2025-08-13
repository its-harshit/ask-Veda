// API Configuration for FastAPI backend
export const API_CONFIG = {
  // FastAPI server configuration
  BASE_URL: import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8004',
  ENDPOINTS: {
    STREAM: '/stream',
    UPLOAD_IMAGE: '/upload-image'
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
