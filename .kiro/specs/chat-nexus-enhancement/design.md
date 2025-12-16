# Chat Nexus Enhancement - Design Document

## Overview

Tài liệu này mô tả thiết kế kỹ thuật để nâng cấp Chat Nexus từ MVP sang hệ thống chat production-ready. Thiết kế tập trung vào 4 trụ cột chính:

1. **Trust & Transparency**: Mọi hành động đều có phản hồi rõ ràng
2. **Identity Clarity**: Nhận diện người gửi không cần suy luận
3. **Reliability**: Hoạt động ổn định cả online và offline
4. **Professional UX**: Trải nghiệm tương đương Slack/Teams

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Chat Nexus Frontend                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   UI Layer  │  │  State Mgmt │  │    Service Layer        │  │
│  │             │  │             │  │                         │  │
│  │ ChatManager │  │ useChat     │  │ chatService             │  │
│  │ MessageList │  │ useSocket   │  │ socketService           │  │
│  │ MessageItem │  │ useOffline  │  │ offlineQueueService     │  │
│  │ InputArea   │  │             │  │ fileUploadService       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend API                               │
├─────────────────────────────────────────────────────────────────┤
│  REST API: /api/chat/*     │    WebSocket: /socket.io           │
│  - Messages CRUD           │    - Real-time messages            │
│  - Reactions               │    - Typing indicators             │
│  - File uploads            │    - Online status                 │
│  - Message edit/recall     │    - Reaction updates              │
└─────────────────────────────────────────────────────────────────┘
```

### State Management Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Chat State Structure                        │
├─────────────────────────────────────────────────────────────────┤
│  {                                                               │
│    conversations: Conversation[],                                │
│    activeConversationId: string | null,                         │
│    messages: Map<conversationId, Message[]>,                    │
│    pendingMessages: Message[],        // Optimistic UI queue    │
│    offlineQueue: QueuedMessage[],     // Offline message queue  │
│    connectionStatus: 'online' | 'offline' | 'reconnecting',    │
│    typingUsers: Map<conversationId, User[]>,                    │
│    reactions: Map<messageId, Reaction[]>,                       │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Message Component Hierarchy

```
ChatManager
├── ConversationSidebar
│   ├── ConversationSearch
│   ├── ConversationFilter
│   └── ConversationList
│       └── ConversationItem
├── ChatArea
│   ├── ChatHeader
│   │   ├── RecipientInfo
│   │   └── ActionButtons (Call/Video - conditional)
│   ├── ConnectionBanner
│   ├── MessageList
│   │   └── MessageItem
│   │       ├── SenderInfo (avatar, name, department)
│   │       ├── MessageContent
│   │       ├── MessageAttachment
│   │       ├── ReactionBar
│   │       ├── MessageStatus
│   │       └── MessageActions (edit, recall, react)
│   └── InputArea
│       ├── AttachmentButton
│       ├── TextInput
│       ├── EmojiPicker
│       └── SendButton
└── Modals
    ├── ReactionPickerModal
    ├── FilePreviewModal
    └── CallModal (when implemented)
```

### 2. Core Interfaces

```typescript
// Message with full sender identity
interface ChatMessage {
  id: string;
  tempId?: string;                    // For optimistic UI
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderDepartment?: string;
  senderRole?: string;
  content: string;
  type: 'text' | 'image' | 'file';
  status: 'pending' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  editedAt?: string;
  isRecalled: boolean;
  recalledAt?: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
}

// Attachment with upload status
interface Attachment {
  id: string;
  type: 'image' | 'document';
  fileName: string;
  fileSize: number;
  mimeType: string;
  url?: string;
  thumbnailUrl?: string;
  uploadStatus: 'uploading' | 'uploaded' | 'failed';
  uploadProgress?: number;
}

// Reaction structure
interface Reaction {
  emoji: string;
  count: number;
  users: ReactionUser[];
  hasReacted: boolean;  // Current user has reacted
}

interface ReactionUser {
  id: string;
  name: string;
  avatar?: string;
}

// Connection state
interface ConnectionState {
  status: 'online' | 'offline' | 'reconnecting';
  lastOnline?: string;
  reconnectAttempts: number;
}

// Offline queue item
interface QueuedMessage {
  tempId: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  attachments?: File[];
  queuedAt: string;
  retryCount: number;
}
```

### 3. Service Interfaces

```typescript
// Enhanced Chat Service
interface IChatService {
  // Messages
  getMessages(conversationId: string, options?: PaginationOptions): Promise<ChatMessage[]>;
  sendMessage(data: SendMessageData): Promise<ChatMessage>;
  editMessage(messageId: string, content: string): Promise<ChatMessage>;
  recallMessage(messageId: string): Promise<void>;
  
  // Reactions
  addReaction(messageId: string, emoji: string): Promise<void>;
  removeReaction(messageId: string, emoji: string): Promise<void>;
  getReactionUsers(messageId: string, emoji: string): Promise<ReactionUser[]>;
  
  // File uploads
  uploadFile(file: File, onProgress: (progress: number) => void): Promise<Attachment>;
  
  // Real-time
  subscribeToMessages(conversationId: string, callback: (msg: ChatMessage) => void): () => void;
  subscribeToReactions(callback: (data: ReactionUpdate) => void): () => void;
  subscribeToTyping(conversationId: string, callback: (users: User[]) => void): () => void;
}

// Offline Queue Service
interface IOfflineQueueService {
  enqueue(message: QueuedMessage): void;
  dequeue(): QueuedMessage | null;
  getAll(): QueuedMessage[];
  clear(): void;
  processQueue(): Promise<void>;
  onStatusChange(callback: (status: ConnectionState) => void): () => void;
}
```

## Data Models

### Database Schema Extensions

```sql
-- Message reactions table
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(message_id, user_id, emoji)
);

-- Message edit history (for audit)
CREATE TABLE message_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  original_content TEXT NOT NULL,
  edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add columns to chat_messages
ALTER TABLE chat_messages ADD COLUMN edited_at TIMESTAMP;
ALTER TABLE chat_messages ADD COLUMN is_recalled BOOLEAN DEFAULT FALSE;
ALTER TABLE chat_messages ADD COLUMN recalled_at TIMESTAMP;
```

### Message Status Flow

```
┌─────────┐    ┌─────────┐    ┌──────┐    ┌───────────┐    ┌──────┐
│ Pending │───▶│ Sending │───▶│ Sent │───▶│ Delivered │───▶│ Read │
└─────────┘    └─────────┘    └──────┘    └───────────┘    └──────┘
     │              │
     │              ▼
     │         ┌────────┐
     └────────▶│ Failed │──▶ Retry ──▶ Sending
               └────────┘
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties have been identified after eliminating redundancies:

### Property 1: Message Identity Completeness
*For any* message from another user displayed in chat, the rendered output SHALL contain the sender's avatar element, full name text, and department/role text.
**Validates: Requirements 1.1, 1.2, 1.4**

### Property 2: Own Message Positioning
*For any* message where senderId equals current user, the message container SHALL have right-alignment CSS class and distinct background color class different from other users' messages.
**Validates: Requirements 1.3**

### Property 3: File Upload State Display
*For any* file attachment with uploadStatus 'uploading', the UI SHALL display a progress indicator showing percentage. *For any* file with uploadStatus 'uploaded', the UI SHALL show download/view action. *For any* file with uploadStatus 'failed', the UI SHALL show retry button.
**Validates: Requirements 2.3, 2.4, 2.5**

### Property 4: Document Card Information
*For any* document attachment (non-image), the rendered card SHALL contain the filename, a file type icon, and the file size in human-readable format.
**Validates: Requirements 2.2**

### Property 5: Image Preview Rendering
*For any* image attachment, the rendered output SHALL contain an img element with src pointing to the image URL or a preview thumbnail.
**Validates: Requirements 2.1**

### Property 6: Reaction Aggregation Correctness
*For any* message with reactions, the displayed reaction counts SHALL equal the actual count of unique users who added each emoji. The sum of individual emoji counts SHALL equal total reactions.
**Validates: Requirements 3.3**

### Property 7: Reaction Toggle Round-Trip
*For any* user and message, adding a reaction then removing the same reaction SHALL result in the message having no reaction from that user for that emoji.
**Validates: Requirements 3.2, 3.6**

### Property 8: Reaction User List Accuracy
*For any* reaction emoji on a message, the user list returned SHALL contain exactly the users who have that reaction, with no duplicates and no missing users.
**Validates: Requirements 3.4**

### Property 9: Edit Time Window Enforcement
*For any* message, if (currentTime - message.timestamp) <= 5 minutes AND senderId equals currentUser, then edit SHALL be allowed. If (currentTime - message.timestamp) > 5 minutes, then edit SHALL be disabled.
**Validates: Requirements 4.1, 4.3**

### Property 10: Edited Message Indicator
*For any* message where editedAt is not null, the rendered output SHALL contain the text "(đã chỉnh sửa)" or equivalent indicator.
**Validates: Requirements 4.2**

### Property 11: Recalled Message Content Replacement
*For any* message where isRecalled is true, the displayed content SHALL be "Tin nhắn này đã được thu hồi" regardless of original content, for both sender and recipient views.
**Validates: Requirements 4.4, 4.6**

### Property 12: Recall Audit Preservation
*For any* recalled message, the original content SHALL exist in the message_edit_history or audit table in the database.
**Validates: Requirements 4.5**

### Property 13: Call Button Visibility Consistency
*For any* UI state, if callFeatureEnabled is false, then call buttons (voice and video) SHALL NOT be present in the DOM. If callFeatureEnabled is true and buttons are visible, clicking them SHALL trigger a modal or status change.
**Validates: Requirements 5.1, 5.5**

### Property 14: Optimistic Message Display
*For any* message sent by user, the message SHALL appear in the message list immediately with status 'sending' or 'pending' before server response is received.
**Validates: Requirements 6.1**

### Property 15: Message Status Progression
*For any* message, the status SHALL only transition in valid order: pending → sending → sent → delivered → read, OR pending → sending → failed. No skipping or backward transitions except retry (failed → sending).
**Validates: Requirements 6.2, 6.3, 6.4**

### Property 16: Failed Message Preservation
*For any* message with status 'failed', the original content SHALL be preserved and a retry action SHALL be available.
**Validates: Requirements 6.5, 6.6**

### Property 17: Offline Queue FIFO Processing
*For any* sequence of messages queued while offline, when connection is restored, messages SHALL be sent in the same order they were queued (FIFO).
**Validates: Requirements 7.2, 7.3**

### Property 18: Connection Banner State Sync
*For any* connection state change (online ↔ offline), the connection banner visibility SHALL match: visible when offline/reconnecting, hidden when online.
**Validates: Requirements 7.1**

### Property 19: Offline Data Accessibility
*For any* previously loaded conversation, while offline, the conversation and its cached messages SHALL remain accessible for viewing.
**Validates: Requirements 7.6**

### Property 20: Sidebar Toggle Layout Adjustment
*For any* sidebar visibility state, when sidebar is hidden, the message area width SHALL be greater than when sidebar is visible.
**Validates: Requirements 8.3**

### Property 21: Loading State Skeleton Display
*For any* data loading operation (conversations, messages), while loading is true, skeleton loader elements SHALL be displayed instead of empty content.
**Validates: Requirements 9.2**

### Property 22: Error State User Feedback
*For any* error state, the UI SHALL display an error message containing actionable text (retry, refresh, or contact information).
**Validates: Requirements 9.3**

### Property 23: Processing State Button Disable
*For any* action button, while its associated operation is processing, the button SHALL be disabled (disabled attribute true or pointer-events none).
**Validates: Requirements 9.4**

## Error Handling

### Error Categories and Responses

| Error Type | User Message | Action |
|------------|--------------|--------|
| Network Error | "Không thể kết nối. Đang thử lại..." | Auto-retry with exponential backoff |
| Send Failed | "Gửi tin nhắn thất bại" | Show retry button |
| Upload Failed | "Upload thất bại" | Show retry button with file preserved |
| Edit Timeout | "Không thể chỉnh sửa tin nhắn quá 5 phút" | Disable edit, show tooltip |
| Permission Denied | "Bạn không có quyền thực hiện hành động này" | Hide action, log error |
| Server Error | "Đã xảy ra lỗi. Vui lòng thử lại sau" | Show refresh option |

### Retry Strategy

```typescript
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000,      // 1 second
  maxDelay: 30000,      // 30 seconds
  backoffMultiplier: 2,
};

// Exponential backoff: 1s → 2s → 4s → give up
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests:

1. **Unit Tests**: Verify specific examples, edge cases, and integration points
2. **Property-Based Tests**: Verify universal properties hold across all valid inputs

### Property-Based Testing Framework

**Framework**: fast-check (TypeScript/JavaScript PBT library)

**Configuration**:
```typescript
import fc from 'fast-check';

// Run minimum 100 iterations per property
fc.configureGlobal({ numRuns: 100 });
```

### Test Categories

#### 1. Message Rendering Tests (Properties 1-2)
- Generate random messages with various sender configurations
- Verify identity elements are present for other users
- Verify positioning classes for own messages

#### 2. File Upload Tests (Properties 3-5)
- Generate random file types and upload states
- Verify correct UI elements for each state
- Test progress indicator accuracy

#### 3. Reaction Tests (Properties 6-8)
- Generate random reaction sets from multiple users
- Verify aggregation math is correct
- Test toggle round-trip behavior

#### 4. Edit/Recall Tests (Properties 9-12)
- Generate messages with various timestamps
- Verify time window enforcement
- Test recall content replacement

#### 5. Message Status Tests (Properties 14-16)
- Generate message state transitions
- Verify valid transition paths only
- Test failed message preservation

#### 6. Offline Queue Tests (Properties 17-19)
- Generate random message sequences
- Verify FIFO ordering after reconnect
- Test cached data accessibility

#### 7. UI State Tests (Properties 20-23)
- Generate various UI states
- Verify layout adjustments
- Test loading and error states

### Unit Test Coverage

- Component rendering with various props
- Event handler behavior
- Service method responses
- Edge cases: empty states, max lengths, special characters

### Test File Structure

```
web-frontend/src/
├── components/chat/
│   ├── MessageItem.tsx
│   ├── MessageItem.test.tsx          # Unit tests
│   └── MessageItem.property.test.tsx # Property tests
├── hooks/
│   ├── useChat.ts
│   ├── useChat.test.ts
│   └── useChat.property.test.ts
└── services/
    ├── chatService.ts
    └── chatService.test.ts
```
