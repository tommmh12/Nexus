# Requirements Document

## Introduction

Tài liệu này mô tả các yêu cầu cải tiến hệ thống Chat Nexus từ trạng thái MVP/Prototype sang công cụ chat đủ tiêu chuẩn sử dụng chính thức trong nội bộ công ty. Mục tiêu cốt lõi là tạo ra hệ thống chat đáng tin cậy, không cần hướng dẫn, không có nút bấm gây hiểu nhầm, và đủ tin cậy để dùng cho trao đổi công việc hàng ngày.

## Glossary

- **Chat Nexus**: Hệ thống chat nội bộ doanh nghiệp đang được phát triển
- **Optimistic UI**: Kỹ thuật hiển thị kết quả ngay lập tức trước khi server xác nhận
- **Message Status**: Trạng thái tin nhắn (Sending, Sent, Delivered, Read, Failed)
- **Conversation**: Cuộc hội thoại giữa 2 hoặc nhiều người dùng
- **Direct Chat**: Cuộc hội thoại 1-1 giữa hai người dùng
- **Group Chat**: Cuộc hội thoại nhóm với nhiều thành viên
- **Reaction**: Biểu cảm emoji được thêm vào tin nhắn
- **Message Recall**: Thu hồi tin nhắn đã gửi
- **Connection Banner**: Thanh thông báo trạng thái kết nối mạng
- **Local Queue**: Hàng đợi tin nhắn cục bộ khi offline

## Requirements

### Requirement 1: Identity Clarity - Nhận diện danh tính người gửi

**User Story:** As a chat user, I want to clearly identify who sent each message, so that I can follow conversations without confusion.

#### Acceptance Criteria

1. WHEN a message is displayed in chat THEN the Chat Nexus SHALL show the sender's avatar, full name, and department/role for each message from other users
2. WHEN displaying messages in group chat THEN the Chat Nexus SHALL display sender information (avatar, name) for every message regardless of consecutive messages from the same sender
3. WHEN displaying my own messages THEN the Chat Nexus SHALL position them on the right side with distinct visual styling (different background color, alignment) compared to messages from others positioned on the left
4. WHEN a user views any message THEN the Chat Nexus SHALL ensure the message is self-contained with all sender identity information visible without requiring scrolling or hovering

### Requirement 2: File and Image Sharing

**User Story:** As a chat user, I want to share files and images in conversations, so that I can collaborate effectively with colleagues.

#### Acceptance Criteria

1. WHEN a user selects an image file to upload THEN the Chat Nexus SHALL display an inline preview of the image within the chat message area
2. WHEN a user selects a document file (PDF, DOC, XLS) to upload THEN the Chat Nexus SHALL display a file card with filename, file type icon, and file size
3. WHILE a file is uploading THEN the Chat Nexus SHALL display a progress indicator with "Uploading..." status and percentage
4. WHEN a file upload completes successfully THEN the Chat Nexus SHALL update the status to "Uploaded" and enable the file for viewing/download
5. IF a file upload fails THEN the Chat Nexus SHALL display "Failed" status with a visible "Retry" button
6. WHILE a file is uploading THEN the Chat Nexus SHALL allow the user to continue typing and sending text messages without blocking the UI

### Requirement 3: Message Reactions

**User Story:** As a chat user, I want to react to messages with emojis, so that I can quickly express my response without typing a full message.

#### Acceptance Criteria

1. WHEN a user clicks/taps on a message THEN the Chat Nexus SHALL display a reaction picker with common emoji options
2. WHEN a user selects an emoji reaction THEN the Chat Nexus SHALL add the reaction to the message and display it below the message content
3. WHEN multiple users react to the same message THEN the Chat Nexus SHALL display aggregated reaction counts grouped by emoji type
4. WHEN a user clicks on a reaction count THEN the Chat Nexus SHALL display a list of users who added that specific reaction
5. WHEN a reaction is added or removed THEN the Chat Nexus SHALL update the reaction display in real-time without reloading the entire message list
6. WHEN a user clicks their own existing reaction THEN the Chat Nexus SHALL remove that reaction from the message

### Requirement 4: Message Edit and Recall

**User Story:** As a chat user, I want to edit or recall messages I've sent, so that I can correct mistakes or remove inappropriate content.

#### Acceptance Criteria

1. WHEN a user requests to edit their own message within 5 minutes of sending THEN the Chat Nexus SHALL allow inline editing of the message content
2. WHEN a message has been edited THEN the Chat Nexus SHALL display "(đã chỉnh sửa)" indicator next to the message timestamp
3. IF a user attempts to edit a message older than 5 minutes THEN the Chat Nexus SHALL disable the edit option and display a tooltip explaining the time limit
4. WHEN a user recalls their own message THEN the Chat Nexus SHALL replace the message content with "Tin nhắn này đã được thu hồi" visible to all participants
5. WHEN a message is recalled THEN the Chat Nexus SHALL preserve the original message in backend storage for audit purposes while hiding content from UI
6. WHEN viewing a recalled message THEN the Chat Nexus SHALL display the recall notice in place of original content for both sender and recipients

### Requirement 5: Voice and Video Call Integration

**User Story:** As a chat user, I want to make voice and video calls from the chat interface, so that I can seamlessly switch between text and real-time communication.

#### Acceptance Criteria

1. WHEN the call feature is not fully implemented THEN the Chat Nexus SHALL hide the call buttons entirely from the UI
2. WHEN the call feature is implemented and a user clicks the voice call button THEN the Chat Nexus SHALL initiate a call and display a modal with call status (calling, connecting, connected, rejected)
3. WHEN the call feature is implemented and a user clicks the video call button THEN the Chat Nexus SHALL initiate a video call with camera preview and call status display
4. WHEN a call is in progress THEN the Chat Nexus SHALL allow the user to switch between voice-only and video modes
5. WHEN a call button is visible THEN the Chat Nexus SHALL ensure clicking it produces an immediate visible response (modal, status change, or error message)

### Requirement 6: Optimistic UI and Message Status

**User Story:** As a chat user, I want immediate feedback when sending messages, so that I feel confident my messages are being processed.

#### Acceptance Criteria

1. WHEN a user sends a message THEN the Chat Nexus SHALL display the message immediately in the chat with "Sending..." status before server confirmation
2. WHEN the server confirms message delivery THEN the Chat Nexus SHALL update the message status from "Sending..." to "Sent" (single checkmark)
3. WHEN the recipient receives the message THEN the Chat Nexus SHALL update the status to "Delivered" (double checkmark)
4. WHEN the recipient reads the message THEN the Chat Nexus SHALL update the status to "Read" (colored double checkmark)
5. IF message sending fails THEN the Chat Nexus SHALL display "Failed" status with a visible "Retry" button next to the message
6. WHEN a message fails to send THEN the Chat Nexus SHALL preserve the message content and allow retry without requiring the user to retype

### Requirement 7: Offline Support and Reconnection

**User Story:** As a chat user, I want to continue using chat even with unstable internet, so that I don't lose my work or messages.

#### Acceptance Criteria

1. WHEN the network connection is lost THEN the Chat Nexus SHALL display a prominent banner stating "Đang mất kết nối – tin nhắn sẽ được gửi lại khi có mạng"
2. WHEN a user sends a message while offline THEN the Chat Nexus SHALL queue the message locally with "Pending" status
3. WHEN network connection is restored THEN the Chat Nexus SHALL automatically send all queued messages in order
4. WHEN network connection is restored THEN the Chat Nexus SHALL synchronize and display any new messages received during the offline period
5. WHEN the connection status changes THEN the Chat Nexus SHALL update the connection banner within 3 seconds of the actual status change
6. WHILE offline THEN the Chat Nexus SHALL allow the user to browse previously loaded conversations and messages

### Requirement 8: Chat Layout and User Experience

**User Story:** As a chat user, I want a spacious and comfortable chat interface, so that I can focus on conversations without feeling cramped.

#### Acceptance Criteria

1. WHEN the chat module is opened THEN the Chat Nexus SHALL display the chat area using the full available content space, not as a widget or side panel
2. WHEN viewing the chat interface THEN the Chat Nexus SHALL provide a toggle to hide/show the conversation list sidebar
3. WHEN the conversation list is hidden THEN the Chat Nexus SHALL expand the message area to use the freed space
4. WHEN using the chat for extended periods THEN the Chat Nexus SHALL maintain consistent spacing, font sizes, and contrast ratios that reduce eye strain
5. WHEN the window is resized THEN the Chat Nexus SHALL responsively adjust the layout while maintaining usability on screens 1024px wide and above

### Requirement 9: System Transparency and Trust

**User Story:** As a chat user, I want the system to always communicate its state clearly, so that I never wonder if something is broken or working.

#### Acceptance Criteria

1. WHEN any user action is performed THEN the Chat Nexus SHALL provide visible feedback within 200 milliseconds (loading indicator, status change, or completion)
2. WHEN loading conversations or messages THEN the Chat Nexus SHALL display skeleton loaders or progress indicators instead of blank screens
3. WHEN an error occurs THEN the Chat Nexus SHALL display a user-friendly error message with suggested actions (retry, refresh, contact support)
4. WHEN the system is processing a request THEN the Chat Nexus SHALL disable relevant action buttons to prevent duplicate submissions
5. WHEN a feature button exists in the UI THEN the Chat Nexus SHALL ensure clicking it produces a meaningful response (action, feedback, or explanation)
