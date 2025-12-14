
export interface ForumPost {
    id: string;
    title: string;
    content: string;
    authorName: string;
    createdAt: string;
    upvoteCount: number;
    commentCount: number;
    categoryId: string;
    categoryName: string;
    isPinned: boolean;
}

export const forumService = {
    getAllPosts: async (filter: any) => [],
    getCategories: async () => []
};
