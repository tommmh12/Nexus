import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Tag,
  Search,
  Eye,
  Building2,
  LogIn,
  Newspaper,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { newsService } from "../../services/newsService";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  coverImage: string;
  authorName: string;
  authorAvatar: string;
  publishDate: string;
  readTime: string;
  status: string;
  tags?: string[];
  views?: number;
}

// --- Header Component ---
const PublicHeader: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">NEXUS</h1>
              <p className="text-xs text-slate-500">Cổng thông tin nội bộ</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-brand-600 font-medium">Bản tin</a>
            <a href="#about" className="text-slate-600 hover:text-brand-600 transition">Giới thiệu</a>
            <a href="#contact" className="text-slate-600 hover:text-brand-600 transition">Liên hệ</a>
          </nav>

          {/* Login Button */}
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition shadow-sm"
          >
            <LogIn size={18} />
            <span>Đăng nhập</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// --- News Card Component ---
const NewsCard: React.FC<{ article: NewsArticle; onClick: () => void }> = ({ article, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-brand-200 transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={article.coverImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600"}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-brand-600 text-white text-xs font-medium rounded-full">
            {article.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition line-clamp-2">
          {article.title}
        </h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{article.summary}</p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {article.publishDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {article.readTime}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {article.views || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Featured Article Component ---
const FeaturedArticle: React.FC<{ article: NewsArticle; onClick: () => void }> = ({ article, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative h-[500px] rounded-2xl overflow-hidden cursor-pointer shadow-xl"
    >
      <img
        src={article.coverImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"}
        alt={article.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <span className="inline-block px-4 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-full mb-4">
          {article.category}
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-brand-200 transition">
          {article.title}
        </h2>
        <p className="text-white/80 text-lg mb-6 line-clamp-2 max-w-3xl">{article.summary}</p>
        <div className="flex items-center gap-6 text-white/70 text-sm">
          <div className="flex items-center gap-2">
            <img
              src={article.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.authorName)}&background=random`}
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span>{article.authorName}</span>
          </div>
          <span className="flex items-center gap-1">
            <Calendar size={16} />
            {article.publishDate}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={16} />
            {article.views || 0} lượt xem
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Article Detail Component ---
const ArticleDetail: React.FC<{ article: NewsArticle; onBack: () => void }> = ({ article, onBack }) => {
  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition z-10"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-full mb-4">
              {article.category}
            </span>
            <h1 className="text-4xl font-bold text-white mb-4">{article.title}</h1>
            <div className="flex items-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <img
                  src={article.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.authorName)}&background=random`}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <span>{article.authorName}</span>
              </div>
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {article.publishDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {article.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-xl text-slate-600 mb-8 leading-relaxed font-serif italic border-l-4 border-brand-500 pl-6">
          {article.summary}
        </p>

        <div className="prose prose-lg prose-slate max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Tag size={16} /> Từ khóa
            </h4>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="mt-8 flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">
            <Share2 size={18} />
            Chia sẻ
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Public News Page ---
export const PublicNewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      // Use public endpoint - no auth required
      const data = await newsService.getPublicArticles(50, 0);
      setArticles(data.map((a: any) => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        content: a.content,
        category: a.category,
        coverImage: a.cover_image || a.coverImage,
        authorName: a.author_name || a.authorName || "Admin",
        authorAvatar: a.author_avatar || a.authorAvatar,
        publishDate: a.published_at ? new Date(a.published_at).toLocaleDateString("vi-VN") : 
                     a.publish_date ? new Date(a.publish_date).toLocaleDateString("vi-VN") : 
                     a.publishDate || new Date().toLocaleDateString("vi-VN"),
        readTime: a.read_time || a.readTime || "5 phút đọc",
        status: a.status,
        tags: a.tags || [],
        views: a.view_count || a.views || 0,
      })));
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    // Navigate to login - this will be handled by showing login form
    window.location.href = "/login";
  };

  // Get unique categories
  const categories = ["all", ...new Set(articles.map(a => a.category))];

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Featured article (most recent)
  const featuredArticle = filteredArticles[0];
  const otherArticles = filteredArticles.slice(1);

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicHeader onLoginClick={handleLoginClick} />
        <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader onLoginClick={handleLoginClick} />

      {/* Hero Section - Enhanced Design */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"
            alt="Office"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/95 via-brand-800/90 to-slate-900/95"></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-white/90 mb-8">
              <Newspaper size={16} className="text-brand-300" />
              Cập nhật mới nhất từ công ty
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Bản tin <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-blue-300">Công ty</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Cập nhật tin tức, sự kiện và những điểm nổi bật từ NEXUS Corporation
            </p>
            
            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-5 text-white/50" size={22} />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết, tin tức..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 outline-none transition-all text-lg"
                />
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-white/10">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{articles.length}</p>
                <p className="text-sm text-white/60">Bài viết</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{categories.length - 1}</p>
                <p className="text-sm text-white/60">Chuyên mục</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString()}</p>
                <p className="text-sm text-white/60">Lượt xem</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat === "all" ? "Tất cả" : cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper size={64} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Chưa có bài viết</h3>
            <p className="text-slate-500">Hiện tại chưa có bài viết nào được xuất bản.</p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredArticle && (
              <div className="mb-12">
                <FeaturedArticle
                  article={featuredArticle}
                  onClick={() => setSelectedArticle(featuredArticle)}
                />
              </div>
            )}

            {/* Article Grid */}
            {otherArticles.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Newspaper size={24} className="text-brand-600" />
                  Bài viết khác
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherArticles.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      onClick={() => setSelectedArticle(article)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">NEXUS</span>
              </div>
              <p className="text-slate-400">
                Cổng thông tin nội bộ doanh nghiệp - Kết nối, Chia sẻ, Phát triển
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Trang chủ</a></li>
                <li><a href="#" className="hover:text-white transition">Giới thiệu</a></li>
                <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Email: info@company.com</li>
                <li>Điện thoại: (028) 1234 5678</li>
                <li>Địa chỉ: TP. Hồ Chí Minh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
            © 2024 NEXUS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicNewsPage;
