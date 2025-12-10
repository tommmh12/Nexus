export interface Comment {
    id: string;
    commentable_type: 'forum_post' | 'task';
    commentable_id: string;
    parent_id: string | null;
    author_id: string;
    content: string;
    original_content: string | null;
    is_edited: boolean;
    is_retracted: boolean;
    reply_count: number;
    created_at: string;
    updated_at: string;
    retracted_at: string | null;
    deleted_at: string | null;

    // Flat author fields from backend
    author_name: string;
    author_avatar: string | null;

    // Optional nested for backward compat
    author?: {
        id: string;
        full_name: string;
        avatar_url: string;
    };

    replies?: Comment[];
    reactions: ReactionSummary;
    user_reaction?: string | null;
}

export interface ReactionSummary {
    like: number;
    love: number;
    laugh: number;
    wow: number;
    sad: number;
    angry: number;
}

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

export interface CommentEditHistory {
    id: string;
    comment_id: string;
    old_content: string;
    edited_by: string;
    edited_at: string;
    editor: {
        full_name: string;
    };
}
