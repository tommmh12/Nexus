import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../database/connection.js";
import { ForumPost, ForumComment } from "../../domain/entities/ForumPost.js";

export class ForumRepository {
  private db = dbPool;

  async findAll(options?: {
    status?: string;
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ForumPost[]> {
    let query = `
      SELECT 
        fp.*,
        fc.name as categoryName,
        u.full_name as authorName,
        u.avatar_url as authorAvatar,
        GROUP_CONCAT(DISTINCT fpt.tag_name) as tags
      FROM forum_posts fp
      LEFT JOIN forum_categories fc ON fp.category_id = fc.id
      LEFT JOIN users u ON fp.author_id = u.id
      LEFT JOIN forum_post_tags fpt ON fp.id = fpt.post_id
      WHERE fp.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (options?.status) {
      query += ` AND fp.status = ?`;
      params.push(options.status);
    }

    if (options?.categoryId) {
      query += ` AND fp.category_id = ?`;
      params.push(options.categoryId);
    }

    query += ` GROUP BY fp.id ORDER BY fp.is_pinned DESC, fp.created_at DESC`;

    if (options?.limit) {
      query += ` LIMIT ?`;
      params.push(options.limit);
      if (options.offset) {
        query += ` OFFSET ?`;
        params.push(options.offset);
      }
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows.map(this.mapRowToPost);
  }

  async findById(id: string): Promise<ForumPost | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `
      SELECT 
        fp.*,
        fc.name as categoryName,
        u.full_name as authorName,
        u.avatar_url as authorAvatar,
        GROUP_CONCAT(DISTINCT fpt.tag_name) as tags
      FROM forum_posts fp
      LEFT JOIN forum_categories fc ON fp.category_id = fc.id
      LEFT JOIN users u ON fp.author_id = u.id
      LEFT JOIN forum_post_tags fpt ON fp.id = fpt.post_id
      WHERE fp.id = ? AND fp.deleted_at IS NULL
      GROUP BY fp.id
    `,
      [id]
    );
    return rows.length > 0 ? this.mapRowToPost(rows[0]) : null;
  }

  async create(post: Partial<ForumPost>): Promise<ForumPost> {
    const postId = crypto.randomUUID();
    await this.db.query<ResultSetHeader>(
      `INSERT INTO forum_posts (
        id, category_id, author_id, title, content, status
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        postId,
        post.categoryId,
        post.authorId,
        post.title,
        post.content,
        post.status || "Pending",
      ]
    );

    // Insert tags if provided
    if (post.tags && post.tags.length > 0) {
      for (const tag of post.tags) {
        await this.db.query(
          `INSERT INTO forum_post_tags (id, post_id, tag_name) VALUES (?, ?, ?)`,
          [crypto.randomUUID(), postId, tag]
        );
      }
    }

    const created = await this.findById(postId);
    if (!created) throw new Error("Failed to create post");
    return created;
  }

  async update(id: string, post: Partial<ForumPost>): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];

    if (post.title !== undefined) {
      updates.push("title = ?");
      params.push(post.title);
    }
    if (post.content !== undefined) {
      updates.push("content = ?");
      params.push(post.content);
    }
    if (post.status !== undefined) {
      updates.push("status = ?");
      params.push(post.status);
    }
    if (post.moderatedBy !== undefined) {
      updates.push("moderated_by = ?");
      params.push(post.moderatedBy);
    }
    if (post.moderatedAt !== undefined) {
      updates.push("moderated_at = ?");
      params.push(post.moderatedAt);
    }
    if (post.moderationNotes !== undefined) {
      updates.push("moderation_notes = ?");
      params.push(post.moderationNotes);
    }
    if (post.isPinned !== undefined) {
      updates.push("is_pinned = ?");
      params.push(post.isPinned);
    }

    if (updates.length === 0) return;

    params.push(id);
    await this.db.query(
      `UPDATE forum_posts SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    // Update tags if provided
    if (post.tags !== undefined) {
      await this.db.query(`DELETE FROM forum_post_tags WHERE post_id = ?`, [id]);
      for (const tag of post.tags) {
        await this.db.query(
          `INSERT INTO forum_post_tags (id, post_id, tag_name) VALUES (?, ?, ?)`,
          [crypto.randomUUID(), id, tag]
        );
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.query(
      `UPDATE forum_posts SET deleted_at = NOW() WHERE id = ?`,
      [id]
    );
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.db.query(
      `UPDATE forum_posts SET view_count = view_count + 1 WHERE id = ?`,
      [id]
    );
  }

  async toggleVote(postId: string, userId: string, voteType: 1 | -1): Promise<{ voted: boolean; upvoteCount: number; downvoteCount: number }> {
    // Check if already voted
    const [existing] = await this.db.query<RowDataPacket[]>(
      `SELECT id, vote_type FROM forum_votes WHERE user_id = ? AND votable_type = 'post' AND votable_id = ?`,
      [userId, postId]
    );

    if (existing.length > 0) {
      const existingVote = existing[0].vote_type;
      if (existingVote === voteType) {
        // Remove vote
        await this.db.query(
          `DELETE FROM forum_votes WHERE user_id = ? AND votable_type = 'post' AND votable_id = ?`,
          [userId, postId]
        );
      } else {
        // Update vote
        await this.db.query(
          `UPDATE forum_votes SET vote_type = ? WHERE user_id = ? AND votable_type = 'post' AND votable_id = ?`,
          [voteType, userId, postId]
        );
      }
    } else {
      // Create vote
      await this.db.query(
        `INSERT INTO forum_votes (id, user_id, votable_type, votable_id, vote_type) VALUES (?, ?, 'post', ?, ?)`,
        [crypto.randomUUID(), userId, postId, voteType]
      );
    }

    // Get updated counts
    const [upvotes] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM forum_votes WHERE votable_type = 'post' AND votable_id = ? AND vote_type = 1`,
      [postId]
    );
    const [downvotes] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM forum_votes WHERE votable_type = 'post' AND votable_id = ? AND vote_type = -1`,
      [postId]
    );

    // Update post counts
    await this.db.query(
      `UPDATE forum_posts SET upvote_count = ?, downvote_count = ? WHERE id = ?`,
      [upvotes[0].count, downvotes[0].count, postId]
    );

    return {
      voted: existing.length === 0 || existing[0].vote_type !== voteType,
      upvoteCount: upvotes[0].count,
      downvoteCount: downvotes[0].count,
    };
  }

  // Comments
  async findComments(postId: string): Promise<ForumComment[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `
      SELECT 
        fc.*,
        u.full_name as authorName,
        u.avatar_url as authorAvatar
      FROM forum_comments fc
      LEFT JOIN users u ON fc.author_id = u.id
      WHERE fc.post_id = ? AND fc.deleted_at IS NULL
      ORDER BY fc.created_at ASC
    `,
      [postId]
    );
    return rows.map(this.mapRowToComment);
  }

  async createComment(comment: Partial<ForumComment>): Promise<ForumComment> {
    const commentId = crypto.randomUUID();
    await this.db.query(
      `INSERT INTO forum_comments (
        id, post_id, author_id, content, parent_id
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        commentId,
        comment.postId,
        comment.authorId,
        comment.content,
        comment.parentId || null,
      ]
    );

    // Update comment count
    await this.db.query(
      `UPDATE forum_posts SET comment_count = comment_count + 1 WHERE id = ?`,
      [comment.postId]
    );

    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        fc.*,
        u.full_name as authorName,
        u.avatar_url as authorAvatar
      FROM forum_comments fc
      LEFT JOIN users u ON fc.author_id = u.id
      WHERE fc.id = ?`,
      [commentId]
    );
    return this.mapRowToComment(rows[0]);
  }

  private mapRowToPost(row: RowDataPacket): ForumPost {
    return {
      id: row.id,
      categoryId: row.category_id,
      categoryName: row.categoryName,
      authorId: row.author_id,
      authorName: row.authorName,
      authorAvatar: row.authorAvatar,
      title: row.title,
      content: row.content,
      status: row.status,
      moderatedBy: row.moderated_by,
      moderatedAt: row.moderated_at ? new Date(row.moderated_at) : undefined,
      moderationNotes: row.moderation_notes,
      isPinned: row.is_pinned,
      viewCount: row.view_count,
      upvoteCount: row.upvote_count,
      downvoteCount: row.downvote_count,
      commentCount: row.comment_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : undefined,
      tags: row.tags ? row.tags.split(",") : [],
    };
  }

  private mapRowToComment(row: RowDataPacket): ForumComment {
    return {
      id: row.id,
      postId: row.post_id,
      authorId: row.author_id,
      authorName: row.authorName,
      authorAvatar: row.authorAvatar,
      content: row.content,
      parentId: row.parent_id,
      upvoteCount: row.upvote_count || 0,
      downvoteCount: row.downvote_count || 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : undefined,
    };
  }
}

