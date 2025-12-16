import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  content: string;
  coverImage?: string;
  category: "Strategy" | "Event" | "Culture" | "Announcement";
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  status: "Draft" | "Published" | "Archived";
  moderationStatus: "Pending" | "Approved" | "Rejected";
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationNotes?: string;
  isPublic: boolean;
  isFeatured: boolean;
  readTime?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface NewsComment {
  id: string;
  articleId: string;
  userId?: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  parentId?: string;
  moderationStatus: "Pending" | "Approved" | "Rejected";
  likeCount: number;
  createdAt: Date;
}

export const newsService = {
  // Public endpoints
  getPublicArticles: async (limit = 50, offset = 0): Promise<NewsArticle[]> => {
    const response = await axios.get(`${API_URL}/news/public`, {
      params: { limit, offset },
    });
    return response.data;
  },

  getPublicArticleById: async (id: string): Promise<NewsArticle> => {
    const response = await axios.get(`${API_URL}/news/public/${id}`);
    return response.data;
  },

  toggleLike: async (
    id: string
  ): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await axios.post(
      `${API_URL}/news/public/${id}/like`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getComments: async (articleId: string): Promise<NewsComment[]> => {
    const response = await axios.get(
      `${API_URL}/news/public/${articleId}/comments`
    );
    return response.data;
  },

  createComment: async (
    articleId: string,
    comment: {
      content: string;
      authorName: string;
      authorEmail?: string;
      parentId?: string;
    }
  ): Promise<NewsComment> => {
    const response = await axios.post(
      `${API_URL}/news/public/${articleId}/comments`,
      comment,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Admin endpoints
  getAllArticles: async (filters?: {
    status?: string;
    moderationStatus?: string;
    isPublic?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<NewsArticle[]> => {
    const response = await axios.get(`${API_URL}/news`, {
      headers: getAuthHeader(),
      params: filters,
    });
    return response.data;
  },

  getArticleById: async (id: string): Promise<NewsArticle> => {
    const response = await axios.get(`${API_URL}/news/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createArticle: async (
    article: Partial<NewsArticle>
  ): Promise<NewsArticle> => {
    const response = await axios.post(`${API_URL}/news`, article, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateArticle: async (
    id: string,
    article: Partial<NewsArticle>
  ): Promise<NewsArticle> => {
    const response = await axios.put(`${API_URL}/news/${id}`, article, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  moderateArticle: async (
    id: string,
    status: "Approved" | "Rejected",
    notes?: string
  ): Promise<NewsArticle> => {
    const response = await axios.post(
      `${API_URL}/news/${id}/moderate`,
      { status, notes },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  deleteArticle: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/news/${id}`, {
      headers: getAuthHeader(),
    });
  },

  moderateComment: async (
    commentId: string,
    status: "Approved" | "Rejected",
    notes?: string
  ): Promise<void> => {
    await axios.post(
      `${API_URL}/news/comments/${commentId}/moderate`,
      { status, notes },
      { headers: getAuthHeader() }
    );
  },

  // Department Access Management
  getDepartmentsWithAccess: async (): Promise<
    Array<{
      id: string;
      departmentId: string;
      departmentName: string;
      departmentCode: string;
      createdAt: Date;
      createdBy: string | null;
    }>
  > => {
    const response = await axios.get(`${API_URL}/news/department-access`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getAllDepartments: async (): Promise<
    Array<{
      id: string;
      name: string;
      departmentCode: string;
    }>
  > => {
    const response = await axios.get(`${API_URL}/news/departments`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  addDepartmentAccess: async (departmentId: string): Promise<void> => {
    await axios.post(
      `${API_URL}/news/department-access`,
      { departmentId },
      { headers: getAuthHeader() }
    );
  },

  removeDepartmentAccess: async (departmentId: string): Promise<void> => {
    await axios.delete(`${API_URL}/news/department-access/${departmentId}`, {
      headers: getAuthHeader(),
    });
  },

  checkDepartmentAccess: async (departmentId: string): Promise<boolean> => {
    const response = await axios.get(
      `${API_URL}/news/department-access/check/${departmentId}`
    );
    return response.data.hasAccess;
  },
};
