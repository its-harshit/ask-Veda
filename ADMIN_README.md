# Admin Dashboard for askVeda

This admin section provides comprehensive management and export capabilities for the askVeda chat application.

## Features

### 📊 Dashboard Overview
- **Statistics Dashboard**: View total users, chats, messages, and sessions
- **Recent Activity**: Monitor activity from the last 7 days
- **Real-time Updates**: Refresh statistics on demand

### 💬 Chat Management
- **View All Chats**: Browse all chats with pagination
- **Filter Options**: 
  - Search by chat title
  - Filter by session ID
  - Filter by user ID
- **Chat Details**: View chat information, participants, and message counts
- **Status Tracking**: Monitor active/inactive chats

### 📝 Message Management
- **View All Messages**: Browse all messages with pagination
- **Advanced Filtering**:
  - Filter by chat ID
  - Filter by session ID
  - Filter by user ID
  - Filter by message role (user/assistant/system)
- **Message Content**: View truncated message content for quick review
- **Read Status**: Track message read status

### 👥 User Management
- **User Directory**: View all registered users
- **User Search**: Search by username or mobile number
- **User Status**: Monitor online/offline status
- **Activity Tracking**: View last seen timestamps

### 📤 Data Export
- **Chat Export**: Export individual chat data
- **Session Export**: Export all chats and messages from a session
- **Multiple Formats**: Export in JSON or CSV format
- **Automatic Download**: Files are automatically downloaded to your device

## Access

### Navigation
1. Hover over the **Settings** icon in the sidebar
2. Click on **Admin Dashboard** button
3. Or navigate directly to `/admin` route

### Authentication
- Currently, any authenticated user can access admin features
- In production, consider adding an `isAdmin` field to the User model for proper access control

## API Endpoints

### Statistics
- `GET /api/admin/stats` - Get dashboard statistics

### Chats
- `GET /api/admin/chats` - Get all chats with pagination and filters
- `GET /api/admin/chats/:chatId` - Get specific chat details with messages

### Messages
- `GET /api/admin/messages` - Get all messages with pagination and filters

### Users
- `GET /api/admin/users` - Get all users with pagination and search

### Exports
- `GET /api/admin/export/chat/:chatId?format=json|csv` - Export chat data
- `GET /api/admin/export/session/:sessionId?format=json|csv` - Export session data

## Usage Examples

### Exporting Chat Data
1. Go to the **Chats** tab
2. Find the chat you want to export
3. Copy the chat ID
4. Go to the **Exports** tab
5. Select "Chat Export"
6. Paste the chat ID
7. Choose format (JSON or CSV)
8. Click "Export Chat"

### Exporting Session Data
1. Go to the **Chats** tab
2. Find a chat from the session you want to export
3. Copy the session ID
4. Go to the **Exports** tab
5. Select "Session Export"
6. Paste the session ID
7. Choose format (JSON or CSV)
8. Click "Export Session"

### Filtering Messages
1. Go to the **Messages** tab
2. Use the filter options:
   - Enter a chat ID to see messages from a specific chat
   - Enter a session ID to see messages from a specific session
   - Enter a user ID to see messages from a specific user
   - Select a role to filter by message type (user/assistant/system)

## Data Structure

### Chat Export (JSON)
```json
{
  "chat": {
    "id": "chat_id",
    "title": "Chat Title",
    "sessionId": "session_id",
    "createdBy": { "username": "user", "mobile": "1234567890" },
    "participants": [...],
    "messageCount": 10,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "messages": [
    {
      "id": "message_id",
      "content": "Message content",
      "role": "user|assistant|system",
      "sender": { "username": "user", "mobile": "1234567890" },
      "timestamp": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Session Export (JSON)
```json
{
  "sessionId": "session_id",
  "chats": [...],
  "messages": [...]
}
```

### CSV Format
The CSV export includes headers and data rows with the following columns:
- Message ID
- Role (user/assistant/system)
- Content (quoted to handle commas and quotes)
- Sender username
- Timestamp
- Created At

## Security Considerations

1. **Access Control**: Implement proper admin role checking
2. **Rate Limiting**: Consider adding rate limiting for export endpoints
3. **Data Privacy**: Ensure sensitive data is properly handled
4. **Audit Logging**: Consider logging admin actions for security

## Future Enhancements

- [ ] Excel export format
- [ ] Bulk export functionality
- [ ] Advanced analytics and reporting
- [ ] User activity tracking
- [ ] Chat analytics and insights
- [ ] Automated report generation
- [ ] Email export delivery
- [ ] Real-time admin notifications
