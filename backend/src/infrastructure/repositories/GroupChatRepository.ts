import { dbPool } from "../database/connection.js";
import { RowDataPacket } from "mysql2";

export class GroupChatRepository {
  private db = dbPool;

  // ==================== AUTHORIZATION ====================

  /**
   * Check if user is member of a group
   */
  async isUserInGroup(userId: string, groupId: string): Promise<boolean> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND is_active = 1 LIMIT 1`,
      [groupId, userId]
    );
    return rows.length > 0;
  }

  /**
   * Check if user is admin of a group
   */
  async isUserGroupAdmin(userId: string, groupId: string): Promise<boolean> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'admin' AND is_active = 1 LIMIT 1`,
      [groupId, userId]
    );
    return rows.length > 0;
  }

  /**
   * Get user's role in group
   */
  async getUserGroupRole(userId: string, groupId: string): Promise<string | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND is_active = 1 LIMIT 1`,
      [groupId, userId]
    );
    return rows.length > 0 ? rows[0].role : null;
  }

  // Create a new group conversation
  async createGroupConversation(
    name: string,
    createdBy: string,
    avatarUrl?: string
  ): Promise<string> {
    const [result]: any = await this.db.execute(
      `INSERT INTO group_conversations (id, name, created_by, avatar_url) 
       VALUES (UUID(), ?, ?, ?)`,
      [name, createdBy, avatarUrl || null]
    );

    const [rows]: any = await this.db.execute(
      `SELECT id FROM group_conversations WHERE created_by = ? ORDER BY created_at DESC LIMIT 1`,
      [createdBy]
    );

    return rows[0].id;
  }

  // Add members to group
  async addGroupMembers(
    groupId: string,
    userIds: string[],
    role: "admin" | "member" = "member"
  ): Promise<void> {
    const values = userIds.map((userId) => [groupId, userId, role]);

    for (const value of values) {
      await this.db.execute(
        `INSERT INTO group_members (id, group_id, user_id, role) 
         VALUES (UUID(), ?, ?, ?)`,
        value
      );
    }
  }

  // Get user's group conversations
  async getUserGroupConversations(userId: string): Promise<RowDataPacket[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT 
        gc.id,
        gc.name,
        gc.avatar_url,
        gc.created_by,
        gc.created_at,
        (SELECT COUNT(*) FROM group_members WHERE group_id = gc.id AND is_active = 1) as member_count,
        (SELECT message_text FROM group_messages WHERE group_id = gc.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM group_messages WHERE group_id = gc.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM group_messages gm
         LEFT JOIN group_message_read_status gmrs ON gm.id = gmrs.message_id AND gmrs.user_id = ?
         WHERE gm.group_id = gc.id AND gm.sender_id != ? AND gmrs.id IS NULL) as unread_count
       FROM group_conversations gc
       INNER JOIN group_members gm ON gc.id = gm.group_id
       WHERE gm.user_id = ? AND gm.is_active = 1 AND gc.is_active = 1
       ORDER BY last_message_time DESC`,
      [userId, userId, userId]
    );
    return rows;
  }

  // Get group members
  async getGroupMembers(groupId: string): Promise<RowDataPacket[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT 
        gm.id,
        gm.user_id,
        gm.role,
        gm.joined_at,
        u.full_name,
        u.email,
        u.avatar_url,
        uos.status
       FROM group_members gm
       INNER JOIN users u ON gm.user_id = u.id
       LEFT JOIN user_online_status uos ON u.id = uos.user_id
       WHERE gm.group_id = ? AND gm.is_active = 1
       ORDER BY gm.role DESC, u.full_name ASC`,
      [groupId]
    );
    return rows;
  }

  // Send group message
  async sendGroupMessage(
    groupId: string,
    senderId: string,
    messageText: string,
    messageType: "text" | "image" | "file" | "system" = "text"
  ): Promise<string> {
    const [result]: any = await this.db.execute(
      `INSERT INTO group_messages (id, group_id, sender_id, message_text, message_type) 
       VALUES (UUID(), ?, ?, ?, ?)`,
      [groupId, senderId, messageText, messageType]
    );

    const [rows]: any = await this.db.execute(
      `SELECT id FROM group_messages WHERE group_id = ? ORDER BY created_at DESC LIMIT 1`,
      [groupId]
    );

    return rows[0].id;
  }

  // Get group messages
  async getGroupMessages(
    groupId: string,
    limit: number = 50
  ): Promise<RowDataPacket[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT 
        gm.id,
        gm.group_id,
        gm.sender_id,
        gm.message_text,
        gm.message_type,
        gm.created_at,
        u.full_name as sender_name,
        u.avatar_url as sender_avatar,
        (SELECT COUNT(*) FROM group_message_read_status WHERE message_id = gm.id) as read_count
       FROM group_messages gm
       INNER JOIN users u ON gm.sender_id = u.id
       WHERE gm.group_id = ? AND gm.is_deleted = 0
       ORDER BY gm.created_at DESC
       LIMIT ?`,
      [groupId, limit]
    );
    return rows.reverse();
  }

  // Mark group message as read
  async markGroupMessageAsRead(
    messageId: string,
    userId: string
  ): Promise<void> {
    await this.db.execute(
      `INSERT IGNORE INTO group_message_read_status (id, message_id, user_id) 
       VALUES (UUID(), ?, ?)`,
      [messageId, userId]
    );
  }

  // Remove member from group
  async removeMember(groupId: string, userId: string): Promise<void> {
    await this.db.execute(
      `UPDATE group_members SET is_active = 0 WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );
  }

  // Update group info
  async updateGroupInfo(
    groupId: string,
    name?: string,
    avatarUrl?: string
  ): Promise<void> {
    if (name) {
      await this.db.execute(
        `UPDATE group_conversations SET name = ? WHERE id = ?`,
        [name, groupId]
      );
    }
    if (avatarUrl) {
      await this.db.execute(
        `UPDATE group_conversations SET avatar_url = ? WHERE id = ?`,
        [avatarUrl, groupId]
      );
    }
  }

  // Update member role
  async updateMemberRole(
    groupId: string,
    userId: string,
    role: "admin" | "member"
  ): Promise<void> {
    await this.db.execute(
      `UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?`,
      [role, groupId, userId]
    );
  }

  // Get group info
  async getGroupInfo(groupId: string): Promise<RowDataPacket | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT * FROM group_conversations WHERE id = ? AND is_active = 1`,
      [groupId]
    );
    return rows[0] || null;
  }

  // Delete group (soft delete)
  async deleteGroup(groupId: string): Promise<void> {
    await this.db.execute(
      `UPDATE group_conversations SET is_active = 0 WHERE id = ?`,
      [groupId]
    );
  }
}
