import axios from "axios";
import { ForumPost, ForumCategory } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAccessToken = () => localStorage.getItem("accessToken");

export const forumService = {
  async getCategories(): Promise<ForumCategory[]> {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }
    const response = await axios.get(`${API_URL}/forum/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || [];
  },

  async getPosts(status?: "Pending" | "Approved" | "Rejected"): Promise<ForumPost[]> {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }
    const params = status ? { status } : {};
    const response = await axios.get(`${API_URL}/forum/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data.data || [];
  },

  async getPostById(id: string): Promise<ForumPost | null> {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${API_URL}/forum/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data || null;
    } catch (error) {
      console.error("Error fetching post by id:", error);
      return null;
    }
  },

  async createPost(postData: Partial<ForumPost>): Promise<ForumPost> {
    try {
      const token = getAccessToken();
      const response = await axios.post(
        `${API_URL}/forum/posts`,
        {
          category_id: postData.categoryId,
          title: postData.title,
          content: postData.content,
          tags: postData.tags || [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error creating post:", error);
      throw new Error(error.response?.data?.message || "Không thể tạo bài viết");
    }
  },

  async updatePost(id: string, postData: Partial<ForumPost>): Promise<ForumPost> {
    try {
      const token = getAccessToken();
      const response = await axios.put(
        `${API_URL}/forum/posts/${id}`,
        {
          title: postData.title,
          content: postData.content,
          category_id: postData.categoryId,
          status: postData.status,
          is_pinned: postData.isPinned,
          tags: postData.tags,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error updating post:", error);
      throw new Error(error.response?.data?.message || "Không thể cập nhật bài viết");
    }
  },

  async deletePost(id: string): Promise<void> {
    try {
      const token = getAccessToken();
      await axios.delete(`${API_URL}/forum/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      console.error("Error deleting post:", error);
      throw new Error(error.response?.data?.message || "Không thể xóa bài viết");
    }
  },

  async approvePost(id: string): Promise<ForumPost> {
    try {
      const token = getAccessToken();
      const response = await axios.post(
        `${API_URL}/forum/posts/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error approving post:", error);
      throw new Error(error.response?.data?.message || "Không thể duyệt bài viết");
    }
  },

  async rejectPost(id: string): Promise<ForumPost> {
    try {
      const token = getAccessToken();
      const response = await axios.post(
        `${API_URL}/forum/posts/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error rejecting post:", error);
      throw new Error(error.response?.data?.message || "Không thể từ chối bài viết");
    }
  },

  // Category management
  async createCategory(categoryData: Partial<ForumCategory & { order?: number }>): Promise<ForumCategory> {
    try {
      const token = getAccessToken();
      const response = await axios.post(
        `${API_URL}/forum/categories`,
        {
          name: categoryData.name,
          description: categoryData.description,
          icon: categoryData.icon,
          color: categoryData.color,
          order: (categoryData as any).order || 0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error creating category:", error);
      throw new Error(error.response?.data?.message || "Không thể tạo chuyên mục");
    }
  },

  async updateCategory(id: string, categoryData: Partial<ForumCategory & { order?: number }>): Promise<ForumCategory> {
    try {
      const token = getAccessToken();
      const response = await axios.put(
        `${API_URL}/forum/categories/${id}`,
        {
          name: categoryData.name,
          description: categoryData.description,
          icon: categoryData.icon,
          color: categoryData.color,
          order: (categoryData as any).order || 0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error updating category:", error);
      throw new Error(error.response?.data?.message || "Không thể cập nhật chuyên mục");
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      const token = getAccessToken();
      await axios.delete(`${API_URL}/forum/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      console.error("Error deleting category:", error);
      throw new Error(error.response?.data?.message || "Không thể xóa chuyên mục");
    }
  },
};

