import axios from "axios";

const API_URL = "http://localhost:5000/api/chat";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const chatService = {
  // Get all conversations
  getConversations: async () => {
    const response = await axios.get(
      `${API_URL}/conversations`,
      getAuthHeader()
    );
    return response.data;
  },

  // Get or create conversation with user
  getOrCreateConversation: async (otherUserId: string) => {
    const response = await axios.get(
      `${API_URL}/conversations/with/${otherUserId}`,
      getAuthHeader()
    );
    return response.data;
  },

  // Get messages for conversation
  getMessages: async (conversationId: string, limit = 50, offset = 0) => {
    const response = await axios.get(
      `${API_URL}/conversations/${conversationId}/messages`,
      {
        ...getAuthHeader(),
        params: { limit, offset },
      }
    );
    return response.data;
  },

  // Send message (REST backup)
  sendMessage: async (messageData: {
    conversationId?: string;
    recipientId?: string;
    messageText: string;
    messageType?: string;
  }) => {
    const response = await axios.post(
      `${API_URL}/messages`,
      messageData,
      getAuthHeader()
    );
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (conversationId: string) => {
    const response = await axios.put(
      `${API_URL}/conversations/${conversationId}/read`,
      {},
      getAuthHeader()
    );
    return response.data;
  },

  // Delete message
  deleteMessage: async (messageId: string) => {
    const response = await axios.delete(
      `${API_URL}/messages/${messageId}`,
      getAuthHeader()
    );
    return response.data;
  },

  // Search messages
  searchMessages: async (query: string) => {
    const response = await axios.get(`${API_URL}/search`, {
      ...getAuthHeader(),
      params: { q: query },
    });
    return response.data;
  },

  // Get online users
  getOnlineUsers: async () => {
    const response = await axios.get(
      `${API_URL}/online-users`,
      getAuthHeader()
    );
    return response.data;
  },

  // Upload attachment
  uploadAttachment: async (formData: FormData) => {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Search users to start new chat
  searchUsers: async (query?: string) => {
    const response = await axios.get(`${API_URL}/users`, {
      ...getAuthHeader(),
      params: query ? { q: query } : {},
    });
    return response.data;
  },

  // Group chat services
  createGroup: async (name: string, memberIds: string[]) => {
    const response = await axios.post(
      `${API_URL}/groups`,
      { name, memberIds },
      getAuthHeader()
    );
    return response.data;
  },

  getGroups: async () => {
    const response = await axios.get(`${API_URL}/groups`, getAuthHeader());
    return response.data;
  },

  getGroupMembers: async (groupId: string) => {
    const response = await axios.get(
      `${API_URL}/groups/${groupId}/members`,
      getAuthHeader()
    );
    return response.data;
  },

  getGroupMessages: async (groupId: string, limit?: number) => {
    const response = await axios.get(`${API_URL}/groups/${groupId}/messages`, {
      ...getAuthHeader(),
      params: limit ? { limit } : {},
    });
    return response.data;
  },

  sendGroupMessage: async (
    groupId: string,
    messageText: string,
    messageType: string = "text"
  ) => {
    const response = await axios.post(
      `${API_URL}/groups/${groupId}/messages`,
      { messageText, messageType },
      getAuthHeader()
    );
    return response.data;
  },
};
