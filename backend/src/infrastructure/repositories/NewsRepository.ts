import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../database/connection.js";
import { randomUUID } from "crypto";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  cover_image: string | null;
  category: "Strategy" | "Event" | "Culture" | "Announcement";
  author_id: string;
  status: "Draft" | "Published" | "Archived";
  is_featured: boolean;
  read_time: string | null;
  view_count: number;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface NewsArticleWithDetails extends NewsArticle {
  author_name: string;
  author_avatar: string;
  author_dept: string;
}

export class NewsRepository {
  async getAllArticles(status?: "Draft" | "Published" | "Archived"): Promise<NewsArticleWithDetails[]> {
    let query = `
      SELECT 
        na.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        d.name as author_dept
      FROM news_articles na
      LEFT JOIN users u ON na.author_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE na.deleted_at IS NULL
    `;
    
    const params: any[] = [];
    if (status) {
      query += ` AND na.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY na.is_featured DESC, na.published_at DESC, na.created_at DESC`;
    
    const [rows] = await dbPool.query<RowDataPacket[]>(query, params);
    return rows as NewsArticleWithDetails[];
  }

  async getArticleById(id: string): Promise<NewsArticleWithDetails | null> {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT 
        na.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        d.name as author_dept
      FROM news_articles na
      LEFT JOIN users u ON na.author_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE na.id = ? AND na.deleted_at IS NULL
      LIMIT 1`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as NewsArticleWithDetails) : null;
  }

  async createArticle(data: {
    title: string;
    summary?: string;
    content: string;
    cover_image?: string;
    category: "Strategy" | "Event" | "Culture" | "Announcement";
    author_id: string;
    status?: "Draft" | "Published" | "Archived";
    is_featured?: boolean;
    read_time?: string;
  }): Promise<NewsArticle> {
    const id = randomUUID();
    const status = data.status || "Draft";
    const is_featured = data.is_featured || false;
    const published_at = status === "Published" ? new Date() : null;
    
    await dbPool.query<ResultSetHeader>(
      `INSERT INTO news_articles 
        (id, title, summary, content, cover_image, category, author_id, status, 
         is_featured, read_time, published_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        data.title,
        data.summary || null,
        data.content,
        data.cover_image || null,
        data.category,
        data.author_id,
        status,
        is_featured,
        data.read_time || null,
        published_at,
      ]
    );

    const article = await this.getArticleById(id);
    if (!article) throw new Error("Failed to create article");
    
    return article as NewsArticle;
  }

  async updateArticle(id: string, data: Partial<{
    title: string;
    summary: string;
    content: string;
    cover_image: string;
    category: "Strategy" | "Event" | "Culture" | "Announcement";
    status: "Draft" | "Published" | "Archived";
    is_featured: boolean;
    read_time: string;
  }>): Promise<NewsArticle> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      params.push(data.title);
    }
    if (data.summary !== undefined) {
      updates.push("summary = ?");
      params.push(data.summary);
    }
    if (data.content !== undefined) {
      updates.push("content = ?");
      params.push(data.content);
    }
    if (data.cover_image !== undefined) {
      updates.push("cover_image = ?");
      params.push(data.cover_image);
    }
    if (data.category !== undefined) {
      updates.push("category = ?");
      params.push(data.category);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      params.push(data.status);
      
      // Auto-set published_at when status changes to Published
      if (data.status === "Published") {
        updates.push("published_at = COALESCE(published_at, NOW())");
      }
    }
    if (data.is_featured !== undefined) {
      updates.push("is_featured = ?");
      params.push(data.is_featured);
    }
    if (data.read_time !== undefined) {
      updates.push("read_time = ?");
      params.push(data.read_time);
    }

    if (updates.length === 0) {
      const article = await this.getArticleById(id);
      if (!article) throw new Error("Article not found");
      return article as NewsArticle;
    }

    updates.push("updated_at = NOW()");
    params.push(id);

    await dbPool.query<ResultSetHeader>(
      `UPDATE news_articles SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    const article = await this.getArticleById(id);
    if (!article) throw new Error("Article not found");
    return article as NewsArticle;
  }

  async deleteArticle(id: string): Promise<void> {
    await dbPool.query<ResultSetHeader>(
      `UPDATE news_articles SET deleted_at = NOW() WHERE id = ?`,
      [id]
    );
  }

  async incrementViewCount(id: string): Promise<void> {
    await dbPool.query<ResultSetHeader>(
      `UPDATE news_articles SET view_count = view_count + 1 WHERE id = ?`,
      [id]
    );
  }

  // Tags
  async getArticleTags(articleId: string): Promise<string[]> {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT tag_name FROM news_article_tags WHERE article_id = ?`,
      [articleId]
    );
    return rows.map((row) => row.tag_name);
  }

  async setArticleTags(articleId: string, tags: string[]): Promise<void> {
    // Delete existing tags
    await dbPool.query<ResultSetHeader>(
      `DELETE FROM news_article_tags WHERE article_id = ?`,
      [articleId]
    );

    // Insert new tags
    if (tags.length > 0) {
      const values = tags.map(() => `(?, ?, ?)`).join(", ");
      const params: any[] = [];
      tags.forEach((tag) => {
        params.push(randomUUID(), articleId, tag);
      });
      
      await dbPool.query<ResultSetHeader>(
        `INSERT INTO news_article_tags (id, article_id, tag_name) VALUES ${values}`,
        params
      );
    }
  }
}

