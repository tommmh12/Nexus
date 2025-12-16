import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Printer,
  Tag,
  Search,
  Newspaper
} from "lucide-react";

// --- Configuration ---
const THEME = {
  bg: "bg-[#F8FAFC]",
  card: "bg-white rounded-[24px] shadow-sm hover:shadow-xl transition-all border-0",
  textPrimary: "text-slate-900",
  textSecondary: "text-slate-500",
  accent: "text-teal-600",
  tag: "bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
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
    </ul>`,
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
    category: "Sự kiện",
    authorName: "HR Team",
    authorAvatar: "https://ui-avatars.com/api/?name=HR&background=00897B&color=fff",
    publishDate: "14/12/2024",
    readTime: "3 phút đọc",
    isFeatured: true,
    status: "Published",
    tags: ["sự kiện", "tất niên", "2024"],
  },
  {
    id: "2",
    title: "Chính sách làm việc từ xa mới áp dụng từ tháng 1/2025",
    summary: "Công ty ban hành chính sách Hybrid Working mới, cho phép nhân viên làm việc từ xa 2 ngày/tuần.",
    content: "<p>Để tạo điều kiện cân bằng công việc và cuộc sống...</p>",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    category: "Nhân sự",
    authorName: "Admin",
    authorAvatar: "https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff",
    publishDate: "12/12/2024",
    readTime: "4 phút đọc",
    status: "Published",
    tags: ["nhân sự", "chính sách", "wfh"],
  },
  {
    id: "3",
    title: "Ra mắt sản phẩm mới: Nexus Mobile App v2.0",
    summary: "Phiên bản 2.0 của ứng dụng mobile đã chính thức ra mắt với nhiều tính năng mới.",
    content: "<p>Team Product đã hoàn thành Nexus...</p>",
    coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
    category: "Sản phẩm",
    authorName: "Product Team",
    authorAvatar: "https://ui-avatars.com/api/?name=PT&background=f59e0b&color=fff",
    publishDate: "10/12/2024",
    readTime: "5 phút đọc",
    status: "Published",
    tags: ["sản phẩm", "mobile"],
  },
];

// --- Detail View ---
export const NewsDetail = ({ article, onBack }: { article: NewsArticle; onBack: () => void }) => {
  return (
    <div className={`min-h-screen ${THEME.bg} pb-20`}>
      {/* Hero Image */}
      <div className="h-[60vh] w-full relative">
        <img src={article.coverImage} className="w-full h-full object-cover" alt={article.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-90"></div>

        <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
          <button onClick={onBack} className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all">
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
              <img src={article.authorAvatar} className="w-10 h-10 rounded-full border-2 border-white/20" alt="" />
              <span>{article.authorName}</span>
            </div>
            <div className="flex items-center gap-2"><Calendar size={18} /> {article.publishDate}</div>
            <div className="flex items-center gap-2"><Clock size={18} /> {article.readTime}</div>
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
            {article.tags?.map(tag => (
              <span key={tag} className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-sm font-medium">#{tag}</span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <button className="bg-white px-6 py-3 rounded-xl font-bold text-slate-600 shadow-sm hover:translate-y-[-2px] transition-all"><Share2 className="inline mr-2" size={18} /> Share</button>
          <button className="bg-white px-6 py-3 rounded-xl font-bold text-slate-600 shadow-sm hover:translate-y-[-2px] transition-all"><Printer className="inline mr-2" size={18} /> Print</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Module ---
export const NewsModule = () => {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    setView("detail");
    window.scrollTo(0, 0);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading news...</div>;

  return view === "detail" && selectedArticle ? (
    <NewsDetail article={selectedArticle} onBack={() => setView("list")} />
  ) : (
    <div className={`min-h-screen ${THEME.bg} p-6 font-sans`}>
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Newspaper className="text-teal-600" size={32} /> Company News
            </h1>
            <p className="text-slate-500 mt-2 font-medium text-lg">Stay updated with the latest announcements.</p>
          </div>
          <div className="bg-white p-2 rounded-2xl shadow-sm flex items-center gap-2 w-full md:w-96">
            <Search className="ml-2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search news..."
              className="flex-1 py-2 outline-none text-slate-700 bg-transparent placeholder:text-slate-400 font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Featured Article */}
        <div onClick={() => handleArticleClick(MOCK_NEWS[0])} className="relative h-[500px] w-full rounded-[32px] overflow-hidden group cursor-pointer shadow-2xl shadow-slate-200">
          <img src={MOCK_NEWS[0].coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>

          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-4xl">
            <span className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider mb-4 inline-block shadow-lg shadow-teal-900/20">
              {MOCK_NEWS[0].category}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-teal-200 transition-colors">
              {MOCK_NEWS[0].title}
            </h2>
            <p className="text-white/80 text-lg md:text-xl line-clamp-2 mb-8 max-w-2xl font-light">
              {MOCK_NEWS[0].summary}
            </p>

            <div className="flex items-center gap-6 text-white/90 text-sm font-bold">
              <div className="flex items-center gap-2"><img src={MOCK_NEWS[0].authorAvatar} className="w-6 h-6 rounded-full" /> {MOCK_NEWS[0].authorName}</div>
              <div className="flex items-center gap-2"><Calendar size={16} /> {MOCK_NEWS[0].publishDate}</div>
              <div className="flex items-center gap-2"><Clock size={16} /> {MOCK_NEWS[0].readTime}</div>
            </div>
          </div>
        </div>

        {/* Recent Grid */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-teal-500 rounded-full"></div> Latest Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_NEWS.slice(1).map(item => (
              <div key={item.id} onClick={() => handleArticleClick(item)} className={`${THEME.card} overflow-hidden group cursor-pointer flex flex-col h-full`}>
                <div className="h-64 overflow-hidden relative">
                  <img src={item.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
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
                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
                    <img src={item.authorAvatar} className="w-6 h-6 rounded-full" alt="" />
                    <span className="text-xs font-bold text-slate-600">{item.authorName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewsModule;
