import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Printer,
  Tag,
  Search,
  Newspaper,
  Heart,
  MessageSquare,
  Eye,
  RefreshCw,
} from "lucide-react";
import { newsService } from "../../../services/newsService";

// --- Configuration ---
const THEME = {
  bg: "bg-[#F8FAFC]",
  card: "bg-white rounded-[24px] shadow-sm hover:shadow-xl transition-all border-0",
  textPrimary: "text-slate-900",
  textSecondary: "text-slate-500",
  accent: "text-teal-600",
  tag: "bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
};

// --- Types ---
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  authorName: string;
  authorAvatar: string;
  publishDate: string;
  readTime: string;
  isFeatured?: boolean;
  status: string;
  tags?: string[];
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  isLiked?: boolean;
}

// Helper function
const formatDate = (dateStr: string | Date): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const calculateReadTime = (content: string): string => {
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} phút đọc`;
};

// Transform API response to NewsArticle format
const transformArticle = (article: any): NewsArticle => ({
  id: article.id,
  title: article.title,
  summary: article.summary || article.excerpt || "",
  content: article.content || "",
  coverImage:
    article.cover_image ||
    article.coverImage ||
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800",
  category: article.category?.name || article.categoryName || "Tin tức",
  authorName: article.author?.full_name || article.authorName || "Admin",
  authorAvatar:
    article.author?.avatar_url ||
    article.authorAvatar ||
    `https://ui-avatars.com/api/?name=Admin&background=0d9488&color=fff`,
  publishDate: formatDate(
    article.published_at ||
      article.publishedAt ||
      article.created_at ||
      new Date()
  ),
  readTime: calculateReadTime(article.content || ""),
  isFeatured: article.is_featured || article.isFeatured || false,
  status: article.status || "Published",
  tags: article.tags || [],
  likeCount: article.like_count || article.likeCount || 0,
  commentCount: article.comment_count || article.commentCount || 0,
  viewCount: article.view_count || article.viewCount || 0,
  isLiked: article.is_liked || article.isLiked || false,
});

// --- Detail View ---
export const NewsDetail = ({
  article,
  onBack,
}: {
  article: NewsArticle;
  onBack: () => void;
}) => {
  return (
    <div className={`min-h-screen ${THEME.bg} pb-20`}>
      {/* Hero Image */}
      <div className="h-[60vh] w-full relative">
        <img
          src={article.coverImage}
          className="w-full h-full object-cover"
          alt={article.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-90"></div>

        <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
          <button
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all"
          >
            <ArrowLeft size={20} /> Back
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full max-w-5xl p-8 md:p-16 mx-auto">
          <span className="bg-teal-500 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 inline-block shadow-lg shadow-teal-500/30">
            {article.category}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-8 text-white/80 font-medium">
            <div className="flex items-center gap-3">
              <img
                src={article.authorAvatar}
                className="w-10 h-10 rounded-full border-2 border-white/20"
                alt=""
              />
              <span>{article.authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} /> {article.publishDate}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} /> {article.readTime}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto -mt-20 relative z-10 px-6">
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl">
          <p className="text-xl md:text-2xl text-slate-600 font-serif leading-relaxed mb-10">
            {article.summary}
          </p>
          <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex gap-2">
            {article.tags?.map((tag) => (
              <span
                key={tag}
                className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <button className="bg-white px-6 py-3 rounded-xl font-bold text-slate-600 shadow-sm hover:translate-y-[-2px] transition-all">
            <Share2 className="inline mr-2" size={18} /> Share
          </button>
          <button className="bg-white px-6 py-3 rounded-xl font-bold text-slate-600 shadow-sm hover:translate-y-[-2px] transition-all">
            <Printer className="inline mr-2" size={18} /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Module ---
export const NewsModule = () => {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null
  );
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await newsService.getPublicArticles(20, 0);
        const transformedArticles = (response || []).map(transformArticle);
        setArticles(transformedArticles);
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError("Không thể tải tin tức. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleArticleClick = async (article: NewsArticle) => {
    try {
      // Optionally fetch full article detail
      const fullArticle = await newsService.getPublicArticleById(article.id);
      setSelectedArticle(transformArticle(fullArticle));
    } catch (err) {
      setSelectedArticle(article);
    }
    setView("detail");
    window.scrollTo(0, 0);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await newsService.getPublicArticles(20, 0);
      const transformedArticles = (response || []).map(transformArticle);
      setArticles(transformedArticles);
    } catch (err) {
      console.error("Failed to refresh news:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter articles by search term
  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredArticle =
    filteredArticles.find((a) => a.isFeatured) || filteredArticles[0];
  const otherArticles = filteredArticles.filter(
    (a) => a.id !== featuredArticle?.id
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent mb-3"></div>
        <span>Đang tải tin tức...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-500">
        <Newspaper size={48} className="text-slate-300 mb-4" />
        <p className="mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <RefreshCw size={16} /> Thử lại
        </button>
      </div>
    );
  }

  return view === "detail" && selectedArticle ? (
    <NewsDetail article={selectedArticle} onBack={() => setView("list")} />
  ) : (
    <div className={`min-h-screen ${THEME.bg} p-6 font-sans`}>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Newspaper className="text-teal-600" size={32} /> Tin tức công ty
            </h1>
            <p className="text-slate-500 mt-2 font-medium text-lg">
              Cập nhật những thông báo mới nhất
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-3 bg-white rounded-xl shadow-sm hover:bg-slate-50 text-slate-500"
              title="Làm mới"
            >
              <RefreshCw size={18} />
            </button>
            <div className="bg-white p-2 rounded-2xl shadow-sm flex items-center gap-2 w-full md:w-96">
              <Search className="ml-2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                className="flex-1 py-2 outline-none text-slate-700 bg-transparent placeholder:text-slate-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center shadow-sm">
            <Newspaper size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              Chưa có tin tức nào
            </h3>
            <p className="text-slate-500">
              {searchTerm
                ? "Không tìm thấy tin tức phù hợp"
                : "Tin tức sẽ được cập nhật sớm"}
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredArticle && (
              <div
                onClick={() => handleArticleClick(featuredArticle)}
                className="relative h-[500px] w-full rounded-[32px] overflow-hidden group cursor-pointer shadow-2xl shadow-slate-200"
              >
                <img
                  src={featuredArticle.coverImage}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={featuredArticle.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-4xl">
                  <span className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider mb-4 inline-block shadow-lg shadow-teal-900/20">
                    {featuredArticle.category}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-teal-200 transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-white/80 text-lg md:text-xl line-clamp-2 mb-8 max-w-2xl font-light">
                    {featuredArticle.summary}
                  </p>

                  <div className="flex items-center gap-6 text-white/90 text-sm font-bold">
                    <div className="flex items-center gap-2">
                      <img
                        src={featuredArticle.authorAvatar}
                        className="w-6 h-6 rounded-full"
                        alt=""
                      />
                      {featuredArticle.authorName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} /> {featuredArticle.publishDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} /> {featuredArticle.readTime}
                    </div>
                    {featuredArticle.viewCount !== undefined &&
                      featuredArticle.viewCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Eye size={16} /> {featuredArticle.viewCount} lượt xem
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Grid */}
            {otherArticles.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-8 bg-teal-500 rounded-full"></div> Tin
                  tức mới nhất
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otherArticles.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleArticleClick(item)}
                      className={`${THEME.card} overflow-hidden group cursor-pointer flex flex-col h-full`}
                    >
                      <div className="h-64 overflow-hidden relative">
                        <img
                          src={item.coverImage}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          alt={item.title}
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                          <Calendar size={12} /> {item.publishDate}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-teal-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
                          {item.summary}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.authorAvatar}
                              className="w-6 h-6 rounded-full"
                              alt=""
                            />
                            <span className="text-xs font-bold text-slate-600">
                              {item.authorName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            {item.likeCount !== undefined &&
                              item.likeCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <Heart size={12} /> {item.likeCount}
                                </span>
                              )}
                            {item.commentCount !== undefined &&
                              item.commentCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <MessageSquare size={12} />{" "}
                                  {item.commentCount}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsModule;
