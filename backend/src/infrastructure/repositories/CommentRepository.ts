import { dbPool } from "../database/connection.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import crypto from "crypto";
import type { Comment, ReactionType, CommentEditHistory } from "../../domain/entities/Comment.js";

export class CommentRepository {
    private db = dbPool;

    /**
     * Tạo comment mới
     */
    async create(commentData: {
        commentable_type: string;
        commentable_id: string;
        author_id: string;
        content: string;
        parent_id?: string;
    }): Promise<string> {
        const commentId = crypto.randomUUID();

        const query = `
      INSERT INTO comments (
        id, commentable_type, commentable_id, parent_id, author_id, content
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

        await this.db.query(query, [
            commentId,
            commentData.commentable_type,
            commentData.commentable_id,
            commentData.parent_id || null,
            commentData.author_id,
            commentData.content,
        ]);

        // Update parent reply count if this is a reply
        if (commentData.parent_id) {
            await this.incrementReplyCount(commentData.parent_id);
        }

        return commentId;
    }

    /**
     * Lấy tất cả comments của thread (forum_post hoặc task)
     */
    async findByThread(type: string, id: string, userId?: string): Promise<Comment[]> {
        const query = `
      SELECT 
        c.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        ${userId ? `(
          SELECT reaction_type 
          FROM comment_reactions 
          WHERE comment_id = c.id AND user_id = ?
        ) as user_reaction` : 'NULL as user_reaction'}
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.commentable_type = ? 
        AND c.commentable_id = ?
        AND c.deleted_at IS NULL
      ORDER BY c.created_at ASC
    `;

        const params = userId ? [userId, type, id] : [type, id];
        const [rows] = await this.db.query<RowDataPacket[]>(query, params);

        // Get reactions for all comments
        const commentIds = rows.map(r => r.id);
        const reactions = await this.getReactionsBatch(commentIds);

        return rows.map(row => ({
            ...row,
            author: {
                id: row.author_id,
                full_name: row.author_name,
                avatar_url: row.author_avatar,
            },
            reactions: reactions[row.id] || {
                like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0
            },
            user_reaction: row.user_reaction,
        }));
    }

    /**
     * Lấy comment theo ID
     */
    async findById(id: string): Promise<Comment | null> {
        const query = `
      SELECT 
        c.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = ? AND c.deleted_at IS NULL
    `;

        const [rows] = await this.db.query<RowDataPacket[]>(query, [id]);

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            ...row,
            author: {
                id: row.author_id,
                full_name: row.author_name,
                avatar_url: row.author_avatar,
            },
        };
    }

    /**
     * Update comment (save old content to history first)
     */
    async update(id: string, content: string, editorId: string): Promise<void> {
        const connection = await this.db.getConnection();

        try {
            await connection.beginTransaction();

            // Get old content
            const [rows] = await connection.query<RowDataPacket[]>(
                'SELECT content, original_content FROM comments WHERE id = ?',
                [id]
            );

            if (rows.length > 0) {
                const oldContent = rows[0].content;

                // Save to history
                await connection.query(
                    'INSERT INTO comment_edit_history (id, comment_id, old_content, edited_by) VALUES (?, ?, ?, ?)',
                    [crypto.randomUUID(), id, oldContent, editorId]
                );

                // Update comment
                await connection.query(
                    `UPDATE comments 
           SET content = ?, 
               original_content = COALESCE(original_content, ?),
               is_edited = TRUE 
           WHERE id = ?`,
                    [content, oldContent, id]
                );
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Soft retract comment
     */
    async softRetract(id: string): Promise<void> {
        await this.db.query(
            'UPDATE comments SET is_retracted = TRUE, retracted_at = NOW() WHERE id = ?',
            [id]
        );
    }

    /**
     * Soft delete comment
     */
    async softDelete(id: string): Promise<void> {
        await this.db.query(
            'UPDATE comments SET deleted_at = NOW() WHERE id = ?',
            [id]
        );
    }

    /**
     * Get edit history
     */
    async getEditHistory(commentId: string): Promise<CommentEditHistory[]> {
        const query = `
      SELECT 
        h.*,
        u.full_name as editor_name
      FROM comment_edit_history h
      LEFT JOIN users u ON h.edited_by = u.id
      WHERE h.comment_id = ?
      ORDER BY h.edited_at DESC
    `;

        const [rows] = await this.db.query<RowDataPacket[]>(query, [commentId]);

        return rows.map(row => ({
            ...row,
            editor: {
                full_name: row.editor_name,
            },
        }));
    }

    /**
     * Toggle reaction
     */
    async toggleReaction(commentId: string, userId: string, reactionType: ReactionType): Promise<void> {
        const checkQuery = 'SELECT reaction_type FROM comment_reactions WHERE comment_id = ? AND user_id = ?';
        const [existing] = await this.db.query<RowDataPacket[]>(checkQuery, [commentId, userId]);

        if (existing.length > 0) {
            // If same reaction, remove it
            if (existing[0].reaction_type === reactionType) {
                await this.db.query(
                    'DELETE FROM comment_reactions WHERE comment_id = ? AND user_id = ?',
                    [commentId, userId]
                );
            } else {
                // Update to new reaction
                await this.db.query(
                    'UPDATE comment_reactions SET reaction_type = ? WHERE comment_id = ? AND user_id = ?',
                    [reactionType, commentId, userId]
                );
            }
        } else {
            // Add new reaction
            await this.db.query(
                'INSERT INTO comment_reactions (id, comment_id, user_id, reaction_type) VALUES (?, ?, ?, ?)',
                [crypto.randomUUID(), commentId, userId, reactionType]
            );
        }
    }

    /**
     * Get reactions summary for a comment
     */
    async getReactions(commentId: string): Promise<{ [key: string]: number }> {
        const query = `
      SELECT reaction_type, COUNT(*) as count
      FROM comment_reactions
      WHERE comment_id = ?
      GROUP BY reaction_type
    `;

        const [rows] = await this.db.query<RowDataPacket[]>(query, [commentId]);

        const reactions: { [key: string]: number } = {
            like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0
        };

        rows.forEach(row => {
            reactions[row.reaction_type] = row.count;
        });

        return reactions;
    }

    /**
     * Get reactions for multiple comments (batch)
     */
    private async getReactionsBatch(commentIds: string[]): Promise<{ [key: string]: { [key: string]: number } }> {
        if (commentIds.length === 0) return {};

        const placeholders = commentIds.map(() => '?').join(',');
        const query = `
      SELECT comment_id, reaction_type, COUNT(*) as count
      FROM comment_reactions
      WHERE comment_id IN (${placeholders})
      GROUP BY comment_id, reaction_type
    `;

        const [rows] = await this.db.query<RowDataPacket[]>(query, commentIds);

        const result: { [key: string]: { [key: string]: number } } = {};

        rows.forEach(row => {
            if (!result[row.comment_id]) {
                result[row.comment_id] = {
                    like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0
                };
            }
            result[row.comment_id][row.reaction_type] = row.count;
        });

        return result;
    }

    /**
     * Increment reply count for parent comment
     */
    async incrementReplyCount(parentId: string): Promise<void> {
        await this.db.query(
            'UPDATE comments SET reply_count = reply_count + 1 WHERE id = ?',
            [parentId]
        );
    }

    /**
     * Add mention
     */
    async addMention(commentId: string, mentionedUserId: string): Promise<void> {
        await this.db.query(
            'INSERT IGNORE INTO comment_mentions (id, comment_id, mentioned_user_id) VALUES (?, ?, ?)',
            [crypto.randomUUID(), commentId, mentionedUserId]
        );
    }

    /**
     * Get mentioned users
     */
    async getMentions(commentId: string): Promise<string[]> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            'SELECT mentioned_user_id FROM comment_mentions WHERE comment_id = ?',
            [commentId]
        );

        return rows.map(r => r.mentioned_user_id);
    }
}
