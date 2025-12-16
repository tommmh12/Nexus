import { ChatRepository } from "../../infrastructure/repositories/ChatRepository.js";

export class ChatService {
  private chatRepo = new ChatRepository();

  async getOrCreateConversation(user1Id: string, user2Id: string) {
    return await this.chatRepo.getOrCreateConversation(user1Id, user2Id);
  }

  async getUserConversations(userId: string) {
    return await this.chatRepo.getUserConversations(userId);
  }

  async sendMessage(messageData: {
    conversationId?: string;
    senderId: string;
    recipientId?: string;
    messageText?: string;
    messageType?: string;
  }) {
    let conversationId = messageData.conversationId;

    // If no conversation ID, create or get conversation with recipient
    if (!conversationId && messageData.recipientId) {
      const conversation = await this.chatRepo.getOrCreateConversation(
        messageData.senderId,
        messageData.recipientId
      );
      conversationId = conversation.id;
    }

    if (!conversationId) {
      throw new Error("No conversation ID or recipient ID provided");
    }

    await this.chatRepo.createMessage({
      conversationId,
      senderId: messageData.senderId,
      messageText: messageData.messageText,
      messageType: messageData.messageType || "text",
    });

    // Get the created message with full details
    const messages = await this.chatRepo.getConversationMessages(
      conversationId,
      1
    );
    return messages[0];
  }

  async getConversationMessages(
    conversationId: string,
    limit?: number,
    offset?: number
  ) {
    return await this.chatRepo.getConversationMessages(
      conversationId,
      limit,
      offset
    );
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    await this.chatRepo.markMessagesAsRead(conversationId, userId);
  }

  async deleteMessage(messageId: string, userId: string) {
    return await this.chatRepo.deleteMessage(messageId, userId);
  }

  async updateUserStatus(userId: string, status: string, socketId?: string) {
    await this.chatRepo.updateUserStatus(userId, status, socketId);
  }

  async getUserStatus(userId: string) {
    return await this.chatRepo.getUserStatus(userId);
  }

  async getOnlineUsers() {
    return await this.chatRepo.getOnlineUsers();
  }

  async setTypingStatus(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ) {
    await this.chatRepo.setTypingStatus(conversationId, userId, isTyping);
  }

  async getTypingUsers(conversationId: string) {
    return await this.chatRepo.getTypingUsers(conversationId);
  }

  async searchMessages(userId: string, searchTerm: string) {
    return await this.chatRepo.searchMessages(userId, searchTerm);
  }

  async createAttachment(attachmentData: {
    messageId: string;
    fileName: string;
    filePath: string;
    fileType?: string;
    fileSize?: number;
    mimeType?: string;
  }) {
    return await this.chatRepo.createAttachment(attachmentData);
  }

  async getMessageAttachments(messageId: string) {
    return await this.chatRepo.getMessageAttachments(messageId);
  }

  // ==================== EDIT/RECALL ====================

  async getMessage(messageId: string) {
    return await this.chatRepo.getMessage(messageId);
  }

  async editMessage(messageId: string, userId: string, newText: string) {
    return await this.chatRepo.editMessage(messageId, userId, newText);
  }

  async recallMessage(messageId: string, userId: string) {
    return await this.chatRepo.recallMessage(messageId, userId);
  }

  // ==================== REACTIONS ====================

  async addReaction(messageId: string, userId: string, emoji: string) {
    return await this.chatRepo.addReaction(messageId, userId, emoji);
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    return await this.chatRepo.removeReaction(messageId, userId, emoji);
  }

  async getMessageReactions(messageId: string) {
    return await this.chatRepo.getMessageReactions(messageId);
  }

  async getMessageReactionSummary(messageId: string) {
    return await this.chatRepo.getMessageReactionSummary(messageId);
  }

  // ==================== MODERATION ====================

  async moderateDeleteMessage(messageId: string, moderatorId: string, reason?: string) {
    return await this.chatRepo.moderateDeleteMessage(messageId, moderatorId, reason);
  }

  async getReportedMessages() {
    return await this.chatRepo.getReportedMessages();
  }

  async banUserFromChat(userId: string, moderatorId: string, reason?: string, duration?: number) {
    return await this.chatRepo.banUserFromChat(userId, moderatorId, reason, duration);
  }

  async unbanUserFromChat(userId: string) {
    return await this.chatRepo.unbanUserFromChat(userId);
  }

  async isUserBanned(userId: string) {
    return await this.chatRepo.isUserBanned(userId);
  }

  async reportMessage(messageId: string, reporterId: string, reason: string) {
    return await this.chatRepo.reportMessage(messageId, reporterId, reason);
  }

  async getConversationParticipants(conversationId: string) {
    return await this.chatRepo.getConversationParticipants(conversationId);
  }
}
