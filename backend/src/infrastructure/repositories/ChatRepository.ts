import { dbPool } from "../database/connection.js";
import crypto from "crypto";

export class ChatRepository {
  private db = dbPool;

  // ==================== AUTHORIZATION ====================

  /**
   * Check if user is participant of a conversation
   */
  async isUserInConversation(userId: string, conversationId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM conversations 
      WHERE id = ? AND (participant1_id = ? OR participant2_id = ?)
      LIMIT 1
    `;
    const [rows]: any = await this.db.query(query, [conversationId, userId, userId]);
    return rows.length > 0;
  }

  /**
   * Check if user is owner of a message
   */
  async isMessageOwner(userId: string, messageId: string): Promise<boolean> {
    const query = `SELECT 1 FROM chat_messages WHERE id = ? AND sender_id = ? LIMIT 1`;
    const [rows]: any = await this.db.query(query, [messageId, userId]);
    return rows.length > 0;
  }

  /**
   * Get conversation participants
   */
  async getConversationParticipants(conversationId: string): Promise<string[]> {
    const query = `SELECT participant1_id, participant2_id FROM conversations WHERE id = ? LIMIT 1`;
    const [rows]: any = await this.db.query(query, [conversationId]);
    if (rows.length === 0) return [];
    return [rows[0].participant1_id, rows[0].participant2_id];
  }

  // ==================== CONVERSATIONS ====================

  async getOrCreateConversation(user1Id: string, user2Id: string) {
    // Sort IDs to ensure consistent conversation lookup
    const [p1, p2] = [user1Id, user2Id].sort();

    const query = `
      SELECT * FROM conversations 
      WHERE (participant1_id = ? AND participant2_id = ?)
         OR (participant1_id = ? AND participant2_id = ?)
      LIMIT 1
    `;

    const [rows]: any = await this.db.query(query, [p1, p2, p2, p1]);

    if (rows.length > 0) {
      return rows[0];
    }

    // Create new conversation
    const conversationId = crypto.randomUUID();
    const insertQuery = `
      INSERT INTO conversations (id, participant1_id, participant2_id)
      VALUES (?, ?, ?)
    `;

    await this.db.query(insertQuery, [conversationId, p1, p2]);

    return {
      id: conversationId,
      participant1_id: p1,
      participant2_id: p2,
      created_at: new Date().toISOString(),
    };
  }

  async getUserConversations(userId: string) {
    const query = `
      SELECT 
        c.*,
        CASE 
          WHEN c.participant1_id = ? THEN u2.id
          ELSE u1.id
        END as other_user_id,
        CASE 
          WHEN c.participant1_id = ? THEN u2.full_name
          ELSE u1.full_name
        END as other_user_name,
        CASE 
          WHEN c.participant1_id = ? THEN u2.email
          ELSE u1.email
        END as other_user_email,
        CASE 
          WHEN c.participant1_id = ? THEN u2.avatar_url
          ELSE u1.avatar_url
        END as other_user_avatar,
        COALESCE(status.status, 'offline') as other_user_status,
        status.last_seen as other_user_last_seen,
        lm.message_text as last_message_text,
        lm.created_at as last_message_time,
        lm.sender_id as last_message_sender_id,
        (SELECT COUNT(*) FROM chat_messages 
         WHERE conversation_id = c.id 
           AND sender_id != ? 
           AND is_read = FALSE 
           AND is_deleted = FALSE) as unread_count
      FROM conversations c
      LEFT JOIN users u1 ON c.participant1_id = u1.id
      LEFT JOIN users u2 ON c.participant2_id = u2.id
      LEFT JOIN user_online_status status ON 
        CASE 
          WHEN c.participant1_id = ? THEN status.user_id = u2.id
          ELSE status.user_id = u1.id
        END
      LEFT JOIN chat_messages lm ON c.last_message_id = lm.id
      WHERE c.participant1_id = ? OR c.participant2_id = ?
      ORDER BY c.last_updated DESC
    `;

    const [rows]: any = await this.db.query(query, [
      userId,
      userId,
      userId,
      userId,
      userId,
      userId,
      userId,
      userId,
    ]);

    return rows;
  }

  async updateConversationLastMessage(
    conversationId: string,
    messageId: string
  ) {
    const query = `
      UPDATE conversations 
      SET last_message_id = ?, last_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await this.db.query(query, [messageId, conversationId]);
  }

  // ==================== MESSAGES ====================

  async createMessage(messageData: {
    conversationId: string;
    senderId: string;
    messageText?: string;
    messageType?: string;
  }) {
    const messageId = crypto.randomUUID();

    const query = `
      INSERT INTO chat_messages (
        id, conversation_id, sender_id, message_text, message_type
      ) VALUES (?, ?, ?, ?, ?)
    `;

    await this.db.query(query, [
      messageId,
      messageData.conversationId,
      messageData.senderId,
      messageData.messageText || null,
      messageData.messageType || "text",
    ]);

    // Update conversation's last message
    await this.updateConversationLastMessage(
      messageData.conversationId,
      messageId
    );

    return messageId;
  }

  async getConversationMessages(
    conversationId: string,
    limit = 50,
    offset = 0
  ) {
    const query = `
      SELECT 
        m.*,
        u.full_name as sender_name,
        u.email as sender_email,
        u.avatar_url as sender_avatar,
        a.id as attachment_id,
        a.file_name,
        a.file_path,
        a.file_type,
        a.file_size,
        a.mime_type
      FROM chat_messages m
      LEFT JOIN users u ON m.sender_id = u.id
      LEFT JOIN chat_attachments a ON m.id = a.message_id
      WHERE m.conversation_id = ? AND m.is_deleted = FALSE
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows]: any = await this.db.query(query, [
      conversationId,
      limit,
      offset,
    ]);

    return rows.reverse(); // Return in chronological order
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    const query = `
      UPDATE chat_messages 
      SET is_read = TRUE
      WHERE conversation_id = ? 
        AND sender_id != ? 
        AND is_read = FALSE
    `;

    await this.db.query(query, [conversationId, userId]);
  }

  async deleteMessage(messageId: string, userId: string) {
    const query = `
      UPDATE chat_messages 
      SET is_deleted = TRUE
      WHERE id = ? AND sender_id = ?
    `;

    const [result]: any = await this.db.query(query, [messageId, userId]);
    return result.affectedRows > 0;
  }

  // Get single message by ID
  async getMessage(messageId: string) {
    const query = `
      SELECT m.*, u.full_name as sender_name, u.avatar_url as sender_avatar
      FROM chat_messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `;
    const [rows]: any = await this.db.query(query, [messageId]);
    return rows[0] || null;
  }

  // Edit message (only owner, within time limit)
  async editMessage(messageId: string, userId: string, newText: string, editWindowMs: number = 5 * 60 * 1000) {
    // First check if message exists, is owned by user, and is within edit window
    const message = await this.getMessage(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.sender_id !== userId) {
      throw new Error("Cannot edit message from another user");
    }

    const createdAt = new Date(message.created_at).getTime();
    if (Date.now() - createdAt > editWindowMs) {
      throw new Error("Edit time limit exceeded");
    }

    // Store original text if first edit (for audit)
    const originalText = message.original_text || message.message_text;

    const query = `
      UPDATE chat_messages 
      SET message_text = ?, 
          edited_at = CURRENT_TIMESTAMP,
          original_text = ?
      WHERE id = ? AND sender_id = ?
    `;

    const [result]: any = await this.db.query(query, [newText, originalText, messageId, userId]);
    return result.affectedRows > 0;
  }

  // Recall message (soft delete, keeps audit trail)
  async recallMessage(messageId: string, userId: string) {
    const message = await this.getMessage(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.sender_id !== userId) {
      throw new Error("Cannot recall message from another user");
    }

    // Store original text for audit before recalling
    const originalText = message.original_text || message.message_text;

    const query = `
      UPDATE chat_messages 
      SET is_recalled = TRUE,
          original_text = ?,
          message_text = 'Tin nhắn này đã được thu hồi'
      WHERE id = ? AND sender_id = ?
    `;

    const [result]: any = await this.db.query(query, [originalText, messageId, userId]);
    return result.affectedRows > 0;
  }

  // ==================== REACTIONS ====================

  async addReaction(messageId: string, userId: string, emoji: string) {
    const reactionId = crypto.randomUUID();

    const query = `
      INSERT INTO message_reactions (id, message_id, user_id, emoji)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
    `;

    try {
      await this.db.query(query, [reactionId, messageId, userId, emoji]);
      return reactionId;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        // Reaction already exists, that's fine
        return null;
      }
      throw error;
    }
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    const query = `
      DELETE FROM message_reactions 
      WHERE message_id = ? AND user_id = ? AND emoji = ?
    `;

    const [result]: any = await this.db.query(query, [messageId, userId, emoji]);
    return result.affectedRows > 0;
  }

  async getMessageReactions(messageId: string) {
    const query = `
      SELECT 
        r.emoji,
        r.created_at,
        r.user_id,
        u.full_name as user_name,
        u.avatar_url as user_avatar
      FROM message_reactions r
      JOIN users u ON r.user_id = u.id
      WHERE r.message_id = ?
      ORDER BY r.created_at ASC
    `;

    const [rows]: any = await this.db.query(query, [messageId]);
    return rows;
  }

  // Get reaction summary (count per emoji)
  async getMessageReactionSummary(messageId: string) {
    const query = `
      SELECT emoji, COUNT(*) as count
      FROM message_reactions
      WHERE message_id = ?
      GROUP BY emoji
      ORDER BY count DESC
    `;

    const [rows]: any = await this.db.query(query, [messageId]);
    return rows;
  }

  // ==================== ATTACHMENTS ====================

  async createAttachment(attachmentData: {
    messageId: string;
    fileName: string;
    filePath: string;
    fileType?: string;
    fileSize?: number;
    mimeType?: string;
  }) {
    const attachmentId = crypto.randomUUID();

    const query = `
      INSERT INTO chat_attachments (
        id, message_id, file_name, file_path, file_type, file_size, mime_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.query(query, [
      attachmentId,
      attachmentData.messageId,
      attachmentData.fileName,
      attachmentData.filePath,
      attachmentData.fileType || null,
      attachmentData.fileSize || null,
      attachmentData.mimeType || null,
    ]);

    return attachmentId;
  }

  async getMessageAttachments(messageId: string) {
    const query = `SELECT * FROM chat_attachments WHERE message_id = ?`;
    const [rows]: any = await this.db.query(query, [messageId]);
    return rows;
  }

  // ==================== ONLINE STATUS ====================

  async updateUserStatus(userId: string, status: string, socketId?: string) {
    const query = `
      INSERT INTO user_online_status (user_id, status, socket_id, last_seen)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE 
        status = ?,
        socket_id = ?,
        last_seen = CURRENT_TIMESTAMP
    `;

    await this.db.query(query, [
      userId,
      status,
      socketId || null,
      status,
      socketId || null,
    ]);
  }

  async getUserStatus(userId: string) {
    const query = `SELECT * FROM user_online_status WHERE user_id = ?`;
    const [rows]: any = await this.db.query(query, [userId]);
    return rows[0] || { status: "offline" };
  }

  async getOnlineUsers() {
    const query = `
      SELECT u.id, u.full_name, u.email, s.status, s.last_seen
      FROM user_online_status s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'online'
    `;

    const [rows]: any = await this.db.query(query);
    return rows;
  }

  // ==================== TYPING INDICATORS ====================

  async setTypingStatus(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ) {
    const query = `
      INSERT INTO typing_indicators (id, conversation_id, user_id, is_typing)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        is_typing = ?,
        updated_at = CURRENT_TIMESTAMP
    `;

    const id = crypto.randomUUID();
    await this.db.query(query, [
      id,
      conversationId,
      userId,
      isTyping,
      isTyping,
    ]);
  }

  async getTypingUsers(conversationId: string) {
    const query = `
      SELECT t.*, u.full_name
      FROM typing_indicators t
      JOIN users u ON t.user_id = u.id
      WHERE t.conversation_id = ? AND t.is_typing = TRUE
        AND TIMESTAMPDIFF(SECOND, t.updated_at, NOW()) < 5
    `;

    const [rows]: any = await this.db.query(query, [conversationId]);
    return rows;
  }

  // ==================== SEARCH ====================

  async searchMessages(userId: string, searchTerm: string) {
    // Try FULLTEXT search first, fallback to LIKE if not available
    try {
      const fulltextQuery = `
        SELECT 
          m.*,
          c.participant1_id,
          c.participant2_id,
          u.full_name as sender_name,
          MATCH(m.message_text) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
        FROM chat_messages m
        JOIN conversations c ON m.conversation_id = c.id
        JOIN users u ON m.sender_id = u.id
        WHERE (c.participant1_id = ? OR c.participant2_id = ?)
          AND MATCH(m.message_text) AGAINST(? IN NATURAL LANGUAGE MODE)
          AND m.is_deleted = FALSE
        ORDER BY relevance DESC, m.created_at DESC
        LIMIT 50
      `;

      const [rows]: any = await this.db.query(fulltextQuery, [
        searchTerm,
        userId,
        userId,
        searchTerm,
      ]);

      return rows;
    } catch (err) {
      // Fallback to LIKE search if FULLTEXT index doesn't exist
      const likeQuery = `
        SELECT 
          m.*,
          c.participant1_id,
          c.participant2_id,
          u.full_name as sender_name
        FROM chat_messages m
        JOIN conversations c ON m.conversation_id = c.id
        JOIN users u ON m.sender_id = u.id
        WHERE (c.participant1_id = ? OR c.participant2_id = ?)
          AND m.message_text LIKE ?
          AND m.is_deleted = FALSE
        ORDER BY m.created_at DESC
        LIMIT 50
      `;

      const [rows]: any = await this.db.query(likeQuery, [
        userId,
        userId,
        `%${searchTerm}%`,
      ]);

      return rows;
    }
  }

  // ==================== MODERATION ====================

  /**
   * Delete message by moderator (admin/manager)
   */
  async moderateDeleteMessage(messageId: string, moderatorId: string, reason?: string) {
    const query = `
      UPDATE chat_messages 
      SET is_deleted = TRUE, 
          deleted_by = ?,
          deletion_reason = ?,
          deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result]: any = await this.db.query(query, [moderatorId, reason || null, messageId]);
    return result.affectedRows > 0;
  }

  /**
   * Report a message
   */
  async reportMessage(messageId: string, reporterId: string, reason: string) {
    const reportId = crypto.randomUUID();
    const query = `
      INSERT INTO message_reports (id, message_id, reporter_id, reason, status)
      VALUES (?, ?, ?, ?, 'pending')
    `;
    await this.db.query(query, [reportId, messageId, reporterId, reason]);
    return reportId;
  }

  /**
   * Get reported messages
   */
  async getReportedMessages() {
    const query = `
      SELECT 
        r.id as report_id,
        r.reason as report_reason,
        r.status as report_status,
        r.created_at as reported_at,
        m.*,
        u.full_name as sender_name,
        reporter.full_name as reporter_name
      FROM message_reports r
      JOIN chat_messages m ON r.message_id = m.id
      JOIN users u ON m.sender_id = u.id
      JOIN users reporter ON r.reporter_id = reporter.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT 100
    `;
    const [rows]: any = await this.db.query(query);
    return rows;
  }

  // ==================== USER BAN ====================

  /**
   * Ban user from chat
   */
  async banUserFromChat(userId: string, moderatorId: string, reason?: string, durationHours?: number) {
    const banId = crypto.randomUUID();
    const expiresAt = durationHours 
      ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
      : null;

    const query = `
      INSERT INTO chat_bans (id, user_id, banned_by, reason, expires_at)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        banned_by = ?,
        reason = ?,
        expires_at = ?,
        created_at = CURRENT_TIMESTAMP
    `;
    await this.db.query(query, [
      banId, userId, moderatorId, reason || null, expiresAt,
      moderatorId, reason || null, expiresAt
    ]);
    return banId;
  }

  /**
   * Unban user from chat
   */
  async unbanUserFromChat(userId: string) {
    const query = `DELETE FROM chat_bans WHERE user_id = ?`;
    const [result]: any = await this.db.query(query, [userId]);
    return result.affectedRows > 0;
  }

  /**
   * Check if user is banned
   */
  async isUserBanned(userId: string): Promise<boolean> {
    try {
      const query = `
        SELECT 1 FROM chat_bans 
        WHERE user_id = ? 
          AND (expires_at IS NULL OR expires_at > NOW())
        LIMIT 1
      `;
      const [rows]: any = await this.db.query(query, [userId]);
      return rows.length > 0;
    } catch (error: any) {
      // If table doesn't exist, user is not banned
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('chat_bans table does not exist, skipping ban check');
        return false;
      }
      throw error;
    }
  }

  /**
   * Get user's ban info
   */
  async getUserBanInfo(userId: string) {
    const query = `
      SELECT cb.*, u.full_name as banned_by_name
      FROM chat_bans cb
      JOIN users u ON cb.banned_by = u.id
      WHERE cb.user_id = ? 
        AND (cb.expires_at IS NULL OR cb.expires_at > NOW())
      LIMIT 1
    `;
    const [rows]: any = await this.db.query(query, [userId]);
    return rows[0] || null;
  }
}
