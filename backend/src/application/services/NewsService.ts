import { NewsRepository, NewsArticleWithDetails } from "../../infrastructure/repositories/NewsRepository.js";

export class NewsService {
  private newsRepository: NewsRepository;

  constructor() {
    this.newsRepository = new NewsRepository();
  }

  async getArticles(status?: "Draft" | "Published" | "Archived") {
    const articles = await this.newsRepository.getAllArticles(status);
    return articles.map((article) => this.transformArticle(article));
  }

  async getArticleById(id: string) {
    const article = await this.newsRepository.getArticleById(id);
    if (!article) return null;

    // Get tags
    const tags = await this.newsRepository.getArticleTags(id);

    return {
      ...this.transformArticle(article),
      tags,
    };
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
    tags?: string[];
  }) {
    // Create article
    const article = await this.newsRepository.createArticle({
      title: data.title,
      summary: data.summary,
      content: data.content,
      cover_image: data.cover_image,
      category: data.category,
      author_id: data.author_id,
      status: data.status,
      is_featured: data.is_featured,
      read_time: data.read_time,
    });

    // Set tags if provided
    if (data.tags && data.tags.length > 0) {
      await this.newsRepository.setArticleTags(article.id, data.tags);
    }

    // Get full article details
    const fullArticle = await this.newsRepository.getArticleById(article.id);
    if (!fullArticle) throw new Error("Failed to retrieve created article");

    const tags = await this.newsRepository.getArticleTags(article.id);

    return {
      ...this.transformArticle(fullArticle),
      tags,
    };
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
    tags?: string[];
  }>) {
    const { tags, ...updateData } = data;

    // Update article
    await this.newsRepository.updateArticle(id, updateData);

    // Update tags if provided
    if (tags !== undefined) {
      await this.newsRepository.setArticleTags(id, tags);
    }

    // Get updated article
    const article = await this.newsRepository.getArticleById(id);
    if (!article) throw new Error("Article not found");

    const articleTags = await this.newsRepository.getArticleTags(id);

    return {
      ...this.transformArticle(article),
      tags: articleTags,
    };
  }

  async deleteArticle(id: string) {
    await this.newsRepository.deleteArticle(id);
  }

  async publishArticle(id: string) {
    return await this.updateArticle(id, { status: "Published" });
  }

  async archiveArticle(id: string) {
    return await this.updateArticle(id, { status: "Archived" });
  }

  async incrementViewCount(id: string) {
    await this.newsRepository.incrementViewCount(id);
  }

  private transformArticle(article: NewsArticleWithDetails) {
    return {
      id: article.id,
      title: article.title,
      summary: article.summary || "",
      content: article.content,
      coverImage: article.cover_image || "",
      category: article.category,
      authorId: article.author_id,
      authorName: article.author_name || "Unknown",
      authorAvatar: article.author_avatar || "",
      publishDate: article.published_at 
        ? new Date(article.published_at).toLocaleDateString("vi-VN")
        : new Date(article.created_at).toLocaleDateString("vi-VN"),
      readTime: article.read_time || "5 phút đọc",
      isFeatured: article.is_featured,
      status: article.status,
      viewCount: article.view_count,
      tags: [], // Will be populated separately
    };
  }
}

