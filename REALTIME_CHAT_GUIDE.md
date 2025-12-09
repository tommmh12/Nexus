# Realtime Chat System - Hệ thống Chat Thời gian thực

## 📦 Đã Cài Đặt

### Backend

- ✅ Database tables (conversations, chat_messages, chat_attachments, user_online_status, typing_indicators)
- ✅ ChatRepository với các methods CRUD
- ✅ ChatService với business logic
- ✅ ChatController với REST API endpoints
- ✅ Socket.IO Server với SocketManager
- ✅ Dependencies: socket.io@^4.7.2, multer@^1.4.5-lts.1

### Frontend

- ✅ chatService.ts với API calls
- ✅ useSocket.ts custom hook cho Socket.IO
- ✅ Dependencies: socket.io-client@^4.7.2
- ⚠️ ChatManager component (cần fix import paths)

## 🚀 Cách Chạy

### 1. Backend

```bash
cd backend
npm run migrate:chat  # Chạy migration (đã chạy rồi)
npm run dev           # Server đang chạy trên port 5000
```

### 2. Frontend

```bash
npm run dev  # Chạy trên port 3000
```

## 🔌 Socket.IO Events

### Client → Server

- `join:conversation` - Join vào phòng chat
- `leave:conversation` - Rời khỏi phòng chat
- `send:message` - Gửi tin nhắn
- `typing:start` - Bắt đầu gõ
- `typing:stop` - Ngừng gõ
- `message:read` - Đánh dấu đã đọc
- `message:delete` - Xóa tin nhắn

### Server → Client

- `message:new` - Tin nhắn mới
- `typing:start` - Ai đó đang gõ
- `typing:stop` - Ngừng gõ
- `messages:read` - Tin nhắn đã được đọc
- `message:deleted` - Tin nhắn đã xóa
- `user:online` - User online
- `user:offline` - User offline

## 📡 REST API Endpoints

```typescript
GET /api/chat/conversations                    // Lấy danh sách conversations
GET /api/chat/conversations/with/:userId      // Tạo/lấy conversation với user
GET /api/chat/conversations/:id/messages      // Lấy messages
POST /api/chat/messages                        // Gửi message (backup cho socket)
PUT /api/chat/conversations/:id/read          // Mark as read
DELETE /api/chat/messages/:id                 // Xóa message
GET /api/chat/search?q=keyword                // Tìm kiếm messages
GET /api/chat/online-users                    // Lấy danh sách users online
POST /api/chat/upload                         // Upload file attachment
```

## 💻 Sử Dụng

### useSocket Hook

```typescript
const {
  isConnected,
  onlineUsers,
  joinConversation,
  sendMessage,
  onNewMessage,
  markAsRead,
} = useSocket();

// Join conversation
useEffect(() => {
  if (conversationId) {
    joinConversation(conversationId);
  }
}, [conversationId]);

// Listen for new messages
useEffect(() => {
  const cleanup = onNewMessage((data) => {
    setMessages((prev) => [...prev, data.message]);
  });
  return cleanup;
}, []);

// Send message
sendMessage({
  conversationId: "uuid",
  messageText: "Hello!",
});
```

### Chat Service

```typescript
import { chatService } from "../services/chatService";

// Get conversations
const conversations = await chatService.getConversations();

// Get messages
const messages = await chatService.getMessages(conversationId);

// Send message (REST backup)
await chatService.sendMessage({
  conversationId,
  messageText: "Hello",
});
```

## 🎯 Features

- ✅ Realtime messaging với Socket.IO
- ✅ Online/Offline status tracking
- ✅ Typing indicators
- ✅ Read receipts (double checkmarks)
- ✅ Message search
- ✅ File attachments support
- ✅ Auto-reconnection
- ✅ Message persistence trong MySQL
- ✅ REST API fallback nếu Socket.IO fail

## 🐛 Fix Cần Làm

### Frontend ChatManager Component

File `web-frontend/src/pages/admin/communication/ChatManager.tsx` cần:

1. Fix import path của Button component:

```typescript
// Thay vì:
import { Button } from "../../system/ui/Button";

// Nên là:
import { Button } from "../../../components/system/ui/Button";
```

2. Hoặc tạo component đơn giản không dùng Button của hệ thống:

```typescript
// Dùng button HTML thông thường
<button className="...">Send</button>
```

## 📊 Database Schema

### conversations

- id (CHAR(36) PRIMARY KEY)
- participant1_id, participant2_id
- last_message_id
- last_updated

### chat_messages

- id (CHAR(36) PRIMARY KEY)
- conversation_id
- sender_id
- message_text
- message_type (text/image/file)
- is_read, is_deleted
- created_at

### chat_attachments

- id (CHAR(36) PRIMARY KEY)
- message_id
- file_name, file_path
- file_size, mime_type

### user_online_status

- user_id (PRIMARY KEY)
- status (online/offline/busy/away)
- last_seen
- socket_id

### typing_indicators

- conversation_id
- user_id
- is_typing
- updated_at

## 🔐 Authentication

Socket.IO và REST API đều yêu cầu JWT token:

```typescript
// Socket connection
const socket = io(SOCKET_URL, {
  auth: { token: localStorage.getItem("token") },
});

// REST API
headers: {
  Authorization: `Bearer ${token}`;
}
```

## 🎨 UI Components Cần

Nếu muốn dùng ChatManager component, cần:

1. Button component từ `components/system/ui/Button.tsx`
2. Hoặc style lại với Tailwind CSS thuần

## ✨ Next Steps

1. Fix import paths trong ChatManager.tsx
2. Test realtime messaging giữa 2 users
3. Test typing indicators
4. Test file upload
5. Test read receipts
6. Thêm emoji picker (optional)
7. Thêm voice/video call (optional)
