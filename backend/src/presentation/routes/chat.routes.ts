import { Router } from "express";
import { ChatController } from "../controllers/ChatController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  isConversationParticipant,
  isGroupMember,
  isGroupAdmin,
  canModerateChat,
  rateLimitMessages,
} from "../middlewares/chat.middleware.js";
import multer from "multer";
import path from "path";

const router = Router();
const chatController = new ChatController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/chat/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// All routes require authentication
router.use(authMiddleware);

// ==================== CONVERSATIONS ====================

// Get all conversations for current user
router.get("/conversations", chatController.getConversations);

// Get or create conversation with specific user
router.get(
  "/conversations/with/:otherUserId",
  chatController.getOrCreateConversation
);

// Get messages for conversation (with authorization check)
router.get(
  "/conversations/:conversationId/messages",
  isConversationParticipant,
  chatController.getMessages
);

// Mark messages as read (with authorization check)
router.put(
  "/conversations/:conversationId/read",
  isConversationParticipant,
  chatController.markAsRead
);

// ==================== MESSAGES ====================

// Send message (with rate limiting)
router.post("/messages", rateLimitMessages, chatController.sendMessage);

// Delete own message
router.delete("/messages/:messageId", chatController.deleteMessage);

// Search messages (only in user's conversations)
router.get("/search", chatController.searchMessages);

// ==================== MODERATION (Admin/Manager only) ====================

// Delete any message (moderation)
router.delete(
  "/moderate/messages/:messageId",
  canModerateChat,
  chatController.moderateDeleteMessage
);

// Get reported messages
router.get(
  "/moderate/reported",
  canModerateChat,
  chatController.getReportedMessages
);

// Ban user from chat
router.post(
  "/moderate/ban/:userId",
  canModerateChat,
  chatController.banUserFromChat
);

// Unban user
router.delete(
  "/moderate/ban/:userId",
  canModerateChat,
  chatController.unbanUserFromChat
);

// ==================== USERS ====================

// Search users to start new chat
router.get("/users", chatController.searchUsers);

// Get online users
router.get("/online-users", chatController.getOnlineUsers);

// ==================== ATTACHMENTS ====================

// Upload attachment (with rate limiting)
router.post(
  "/upload",
  rateLimitMessages,
  upload.single("file"),
  chatController.uploadAttachment
);

// ==================== GROUP CHAT ====================

// Create group
router.post("/groups", chatController.createGroup);

// Get user's groups
router.get("/groups", chatController.getGroups);

// Get group members (must be member)
router.get(
  "/groups/:groupId/members",
  isGroupMember,
  chatController.getGroupMembers
);

// Get group messages (must be member)
router.get(
  "/groups/:groupId/messages",
  isGroupMember,
  chatController.getGroupMessages
);

// Send group message (must be member, with rate limiting)
router.post(
  "/groups/:groupId/messages",
  isGroupMember,
  rateLimitMessages,
  chatController.sendGroupMessage
);

// Update group info (admin only)
router.put(
  "/groups/:groupId",
  isGroupAdmin,
  chatController.updateGroup
);

// Add members to group (admin only)
router.post(
  "/groups/:groupId/members",
  isGroupAdmin,
  chatController.addGroupMembers
);

// Remove member from group (admin only)
router.delete(
  "/groups/:groupId/members/:userId",
  isGroupAdmin,
  chatController.removeGroupMember
);

// Leave group
router.post(
  "/groups/:groupId/leave",
  isGroupMember,
  chatController.leaveGroup
);

// Promote member to admin (admin only)
router.put(
  "/groups/:groupId/members/:userId/promote",
  isGroupAdmin,
  chatController.promoteMember
);

export default router;
