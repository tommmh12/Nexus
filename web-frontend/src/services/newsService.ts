import axios from "axios";
import { NewsArticle } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAccessToken = () => localStorage.getItem("accessToken");

export const newsService = {
  async getAll(status?: "Draft" | "Published" | "Archived"): Promise<NewsArticle[]> {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }
    const params = status ? { status } : {};
    const response = await axios.get(`${API_URL}/news`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data.data || [];
  },

  async getPublished(): Promise<NewsArticle[]> {
    return await this.getAll("Published");
  },

  async getById(id: string): Promise<NewsArticle | null> {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${API_URL}/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data || null;
    } catch (error) {
      console.error("Error fetching news by id:", error);
      return null;
    }
  },

  async createArticle(articleData: Partial<NewsArticle>): Promise<NewsArticle> {
    try {
      const token = getAccessToken();
      const response = await axios.post(
        `${API_URL}/news`,
        {
          title: articleData.title,
          summary: articleData.summary,
          content: articleData.content,
          cover_image: articleData.coverImage,
          category: articleData.category,
          is_featured: articleData.isFeatured || false,
          read_time: articleData.readTime,
          tags: articleData.tags || [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error creating article:", error);
      throw new Error(error.response?.data?.message || "Không thể tạo bài viết");
    }
  },

  async updateArticle(id: string, articleData: Partial<NewsArticle>): Promise<NewsArticle> {
    try {
      const token = getAccessToken();
      const response = await axios.put(
        `${API_URL}/news/${id}`,
        {
          title: articleData.title,
          summary: articleData.summary,
          content: articleData.content,
          cover_image: articleData.coverImage,
          category: articleData.category,
          status: articleData.status,
          is_featured: articleData.isFeatured,
          read_time: articleData.readTime,
          tags: articleData.tags,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error updating article:", error);
      throw new Error(error.response?.data?.message || "Không thể cập nhật bài viết");
    }
  },

  async deleteArticle(id: string): Promise<void> {
    try {
      const token = getAccessToken();
      await axios.delete(`${API_URL}/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      console.error("Error deleting article:", error);
      throw new Error(error.response?.data?.message || "Không thể xóa bài viết");
    }
  },

  async publishArticle(id: string): Promise<NewsArticle> {
    try {
      const token = getAccessToken();
      const response = await axios.post(
        `${API_URL}/news/${id}/publish`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error publishing article:", error);
      throw new Error(error.response?.data?.message || "Không thể xuất bản bài viết");
    }
  },

  async archiveArticle(id: string): Promise<NewsArticle> {
    try {
      const token = getAccessToken();
      const response = await axios.post(
        `${API_URL}/news/${id}/archive`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error archiving article:", error);
      throw new Error(error.response?.data?.message || "Không thể lưu trữ bài viết");
    }
  },
};

