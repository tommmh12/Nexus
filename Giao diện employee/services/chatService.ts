
export const chatService = {
  getConversations: async () => ({ success: true, data: [] }),
  getGroups: async () => ({ success: true, data: [] }),
  getMessages: async (id: string) => ({ success: true, data: [] }),
  markAsRead: async (id: string) => ({ success: true }),
  searchUsers: async (q: string) => ({ success: true, data: [] }),
  getOrCreateConversation: async (uid: string) => ({ success: true }),
  createGroup: async (name: string, uids: string[]) => ({ success: true }),
  uploadAttachment: async (data: any) => ({ success: true })
};
