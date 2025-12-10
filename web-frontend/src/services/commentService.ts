import axios from 'axios';
import { Comment, CommentEditHistory, ReactionType } from '../types/commentTypes';

const API_URL = 'http://localhost:5000/api/comments';

// Helper to get auth header (assuming token is stored in localStorage)
const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const commentService = {
    /**
     * Get comments by thread
     */
    async getCommentsByThread(type: 'forum_post' | 'task', id: string): Promise<Comment[]> {
        const response = await axios.get(`${API_URL}/${type}/${id}`, getAuthHeader());
        return response.data.data;
    },

    /**
     * Create a new comment
     */
    async createComment(data: {
        commentable_type: 'forum_post' | 'task';
        commentable_id: string;
        content: string;
        parent_id?: string;
    }): Promise<Comment> {
        const response = await axios.post(API_URL, data, getAuthHeader());
        return response.data.data;
    },

    /**
     * Update comment content
     */
    async updateComment(id: string, content: string): Promise<Comment> {
        const response = await axios.put(`${API_URL}/${id}`, { content }, getAuthHeader());
        return response.data.data;
    },

    /**
     * Delete comment (soft delete)
     */
    async deleteComment(id: string): Promise<void> {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    },

    /**
     * Retract comment (soft retract)
     */
    async retractComment(id: string): Promise<void> {
        await axios.post(`${API_URL}/${id}/retract`, {}, getAuthHeader());
    },

    /**
     * Toggle reaction
     */
    async toggleReaction(id: string, reaction_type: ReactionType): Promise<void> {
        await axios.post(`${API_URL}/${id}/reactions`, { reaction_type }, getAuthHeader());
    },

    /**
     * Get edit history
     */
    async getEditHistory(id: string): Promise<CommentEditHistory[]> {
        const response = await axios.get(`${API_URL}/${id}/history`, getAuthHeader());
        return response.data.data;
    },

    /**
     * Upload image for comment
     */
    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('accessToken');
        const response = await axios.post('http://localhost:5000/api/upload/comment-image', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data.data.url;
    }
};
