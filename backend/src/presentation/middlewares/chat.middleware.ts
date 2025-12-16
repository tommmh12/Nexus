import { Request, Response, NextFunction } from "express";
import { ChatRepository } from "../../infrastructure/repositories/ChatRepository.js";
import { GroupChatRepository } from "../../infrastructure/repositories/GroupChatRepository.js";

const chatRepo = new ChatRepository();
const groupRepo = new GroupChatRepository();

/**
 * Middleware to check if user is participant of a conversation
 */
export const isConversationParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    const conversationId = req.params.conversationId || req.body.conversationId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!conversationId) {
      return next(); // No conversation ID to check, let the route handle it
    }

    const isParticipant = await chatRepo.isUserInConversation(
      userId,
      conversationId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập cuộc hội thoại này",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking conversation access:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra quyền truy cập",
    });
  }
};

/**
 * Middleware to check if user is member of a group
 */
export const isGroupMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    const groupId = req.params.groupId || req.body.groupId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!groupId) {
      return next();
    }

    const isMember = await groupRepo.isUserInGroup(userId, groupId);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Bạn không phải thành viên của nhóm này",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking group membership:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra quyền truy cập nhóm",
    });
  }
};

/**
 * Middleware to check if user is group admin
 */
export const isGroupAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    const groupId = req.params.groupId || req.body.groupId;

    if (!userId || !groupId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    const isAdmin = await groupRepo.isUserGroupAdmin(userId, groupId);

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn cần quyền admin để thực hiện hành động này",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking group admin:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra quyền admin",
    });
  }
};

/**
 * Middleware to check if user can moderate chat (admin or department-manager)
 */
export const canModerateChat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRole = (req as any).user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const canModerate = ["admin", "department-manager"].includes(userRole);

    if (!canModerate) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền kiểm duyệt chat",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking moderation permission:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra quyền kiểm duyệt",
    });
  }
};

/**
 * Rate limiting for chat messages
 */
const messageRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 30;

export const rateLimitMessages = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const now = Date.now();
  const userLimit = messageRateLimit.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new window
    messageRateLimit.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return next();
  }

  if (userLimit.count >= MAX_MESSAGES_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: "Bạn đang gửi tin nhắn quá nhanh. Vui lòng chờ một chút.",
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
    });
  }

  userLimit.count++;
  next();
};
