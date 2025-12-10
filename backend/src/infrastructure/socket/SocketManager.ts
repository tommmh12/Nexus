import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { ChatService } from "../../application/services/ChatService.js";
import jwt from "jsonwebtoken";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class SocketManager {
  private io: SocketIOServer;
  private chatService: ChatService;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

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

      console.log(`📱 User ${socket.userId} is now online`);
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
    if (!socket.userId) return;

    try {
      const message = await this.chatService.sendMessage({
        conversationId: data.conversationId,
        senderId: socket.userId,
        recipientId: data.recipientId,
        messageText: data.messageText,
        messageType: data.messageType || "text",
      });

      // Emit to conversation room (including sender)
      this.io.to(`conversation:${data.conversationId}`).emit("message:new", {
        message,
        conversationId: data.conversationId,
      });

      // Also emit to both users directly (in case they're not in the conversation room yet)
      if (data.recipientId) {
        const recipientSocketId = this.userSockets.get(data.recipientId);
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit("message:new", {
            message,
            conversationId: data.conversationId,
          });
        }
      }

      console.log(`💬 Message sent in conversation ${data.conversationId}`);
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

  private async handleDisconnect(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    try {
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

  // ==================== UTILITY METHODS ====================

  public emitToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public getIO() {
    return this.io;
  }
}
