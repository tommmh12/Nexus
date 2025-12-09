import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwt.config.js";

interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
  role?: string;
}

export class SocketServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) || 
                ["http://localhost:3000", "http://localhost:5173"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      try {
        const jwtSecret = getJwtSecret();
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        
        socket.userId = decoded.userId;
        socket.email = decoded.email;
        socket.role = decoded.role;
        
        next();
      } catch (error) {
        next(new Error("Authentication error: Invalid token"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      this.connectedUsers.set(userId, socket.id);

      console.log(`✅ WebSocket connected: ${socket.email} (${socket.id})`);

      // Join default rooms
      socket.join("forum:all");
      socket.join("news:all");

      // Handle room subscriptions
      socket.on("subscribe", (room: string) => {
        socket.join(room);
        console.log(`📥 ${socket.email} subscribed to ${room}`);
      });

      socket.on("unsubscribe", (room: string) => {
        socket.leave(room);
        console.log(`📤 ${socket.email} unsubscribed from ${room}`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        this.connectedUsers.delete(userId);
        console.log(`❌ WebSocket disconnected: ${socket.email} (${socket.id})`);
      });
    });
  }

  // Emit events to specific rooms
  emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Emit events to all connected clients
  emitToAll(event: string, data: any) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Emit events to specific user
  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Forum events
  emitForumPostCreated(post: any) {
    this.emitToRoom("forum:all", "forum:post:created", { post });
    this.emitToRoom(`forum:post:${post.id}`, "forum:post:created", { post });
  }

  emitForumPostUpdated(post: any) {
    this.emitToRoom("forum:all", "forum:post:updated", { post });
    this.emitToRoom(`forum:post:${post.id}`, "forum:post:updated", { post });
  }

  emitForumPostApproved(post: any) {
    this.emitToRoom("forum:all", "forum:post:approved", { post });
    this.emitToRoom(`forum:post:${post.id}`, "forum:post:approved", { post });
    // Notify author
    if (post.authorId) {
      this.emitToUser(post.authorId, "forum:post:approved", { post });
    }
  }

  emitForumPostRejected(post: any) {
    this.emitToRoom("forum:all", "forum:post:rejected", { post });
    this.emitToRoom(`forum:post:${post.id}`, "forum:post:rejected", { post });
    // Notify author
    if (post.authorId) {
      this.emitToUser(post.authorId, "forum:post:rejected", { post });
    }
  }

  // News events
  emitNewsArticleCreated(article: any) {
    this.emitToRoom("news:all", "news:article:created", { article });
    this.emitToRoom(`news:article:${article.id}`, "news:article:created", { article });
  }

  emitNewsArticleUpdated(article: any) {
    this.emitToRoom("news:all", "news:article:updated", { article });
    this.emitToRoom(`news:article:${article.id}`, "news:article:updated", { article });
  }

  emitNewsArticlePublished(article: any) {
    this.emitToRoom("news:all", "news:article:published", { article });
    this.emitToRoom(`news:article:${article.id}`, "news:article:published", { article });
  }

  emitNewsArticleArchived(article: any) {
    this.emitToRoom("news:all", "news:article:archived", { article });
    this.emitToRoom(`news:article:${article.id}`, "news:article:archived", { article });
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}

// Singleton instance
let socketServerInstance: SocketServer | null = null;

export const initializeSocketServer = (httpServer: HTTPServer): SocketServer => {
  if (!socketServerInstance) {
    socketServerInstance = new SocketServer(httpServer);
  }
  return socketServerInstance;
};

export const getSocketServer = (): SocketServer | null => {
  return socketServerInstance;
};

