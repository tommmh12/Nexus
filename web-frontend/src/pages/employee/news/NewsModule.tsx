import React, { useState, useEffect } from "react";
import { Button } from "../../../components/system/ui/Button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Printer,
  Tag,
  Search,
} from "lucide-react";

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
}

// --- Mock Data ---
const MOCK_NEWS: NewsArticle[] = [
  {
    id: "1",
    title: "Thông báo Tiệc Tất niên 2024 - Kết nối và Bứt phá",
    summary:
      "Công ty tổ chức Tiệc Tất niên 2024 vào ngày 25/12. Hãy cùng đăng ký tham gia và đón nhận nhiều phần quà hấp dẫn!",
    content: `<p>Nhằm tổng kết một năm làm việc và tạo cơ hội giao lưu giữa các phòng ban, Ban lãnh đạo quyết định tổ chức Tiệc Tất niên 2024 với chủ đề "Kết nối và Bứt phá".</p>
    <h2>Chi tiết sự kiện</h2>
    <ul>
      <li><strong>Thời gian:</strong> 18:00, Thứ Tư, 25/12/2024</li>
      <li><strong>Địa điểm:</strong> Grand Ballroom, Khách sạn Melia</li>
      <li><strong>Dress code:</strong> Smart Casual</li>
    </ul>
    <h2>Chương trình</h2>
    <p>Chương trình bao gồm: Buffet dinner, văn nghệ, bốc thăm may mắn với nhiều giải thưởng giá trị.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
    category: "Sự kiện",
    authorName: "HR Team",
    authorAvatar:
      "https://ui-avatars.com/api/?name=HR&background=6366f1&color=fff",
    publishDate: "14/12/2024",
    readTime: "3 phút đọc",
    isFeatured: true,
    status: "Published",
    tags: ["sự kiện", "tất niên", "2024"],
  },
  {
    id: "2",
    title: "Chính sách làm việc từ xa mới áp dụng từ tháng 1/2025",
    summary:
      "Công ty ban hành chính sách Hybrid Working mới, cho phép nhân viên làm việc từ xa 2 ngày/tuần.",
    content: `<p>Để tạo điều kiện cân bằng công việc và cuộc sống, công ty quyết định áp dụng chính sách Hybrid Working từ ngày 01/01/2025.</p>
    <h2>Nội dung chính</h2>
    <ul>
      <li>Nhân viên được làm việc từ xa 2 ngày/tuần (Thứ 3 và Thứ 5)</li>
      <li>Các buổi họp quan trọng vẫn yêu cầu có mặt tại văn phòng</li>
      <li>Cần đăng ký lịch WFH trước 1 tuần</li>
    </ul>`,
    coverImage:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    category: "Nhân sự",
    authorName: "Admin",
    authorAvatar:
      "https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff",
    publishDate: "12/12/2024",
    readTime: "4 phút đọc",
    status: "Published",
    tags: ["nhân sự", "chính sách", "wfh"],
  },
  {
    id: "3",
    title: "Ra mắt sản phẩm mới: Nexus Mobile App v2.0",
    summary:
      "Phiên bản 2.0 của ứng dụng mobile đã chính thức ra mắt với nhiều tính năng mới.",
    content: `<p>Sau 6 tháng phát triển, team Product đã hoàn thành Nexus Mobile App v2.0 với nhiều cải tiến đáng kể.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
    category: "Sản phẩm",
    authorName: "Product Team",
    authorAvatar:
      "https://ui-avatars.com/api/?name=PT&background=f59e0b&color=fff",
    publishDate: "10/12/2024",
    readTime: "5 phút đọc",
    status: "Published",
    tags: ["sản phẩm", "mobile", "release"],
  },
  {
    id: "4",
    title: "Kết quả kinh doanh Q3/2024 vượt chỉ tiêu",
    summary:
      "Doanh thu Q3 đạt 125% kế hoạch, đánh dấu quý tăng trưởng mạnh nhất năm.",
    content: `<p>Ban lãnh đạo vui mừng thông báo kết quả kinh doanh Q3/2024 đã vượt 25% so với kế hoạch đề ra.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    category: "Kinh doanh",
    authorName: "CEO Office",
    authorAvatar:
      "https://ui-avatars.com/api/?name=CEO&background=ef4444&color=fff",
    publishDate: "08/12/2024",
    readTime: "6 phút đọc",
    status: "Published",
    tags: ["kinh doanh", "báo cáo", "q3"],
  },
  {
    id: "5",
    title: "Chương trình đào tạo Leadership 2025",
    summary:
      "Mở đăng ký chương trình đào tạo Leadership dành cho các Team Lead và Manager.",
    content: `<p>Nhằm nâng cao năng lực quản lý, công ty triển khai chương trình Leadership Training 2025.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    category: "Đào tạo",
    authorName: "L&D Team",
    authorAvatar:
      "https://ui-avatars.com/api/?name=LD&background=8b5cf6&color=fff",
    publishDate: "05/12/2024",
    readTime: "4 phút đọc",
    status: "Published",
    tags: ["đào tạo", "leadership", "2025"],
  },
];

// --- Utility Components ---
const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "outline";
  className?: string;
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    outline: "bg-white text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// --- Sub-component: News Detail (Reader View) ---
export const NewsDetail = ({
  article,
  onBack,
}: {
  article: NewsArticle;
  onBack: () => void;
}) => {
  return (
    <div className="animate-fadeIn max-w-5xl mx-auto bg-white min-h-screen pb-20 shadow-sm border-x border-slate-100">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full group overflow-hidden">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

        {/* Navigation */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-white/90 hover:bg-white text-slate-900 border-none shadow-sm backdrop-blur-sm"
          >
            <ArrowLeft size={16} className="mr-2" /> Quay lại
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 p-8 w-full z-10">
          <div className="max-w-4xl mx-auto">
            <Badge
              variant="success"
              className="mb-4 bg-brand-600 text-white border-none py-1 px-3"
            >
              {article.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              {article.title}
            </h1>
            <div className="flex items-center text-white/90 text-sm gap-6 border-t border-white/20 pt-6">
              <div className="flex items-center gap-3">
                <img
                  src={article.authorAvatar}
                  alt=""
                  className="w-8 h-8 rounded-full border-2 border-white/30"
                />
                <span className="font-medium">{article.authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-white/70" />
                <span>{article.publishDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-white/70" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="px-6 md:px-12 py-12 max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <p className="text-xl text-slate-600 font-serif leading-relaxed mb-10 first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-slate-900">
              {article.summary}
            </p>

            <div className="prose prose-lg prose-slate max-w-none text-slate-800 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-600">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Tag size={16} /> Từ khóa liên quan
                </h4>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div className="sticky top-8">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Chia sẻ bài viết
                </h4>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-slate-600 hover:text-brand-600 bg-white"
                  >
                    <Share2 size={16} className="mr-3" /> Sao chép liên kết
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-slate-600 hover:text-brand-600 bg-white"
                  >
                    <Printer size={16} className="mr-3" /> In bài viết
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- News Module (READER COMPONENT) ---
export const NewsModule = () => {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null
  );
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setNews(MOCK_NEWS);
      setLoading(false);
    }, 500);
  }, []);

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    setView("detail");
    window.scrollTo(0, 0);
  };

  const publishedNews = news.filter((n) => n.status === "Published");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-600 border-t-transparent"></div>
          <p className="text-slate-500 font-medium text-sm animate-pulse">
            Đang tải tin tức...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn h-full bg-slate-50 min-h-screen">
      {view === "list" ? (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                Bản tin Công ty
              </h1>
              <p className="text-lg text-slate-500 font-light">
                Cập nhật những tin tức và sự kiện mới nhất.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-full text-sm shadow-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Featured News (First item) */}
          {publishedNews.length > 0 && (
            <div
              onClick={() => handleArticleClick(publishedNews[0])}
              className="group relative h-[450px] w-full rounded-2xl overflow-hidden cursor-pointer shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              <img
                src={publishedNews[0].coverImage}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-4xl">
                <Badge className="mb-4 bg-brand-600 text-white border-none py-1.5 px-4 text-xs tracking-wider uppercase">
                  {publishedNews[0].category}
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-brand-100 transition-colors">
                  {publishedNews[0].title}
                </h2>
                <p className="text-white/80 text-lg mb-8 line-clamp-2 max-w-2xl font-light">
                  {publishedNews[0].summary}
                </p>

                <div className="flex items-center text-white/90 text-sm gap-8 font-medium">
                  <div className="flex items-center gap-3">
                    <img
                      src={publishedNews[0].authorAvatar}
                      alt=""
                      className="w-8 h-8 rounded-full border border-white/30"
                    />
                    <span>{publishedNews[0].authorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{publishedNews[0].publishDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{publishedNews[0].readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Latest News Grid */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-brand-600 rounded-full"></div>
              <h3 className="text-2xl font-bold text-slate-900">
                Mới cập nhật
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedNews.slice(1).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleArticleClick(item)}
                  className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.coverImage}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt=""
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex items-center text-xs text-slate-400 mb-3 gap-2 font-medium">
                      <Calendar size={14} />
                      <span>{item.publishDate}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                      <img
                        src={item.authorAvatar}
                        className="w-6 h-6 rounded-full"
                        alt=""
                      />
                      <span className="text-xs font-semibold text-slate-600">
                        {item.authorName}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : selectedArticle ? (
        <NewsDetail article={selectedArticle} onBack={() => setView("list")} />
      ) : null}
    </div>
  );
};

export default NewsModule;
