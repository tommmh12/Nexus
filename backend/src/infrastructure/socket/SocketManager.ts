import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { ChatService } from "../../application/services/ChatService.js";
import { dailyService } from "../../application/services/DailyService.js";
import jwt from "jsonwebtoken";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  userName?: string;
}

// Track active calls
interface ActiveCall {
  callId: string;
  callerId: string;
  callerName: string;
  recipientId: string;
  recipientName: string;
  roomName: string;
  roomUrl: string; // Full Daily.co room URL
  isVideoCall: boolean;
  startTime: Date;
}

export class SocketManager {
  private io: SocketIOServer;
  private chatService: ChatService;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private activeCalls: Map<string, ActiveCall> = new Map(); // callId -> ActiveCall
  private userInCall: Map<string, string> = new Map(); // userId -> callId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          process.env.FRONTEND_URL || "http://localhost:3000",
          "http://localhost:5173",
        ],
        credentials: true,
      },
    });

    this.chatService = new ChatService();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET ||
            "nexus_super_secret_key_change_in_production_2024"
        ) as any;
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.userName = decoded.fullName || decoded.full_name || "User";
        next();
      } catch (error) {
        next(new Error("Authentication error: Invalid token"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      console.log(`✅ User connected: ${socket.userId} (Socket: ${socket.id})`);

      if (socket.userId) {
        this.userSockets.set(socket.userId, socket.id);
        this.handleUserOnline(socket);
      }

      // Chat events
      socket.on("join:conversation", (data) =>
        this.handleJoinConversation(socket, data)
      );
      socket.on("leave:conversation", (data) =>
        this.handleLeaveConversation(socket, data)
      );
      socket.on("send:message", (data) => this.handleSendMessage(socket, data));
      socket.on("typing:start", (data) => this.handleTypingStart(socket, data));
      socket.on("typing:stop", (data) => this.handleTypingStop(socket, data));
      socket.on("message:read", (data) => this.handleMarkAsRead(socket, data));
      socket.on("message:delete", (data) =>
        this.handleDeleteMessage(socket, data)
      );

      // Edit/Recall/Reaction events
      socket.on("message:edit", (data) => this.handleEditMessage(socket, data));
      socket.on("message:recall", (data) =>
        this.handleRecallMessage(socket, data)
      );
      socket.on("reaction:add", (data) => this.handleAddReaction(socket, data));
      socket.on("reaction:remove", (data) =>
        this.handleRemoveReaction(socket, data)
      );

      // Call events
      socket.on("call:start", (data) => this.handleCallStart(socket, data));
      socket.on("call:accept", (data) => this.handleCallAccept(socket, data));
      socket.on("call:decline", (data) => this.handleCallDecline(socket, data));
      socket.on("call:end", (data) => this.handleCallEnd(socket, data));

      // Task realtime events
      socket.on("task:join", (data) => this.handleJoinTask(socket, data));
      socket.on("task:leave", (data) => this.handleLeaveTask(socket, data));
      socket.on("checklist:toggle", (data) =>
        this.handleChecklistToggle(socket, data)
      );
      socket.on("comment:add", (data) => this.handleCommentAdd(socket, data));
      socket.on("task:update_status", (data) =>
        this.handleTaskStatusUpdate(socket, data)
      );

      // Disconnect
      socket.on("disconnect", () => this.handleDisconnect(socket));
    });
  }

  // ==================== EVENT HANDLERS ====================

  private async handleUserOnline(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    try {
      await this.chatService.updateUserStatus(
        socket.userId,
        "online",
        socket.id
      );

      // Notify all users about online status
      this.io.emit("user:online", {
        userId: socket.userId,
        status: "online",
        timestamp: new Date().toISOString(),
      });

      // Send current online users list to the newly connected user
      const onlineUserIds = Array.from(this.userSockets.keys());
      socket.emit("users:online_list", {
        userIds: onlineUserIds,
        timestamp: new Date().toISOString(),
      });

      console.log(`📱 User ${socket.userId} is now online`);
      console.log(`👥 Current online users: ${onlineUserIds.length}`);
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  }

  private async handleJoinConversation(
    socket: AuthenticatedSocket,
    data: { conversationId: string }
  ) {
    const { conversationId } = data;

    socket.join(`conversation:${conversationId}`);
    console.log(
      `💬 User ${socket.userId} joined conversation ${conversationId}`
    );

    // Mark messages as read
    if (socket.userId) {
      await this.chatService.markMessagesAsRead(conversationId, socket.userId);

      // Notify other participant
      socket.to(`conversation:${conversationId}`).emit("messages:read", {
        conversationId,
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private handleLeaveConversation(
    socket: AuthenticatedSocket,
    data: { conversationId: string }
  ) {
    const { conversationId } = data;
    socket.leave(`conversation:${conversationId}`);
    console.log(`👋 User ${socket.userId} left conversation ${conversationId}`);
  }

  private async handleSendMessage(socket: AuthenticatedSocket, data: any) {
    console.log(`📨 handleSendMessage called by ${socket.userId}`, data);

    if (!socket.userId) {
      console.error("❌ No userId on socket");
      return;
    }

    try {
      // Check if user is banned
      const isBanned = await this.chatService.isUserBanned(socket.userId);
      console.log(`🔍 User ${socket.userId} banned status:`, isBanned);

      if (isBanned) {
        socket.emit("error", {
          code: "USER_BANNED",
          message: "Bạn đã bị cấm chat. Vui lòng liên hệ quản trị viên.",
        });
        return;
      }

      console.log("📝 Creating message in database...");
      const message = await this.chatService.sendMessage({
        conversationId: data.conversationId,
        senderId: socket.userId,
        recipientId: data.recipientId,
        messageText: data.messageText,
        messageType: data.messageType || "text",
      });

      const messagePayload = {
        message: {
          ...message,
          sender_id: message.sender_id,
          sender_name: message.sender_name || socket.userName,
          sender_avatar: message.sender_avatar,
          message_text: message.message_text,
          created_at: message.created_at,
        },
        conversationId: data.conversationId,
      };

      // Get participants to emit directly (more reliable than room-based)
      const participants = await this.chatService.getConversationParticipants(
        data.conversationId
      );
      const emittedSockets = new Set<string>();

      // Emit directly to each participant's socket (avoid duplicates)
      for (const participantId of participants) {
        const socketId = this.userSockets.get(participantId);
        if (socketId && !emittedSockets.has(socketId)) {
          this.io.to(socketId).emit("message:new", messagePayload);
          emittedSockets.add(socketId);
        }
      }

      console.log(
        `💬 Message sent in conversation ${data.conversationId} to ${emittedSockets.size} sockets`
      );
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  }

  private async handleTypingStart(
    socket: AuthenticatedSocket,
    data: { conversationId: string }
  ) {
    if (!socket.userId) return;

    try {
      await this.chatService.setTypingStatus(
        data.conversationId,
        socket.userId,
        true
      );

      socket.to(`conversation:${data.conversationId}`).emit("typing:start", {
        conversationId: data.conversationId,
        userId: socket.userId,
      });
    } catch (error) {
      console.error("Error setting typing status:", error);
    }
  }

  private async handleTypingStop(
    socket: AuthenticatedSocket,
    data: { conversationId: string }
  ) {
    if (!socket.userId) return;

    try {
      await this.chatService.setTypingStatus(
        data.conversationId,
        socket.userId,
        false
      );

      socket.to(`conversation:${data.conversationId}`).emit("typing:stop", {
        conversationId: data.conversationId,
        userId: socket.userId,
      });
    } catch (error) {
      console.error("Error clearing typing status:", error);
    }
  }

  private async handleMarkAsRead(
    socket: AuthenticatedSocket,
    data: { conversationId: string }
  ) {
    if (!socket.userId) return;

    try {
      await this.chatService.markMessagesAsRead(
        data.conversationId,
        socket.userId
      );

      socket.to(`conversation:${data.conversationId}`).emit("messages:read", {
        conversationId: data.conversationId,
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  private async handleDeleteMessage(
    socket: AuthenticatedSocket,
    data: { messageId: string; conversationId: string }
  ) {
    if (!socket.userId) return;

    try {
      const deleted = await this.chatService.deleteMessage(
        data.messageId,
        socket.userId
      );

      if (deleted) {
        this.io
          .to(`conversation:${data.conversationId}`)
          .emit("message:deleted", {
            messageId: data.messageId,
            conversationId: data.conversationId,
          });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }

  // ==================== EDIT/RECALL/REACTION HANDLERS ====================

  private async handleEditMessage(
    socket: AuthenticatedSocket,
    data: { messageId: string; conversationId: string; newText: string }
  ) {
    if (!socket.userId) return;

    try {
      const edited = await this.chatService.editMessage(
        data.messageId,
        socket.userId,
        data.newText
      );

      if (edited) {
        // Broadcast to all participants
        this.io
          .to(`conversation:${data.conversationId}`)
          .emit("message:edited", {
            messageId: data.messageId,
            conversationId: data.conversationId,
            newText: data.newText,
            editedAt: new Date().toISOString(),
          });
        console.log(`✏️ Message ${data.messageId} edited by ${socket.userId}`);
      }
    } catch (error: any) {
      console.error("Error editing message:", error);
      socket.emit("error", {
        message: error.message || "Failed to edit message",
      });
    }
  }

  private async handleRecallMessage(
    socket: AuthenticatedSocket,
    data: { messageId: string; conversationId: string }
  ) {
    if (!socket.userId) return;

    try {
      const recalled = await this.chatService.recallMessage(
        data.messageId,
        socket.userId
      );

      if (recalled) {
        // Broadcast to all participants
        this.io
          .to(`conversation:${data.conversationId}`)
          .emit("message:recalled", {
            messageId: data.messageId,
            conversationId: data.conversationId,
          });
        console.log(
          `🔄 Message ${data.messageId} recalled by ${socket.userId}`
        );
      }
    } catch (error: any) {
      console.error("Error recalling message:", error);
      socket.emit("error", {
        message: error.message || "Failed to recall message",
      });
    }
  }

  private async handleAddReaction(
    socket: AuthenticatedSocket,
    data: { messageId: string; conversationId: string; emoji: string }
  ) {
    if (!socket.userId) return;

    try {
      await this.chatService.addReaction(
        data.messageId,
        socket.userId,
        data.emoji
      );

      // Broadcast to all participants
      this.io.to(`conversation:${data.conversationId}`).emit("reaction:added", {
        messageId: data.messageId,
        conversationId: data.conversationId,
        userId: socket.userId,
        userName: socket.userName,
        emoji: data.emoji,
      });
      console.log(
        `👍 Reaction ${data.emoji} added to ${data.messageId} by ${socket.userId}`
      );
    } catch (error) {
      console.error("Error adding reaction:", error);
      socket.emit("error", { message: "Failed to add reaction" });
    }
  }

  private async handleRemoveReaction(
    socket: AuthenticatedSocket,
    data: { messageId: string; conversationId: string; emoji: string }
  ) {
    if (!socket.userId) return;

    try {
      const removed = await this.chatService.removeReaction(
        data.messageId,
        socket.userId,
        data.emoji
      );

      if (removed) {
        // Broadcast to all participants
        this.io
          .to(`conversation:${data.conversationId}`)
          .emit("reaction:removed", {
            messageId: data.messageId,
            conversationId: data.conversationId,
            userId: socket.userId,
            emoji: data.emoji,
          });
        console.log(
          `👎 Reaction ${data.emoji} removed from ${data.messageId} by ${socket.userId}`
        );
      }
    } catch (error) {
      console.error("Error removing reaction:", error);
      socket.emit("error", { message: "Failed to remove reaction" });
    }
  }

  private async handleDisconnect(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    try {
      // End any active calls for this user
      const activeCallId = this.userInCall.get(socket.userId);
      if (activeCallId) {
        const call = this.activeCalls.get(activeCallId);
        if (call) {
          // Notify the other party that the call ended
          const otherUserId =
            call.callerId === socket.userId ? call.recipientId : call.callerId;
          const otherSocketId = this.userSockets.get(otherUserId);
          if (otherSocketId) {
            this.io
              .to(otherSocketId)
              .emit("call:ended", { callId: activeCallId });
          }
          this.activeCalls.delete(activeCallId);
          this.userInCall.delete(call.callerId);
          this.userInCall.delete(call.recipientId);
        }
      }

      this.userSockets.delete(socket.userId);
      await this.chatService.updateUserStatus(socket.userId, "offline");

      this.io.emit("user:offline", {
        userId: socket.userId,
        status: "offline",
        timestamp: new Date().toISOString(),
      });

      console.log(`❌ User ${socket.userId} disconnected`);
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  }

  // ==================== CALL EVENT HANDLERS ====================

  private async handleCallStart(
    socket: AuthenticatedSocket,
    data: {
      callId: string;
      recipientId: string;
      recipientName: string;
      roomName: string;
      isVideoCall: boolean;
    }
  ) {
    if (!socket.userId) return;

    const { callId, recipientId, recipientName, roomName, isVideoCall } = data;

    console.log(
      `📞 Call started: ${socket.userId} -> ${recipientId} (${
        isVideoCall ? "Video" : "Audio"
      })`
    );

    // Check if recipient is online
    const recipientSocketId = this.userSockets.get(recipientId);
    if (!recipientSocketId) {
      socket.emit("call:error", {
        callId,
        error: "user_offline",
        message: "Người dùng không trực tuyến",
      });
      return;
    }

    // Check if recipient is already in a call
    if (this.userInCall.has(recipientId)) {
      socket.emit("call:busy", { callId, recipientId });
      return;
    }

    // Check if caller is already in a call
    if (this.userInCall.has(socket.userId)) {
      socket.emit("call:error", {
        callId,
        error: "already_in_call",
        message: "Bạn đang trong một cuộc gọi khác",
      });
      return;
    }

    // Create Daily.co room first
    let roomUrl: string;
    let callerToken: string = "";
    let recipientToken: string = "";

    try {
      const room = await dailyService.createRoom(roomName, {
        privacy: "public", // Changed to public to avoid knocking
        expiryMinutes: 60, // 1 hour expiry
        enableKnocking: false, // Disable knocking - allow direct join
      });
      roomUrl = room.url;
      console.log(`🎬 Daily.co room created: ${roomUrl}`);

      // Create tokens for both participants with their names
      // For voice calls, start with video off
      const startVideoOff = !isVideoCall;

      try {
        callerToken = await dailyService.createMeetingToken(roomName, {
          userId: socket.userId,
          userName: socket.userName || "Caller",
          isModerator: true,
          expiryMinutes: 60,
          startVideoOff, // Voice call = camera off, Video call = camera on
        });

        recipientToken = await dailyService.createMeetingToken(roomName, {
          userId: recipientId,
          userName: recipientName || "Recipient",
          isModerator: false,
          expiryMinutes: 60,
          startVideoOff, // Voice call = camera off, Video call = camera on
        });

        console.log(
          `🎫 Meeting tokens created for both participants (videoOff: ${startVideoOff})`
        );
      } catch (tokenError) {
        console.warn(
          "Failed to create meeting tokens, will use room URL only:",
          tokenError
        );
      }
    } catch (error: any) {
      console.error("Failed to create Daily.co room:", error);
      socket.emit("call:error", {
        callId,
        error: "room_creation_failed",
        message: "Không thể tạo phòng họp video",
      });
      return;
    }

    // Create call record
    const call: ActiveCall = {
      callId,
      callerId: socket.userId,
      callerName: socket.userName || "User",
      recipientId,
      recipientName,
      roomName,
      roomUrl,
      isVideoCall,
      startTime: new Date(),
    };

    this.activeCalls.set(callId, call);
    this.userInCall.set(socket.userId, callId);

    // Send room ready notification to caller with roomUrl and token
    socket.emit("call:room_ready", {
      callId,
      roomUrl,
      roomName,
      token: callerToken, // Include caller's token
    });

    // Send incoming call notification to recipient with roomUrl and token
    this.io.to(recipientSocketId).emit("call:incoming", {
      callId,
      callerId: socket.userId,
      callerName: socket.userName || "User",
      roomName,
      roomUrl, // Include full room URL
      token: recipientToken, // Include recipient's token
      isVideoCall,
    });

    console.log(
      `📲 Incoming call notification sent to ${recipientId}, tokens sent to both parties`
    );
  }

  private async handleCallAccept(
    socket: AuthenticatedSocket,
    data: { callId: string }
  ) {
    if (!socket.userId) return;

    const { callId } = data;
    const call = this.activeCalls.get(callId);

    if (!call) {
      socket.emit("call:error", { callId, error: "call_not_found" });
      return;
    }

    // Mark recipient as in call
    this.userInCall.set(socket.userId, callId);

    // Notify caller that call was accepted
    const callerSocketId = this.userSockets.get(call.callerId);
    if (callerSocketId) {
      this.io.to(callerSocketId).emit("call:accepted", {
        callId,
        recipientId: socket.userId,
        roomName: call.roomName,
      });
    }

    console.log(`✅ Call ${callId} accepted by ${socket.userId}`);
  }

  private async handleCallDecline(
    socket: AuthenticatedSocket,
    data: { callId: string; callerId: string }
  ) {
    if (!socket.userId) return;

    const { callId, callerId } = data;
    const call = this.activeCalls.get(callId);

    if (call) {
      // Notify caller that call was declined
      const callerSocketId = this.userSockets.get(callerId);
      if (callerSocketId) {
        this.io.to(callerSocketId).emit("call:declined", {
          callId,
          recipientId: socket.userId,
        });
      }

      // Clean up call data
      this.activeCalls.delete(callId);
      this.userInCall.delete(call.callerId);
    }

    console.log(`❌ Call ${callId} declined by ${socket.userId}`);
  }

  private async handleCallEnd(
    socket: AuthenticatedSocket,
    data: { callId: string; recipientId: string }
  ) {
    if (!socket.userId) return;

    const { callId, recipientId } = data;
    const call = this.activeCalls.get(callId);

    if (call) {
      // Notify the other party
      const recipientSocketId = this.userSockets.get(recipientId);
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit("call:ended", { callId });
      }

      // Clean up call data
      this.activeCalls.delete(callId);
      this.userInCall.delete(call.callerId);
      this.userInCall.delete(call.recipientId);
    }

    console.log(`📴 Call ${callId} ended by ${socket.userId}`);
  }

  // ==================== TASK REALTIME HANDLERS ====================

  private handleJoinTask(
    socket: AuthenticatedSocket,
    data: { taskId: string }
  ) {
    const { taskId } = data;
    socket.join(`task:${taskId}`);
    console.log(`📋 User ${socket.userId} joined task room: ${taskId}`);
  }

  private handleLeaveTask(
    socket: AuthenticatedSocket,
    data: { taskId: string }
  ) {
    const { taskId } = data;
    socket.leave(`task:${taskId}`);
    console.log(`👋 User ${socket.userId} left task room: ${taskId}`);
  }

  private async handleChecklistToggle(
    socket: AuthenticatedSocket,
    data: { taskId: string; checklistId: string; isCompleted: boolean }
  ) {
    if (!socket.userId) return;

    const { taskId, checklistId, isCompleted } = data;

    try {
      // Broadcast to all users viewing this task (except sender)
      socket.to(`task:${taskId}`).emit("checklist:toggled", {
        taskId,
        checklistId,
        isCompleted,
        userId: socket.userId,
        userName: socket.userName || "User",
        timestamp: new Date().toISOString(),
      });

      console.log(
        `✅ Checklist ${checklistId} toggled to ${isCompleted} by ${socket.userId}`
      );
    } catch (error) {
      console.error("Error broadcasting checklist toggle:", error);
      socket.emit("error", { message: "Failed to sync checklist update" });
    }
  }

  private async handleCommentAdd(
    socket: AuthenticatedSocket,
    data: { taskId: string; content: string }
  ) {
    if (!socket.userId) return;

    const { taskId, content } = data;

    try {
      // Create comment object for broadcast
      const comment = {
        id: `temp-${Date.now()}`, // Will be replaced by actual ID from API
        userName: socket.userName || "User",
        userAvatar: "", // Could fetch from user service
        text: content,
        timestamp: new Date().toLocaleString("vi-VN"),
      };

      // Broadcast to all users viewing this task (except sender)
      socket.to(`task:${taskId}`).emit("comment:added", {
        taskId,
        comment,
        userId: socket.userId,
      });

      console.log(`💬 Comment added to task ${taskId} by ${socket.userId}`);
    } catch (error) {
      console.error("Error broadcasting comment:", error);
      socket.emit("error", { message: "Failed to sync comment" });
    }
  }

  private async handleTaskStatusUpdate(
    socket: AuthenticatedSocket,
    data: { taskId: string; status: string }
  ) {
    if (!socket.userId) return;

    const { taskId, status } = data;

    try {
      // Broadcast to all users viewing this task (except sender)
      socket.to(`task:${taskId}`).emit("task:status_updated", {
        taskId,
        status,
        userId: socket.userId,
        userName: socket.userName || "User",
        timestamp: new Date().toISOString(),
      });

      console.log(
        `📊 Task ${taskId} status updated to ${status} by ${socket.userId}`
      );
    } catch (error) {
      console.error("Error broadcasting status update:", error);
      socket.emit("error", { message: "Failed to sync status update" });
    }
  }

  // ==================== UTILITY METHODS ====================

  public emitToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public emitToTask(taskId: string, event: string, data: any) {
    this.io.to(`task:${taskId}`).emit(event, data);
  }

  public getIO() {
    return this.io;
  }
}
