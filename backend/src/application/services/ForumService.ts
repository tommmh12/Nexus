import { ForumRepository, ForumPostWithDetails } from "../../infrastructure/repositories/ForumRepository.js";

export class ForumService {
  private forumRepository: ForumRepository;

  constructor() {
    this.forumRepository = new ForumRepository();
  }

  async getCategories() {
    return await this.forumRepository.getAllCategories();
  }

  async getCategoryById(id: string) {
    return await this.forumRepository.getCategoryById(id);
  }

  async createCategory(data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    order?: number;
  }) {
    return await this.forumRepository.createCategory({
      name: data.name,
      description: data.description,
      icon: data.icon,
      color_class: data.color,
      order: data.order,
    });
  }

  async updateCategory(id: string, data: Partial<{
    name: string;
    description: string;
    icon: string;
    color: string;
    order: number;
  }>) {
    return await this.forumRepository.updateCategory(id, {
      name: data.name,
      description: data.description,
      icon: data.icon,
      color_class: data.color,
      order: data.order,
    });
  }

  async deleteCategory(id: string) {
    await this.forumRepository.deleteCategory(id);
  }

  async getPosts(status?: "Pending" | "Approved" | "Rejected") {
    const posts = await this.forumRepository.getAllPosts(status);
    
    // Transform to match frontend format
    return posts.map((post) => this.transformPost(post));
  }

  async getPostById(id: string) {
    const post = await this.forumRepository.getPostById(id);
    if (!post) return null;

    // Get tags
    const tags = await this.forumRepository.getPostTags(id);

    return {
      ...this.transformPost(post),
      tags,
    };
  }

  async createPost(data: {
    category_id: string;
    author_id: string;
    title: string;
    content: string;
    tags?: string[];
    status?: "Pending" | "Approved" | "Rejected";
  }) {
    // Create post
    const post = await this.forumRepository.createPost({
      category_id: data.category_id,
      author_id: data.author_id,
      title: data.title,
      content: data.content,
      status: data.status,
    });

    // Set tags if provided
    if (data.tags && data.tags.length > 0) {
      await this.forumRepository.setPostTags(post.id, data.tags);
    }

    // Get full post details
    const fullPost = await this.forumRepository.getPostById(post.id);
    if (!fullPost) throw new Error("Failed to retrieve created post");

    const tags = await this.forumRepository.getPostTags(post.id);

    return {
      ...this.transformPost(fullPost),
      tags,
    };
  }

  async updatePost(id: string, data: Partial<{
    title: string;
    content: string;
    category_id: string;
    status: "Pending" | "Approved" | "Rejected";
    is_pinned: boolean;
    tags?: string[];
  }>) {
    const { tags, ...updateData } = data;

    // Update post
    await this.forumRepository.updatePost(id, updateData);

    // Update tags if provided
    if (tags !== undefined) {
      await this.forumRepository.setPostTags(id, tags);
    }

    // Get updated post
    const post = await this.forumRepository.getPostById(id);
    if (!post) throw new Error("Post not found");

    const postTags = await this.forumRepository.getPostTags(id);

    return {
      ...this.transformPost(post),
      tags: postTags,
    };
  }

  async deletePost(id: string) {
    await this.forumRepository.deletePost(id);
  }

  async approvePost(id: string) {
    return await this.updatePost(id, { status: "Approved" });
  }

  async rejectPost(id: string) {
    return await this.updatePost(id, { status: "Rejected" });
  }

  private transformPost(post: ForumPostWithDetails) {
    return {
      id: post.id,
      categoryId: post.category_id,
      authorId: post.author_id,
      authorName: post.author_name || "Unknown",
      authorAvatar: post.author_avatar || "",
      authorDept: post.author_dept || "General",
      title: post.title,
      content: post.content,
      timestamp: post.created_at.toISOString(),
      upvotes: post.upvote_count,
      downvotes: post.downvote_count,
      commentCount: post.comment_count,
      viewCount: post.view_count,
      isPinned: post.is_pinned,
      status: post.status,
      tags: [], // Will be populated separately
    };
  }
}

