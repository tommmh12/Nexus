import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../database/connection.js";
import { randomUUID } from "crypto";

export interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color_class: string | null;
  order: number;
  created_at: Date;
  updated_at: Date;
}

export interface ForumPost {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  status: "Pending" | "Approved" | "Rejected";
  is_pinned: boolean;
  view_count: number;
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ForumPostWithDetails extends ForumPost {
  author_name: string;
  author_avatar: string;
  author_dept: string;
  category_name: string;
}

export class ForumRepository {
  // Categories
  async getAllCategories(): Promise<ForumCategory[]> {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT * FROM forum_categories ORDER BY \`order\` ASC, name ASC`
    );
    return rows as ForumCategory[];
  }

  async getCategoryById(id: string): Promise<ForumCategory | null> {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT * FROM forum_categories WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as ForumCategory) : null;
  }

  async createCategory(data: {
    name: string;
    description?: string;
    icon?: string;
    color_class?: string;
    order?: number;
  }): Promise<ForumCategory> {
    const id = randomUUID();
    const order = data.order ?? 0;
    
    await dbPool.query<ResultSetHeader>(
      `INSERT INTO forum_categories 
        (id, name, description, icon, color_class, \`order\`, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        data.name,
        data.description || null,
        data.icon || null,
        data.color_class || null,
        order,
      ]
    );

    const category = await this.getCategoryById(id);
    if (!category) throw new Error("Failed to create category");
    return category;
  }

  async updateCategory(id: string, data: Partial<{
    name: string;
    description: string;
    icon: string;
    color_class: string;
    order: number;
  }>): Promise<ForumCategory> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      params.push(data.description);
    }
    if (data.icon !== undefined) {
      updates.push("icon = ?");
      params.push(data.icon);
    }
    if (data.color_class !== undefined) {
      updates.push("color_class = ?");
      params.push(data.color_class);
    }
    if (data.order !== undefined) {
      updates.push("`order` = ?");
      params.push(data.order);
    }

    if (updates.length === 0) {
      const category = await this.getCategoryById(id);
      if (!category) throw new Error("Category not found");
      return category;
    }

    updates.push("updated_at = NOW()");
    params.push(id);

    await dbPool.query<ResultSetHeader>(
      `UPDATE forum_categories SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    const category = await this.getCategoryById(id);
    if (!category) throw new Error("Category not found");
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    // Check if category has posts
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM forum_posts WHERE category_id = ? AND deleted_at IS NULL`,
      [id]
    );
    
    if (rows[0].count > 0) {
      throw new Error("Không thể xóa chuyên mục vì còn bài viết. Vui lòng di chuyển hoặc xóa các bài viết trước.");
    }

    await dbPool.query<ResultSetHeader>(
      `DELETE FROM forum_categories WHERE id = ?`,
      [id]
    );
  }

  // Posts
  async getAllPosts(status?: "Pending" | "Approved" | "Rejected"): Promise<ForumPostWithDetails[]> {
    let query = `
      SELECT 
        fp.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        d.name as author_dept,
        fc.name as category_name
      FROM forum_posts fp
      LEFT JOIN users u ON fp.author_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN forum_categories fc ON fp.category_id = fc.id
      WHERE fp.deleted_at IS NULL
    `;
    
    const params: any[] = [];
    if (status) {
      query += ` AND fp.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY fp.is_pinned DESC, fp.created_at DESC`;
    
    const [rows] = await dbPool.query<RowDataPacket[]>(query, params);
    return rows as ForumPostWithDetails[];
  }

  async getPostById(id: string): Promise<ForumPostWithDetails | null> {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT 
        fp.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        d.name as author_dept,
        fc.name as category_name
      FROM forum_posts fp
      LEFT JOIN users u ON fp.author_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN forum_categories fc ON fp.category_id = fc.id
      WHERE fp.id = ? AND fp.deleted_at IS NULL
      LIMIT 1`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as ForumPostWithDetails) : null;
  }

  async createPost(data: {
    category_id: string;
    author_id: string;
    title: string;
    content: string;
    status?: "Pending" | "Approved" | "Rejected";
  }): Promise<ForumPost> {
    const id = randomUUID();
    const status = data.status || "Pending";
    
    await dbPool.query<ResultSetHeader>(
      `INSERT INTO forum_posts 
        (id, category_id, author_id, title, content, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, data.category_id, data.author_id, data.title, data.content, status]
    );

    const post = await this.getPostById(id);
    if (!post) throw new Error("Failed to create post");
    
    return post as ForumPost;
  }

  async updatePost(id: string, data: Partial<{
    title: string;
    content: string;
    category_id: string;
    status: "Pending" | "Approved" | "Rejected";
    is_pinned: boolean;
  }>): Promise<ForumPost> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      params.push(data.title);
    }
    if (data.content !== undefined) {
      updates.push("content = ?");
      params.push(data.content);
    }
    if (data.category_id !== undefined) {
      updates.push("category_id = ?");
      params.push(data.category_id);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      params.push(data.status);
    }
    if (data.is_pinned !== undefined) {
      updates.push("is_pinned = ?");
      params.push(data.is_pinned);
    }

    if (updates.length === 0) {
      const post = await this.getPostById(id);
      if (!post) throw new Error("Post not found");
      return post as ForumPost;
    }

    updates.push("updated_at = NOW()");
    params.push(id);

    await dbPool.query<ResultSetHeader>(
      `UPDATE forum_posts SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    const post = await this.getPostById(id);
    if (!post) throw new Error("Post not found");
    return post as ForumPost;
  }

  async deletePost(id: string): Promise<void> {
    await dbPool.query<ResultSetHeader>(
      `UPDATE forum_posts SET deleted_at = NOW() WHERE id = ?`,
      [id]
    );
  }

  async incrementViewCount(id: string): Promise<void> {
    await dbPool.query<ResultSetHeader>(
      `UPDATE forum_posts SET view_count = view_count + 1 WHERE id = ?`,
      [id]
    );
  }

  // Tags
  async getPostTags(postId: string): Promise<string[]> {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT tag_name FROM forum_post_tags WHERE post_id = ?`,
      [postId]
    );
    return rows.map((row) => row.tag_name);
  }

  async setPostTags(postId: string, tags: string[]): Promise<void> {
    // Delete existing tags
    await dbPool.query<ResultSetHeader>(
      `DELETE FROM forum_post_tags WHERE post_id = ?`,
      [postId]
    );

    // Insert new tags
    if (tags.length > 0) {
      const values = tags.map(() => `(?, ?, ?)`).join(", ");
      const params: any[] = [];
      tags.forEach((tag) => {
        params.push(randomUUID(), postId, tag);
      });
      
      await dbPool.query<ResultSetHeader>(
        `INSERT INTO forum_post_tags (id, post_id, tag_name) VALUES ${values}`,
        params
      );
    }
  }
}

