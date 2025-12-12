import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export interface ForumPost {
  id: string;
  categoryId: string;
  categoryName?: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  title: string;
  content: string;
  status: "Pending" | "Approved" | "Rejected";
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationNotes?: string;
  isPinned: boolean;
  viewCount: number;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  content: string;
  parentId?: string;
  upvoteCount: number;
  downvoteCount: number;
  createdAt: Date;
}

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  colorClass?: string;
  order: number;
}

export const forumService = {
  getCategories: async (): Promise<ForumCategory[]> => {
    const response = await axios.get(`${API_URL}/forum/categories`);
    return response.data;
  },

  createCategory: async (
    category: Partial<ForumCategory>
  ): Promise<ForumCategory> => {
    const response = await axios.post(`${API_URL}/forum/categories`, category, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateCategory: async (
    id: string,
    category: Partial<ForumCategory>
  ): Promise<ForumCategory> => {
    const response = await axios.put(
      `${API_URL}/forum/categories/${id}`,
      category,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/forum/categories/${id}`, {
      headers: getAuthHeader(),
    });
  },

  getAllPosts: async (filters?: {
    status?: string;
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ForumPost[]> => {
    const response = await axios.get(`${API_URL}/forum`, {
      headers: getAuthHeader(),
      params: filters,
    });
    return response.data;
  },

  getPostById: async (id: string): Promise<ForumPost> => {
    const response = await axios.get(`${API_URL}/forum/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createPost: async (post: Partial<ForumPost>): Promise<ForumPost> => {
    const response = await axios.post(`${API_URL}/forum`, post, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updatePost: async (
    id: string,
    post: Partial<ForumPost>
  ): Promise<ForumPost> => {
    const response = await axios.put(`${API_URL}/forum/${id}`, post, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  moderatePost: async (
    id: string,
    status: "Approved" | "Rejected",
    notes?: string
  ): Promise<ForumPost> => {
    const response = await axios.post(
      `${API_URL}/forum/${id}/moderate`,
      { status, notes },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/forum/${id}`, {
      headers: getAuthHeader(),
    });
  },

  toggleVote: async (
    id: string,
    voteType: 1 | -1
  ): Promise<{
    voted: boolean;
    upvoteCount: number;
    downvoteCount: number;
  }> => {
    const response = await axios.post(
      `${API_URL}/forum/${id}/vote`,
      { voteType },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getComments: async (postId: string): Promise<ForumComment[]> => {
    const response = await axios.get(`${API_URL}/forum/${postId}/comments`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createComment: async (
    postId: string,
    comment: { content: string; parentId?: string }
  ): Promise<ForumComment> => {
    const response = await axios.post(
      `${API_URL}/forum/${postId}/comments`,
      comment,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // ==================== REACTIONS ====================

  toggleReaction: async (
    targetType: "post" | "comment",
    targetId: string,
    reactionType: "like" | "love" | "laugh" | "wow" | "sad" | "angry"
  ): Promise<{ reacted: boolean; reactions: Record<string, number> }> => {
    const response = await axios.post(
      `${API_URL}/forum/${targetType}/${targetId}/reaction`,
      { reactionType },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getReactions: async (
    targetType: "post" | "comment",
    targetId: string
  ): Promise<{
    reactions: Record<string, number>;
    userReaction: string | null;
  }> => {
    const response = await axios.get(
      `${API_URL}/forum/${targetType}/${targetId}/reactions`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // ==================== ATTACHMENTS ====================

  getPostAttachments: async (postId: string): Promise<any[]> => {
    const response = await axios.get(`${API_URL}/forum/${postId}/attachments`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  addAttachment: async (
    postId: string,
    attachment: {
      fileName: string;
      filePath: string;
      fileType: string;
      fileSize: number;
      mimeType: string;
    }
  ): Promise<any> => {
    const response = await axios.post(
      `${API_URL}/forum/${postId}/attachments`,
      attachment,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await axios.delete(`${API_URL}/forum/attachments/${attachmentId}`, {
      headers: getAuthHeader(),
    });
  },

  // ==================== HOT TOPICS ====================

  getHotTopics: async (limit: number = 5): Promise<ForumPost[]> => {
    const response = await axios.get(`${API_URL}/forum/hot-topics`, {
      headers: getAuthHeader(),
      params: { limit },
    });
    return response.data;
  },

  // ==================== USER STATS ====================

  getUserForumStats: async (
    userId: string
  ): Promise<{
    postCount: number;
    commentCount: number;
    karmaPoints: number;
    joinDate: Date | null;
  }> => {
    const response = await axios.get(`${API_URL}/forum/user-stats/${userId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
