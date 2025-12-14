import React, { useState, useEffect } from "react";
import { NewsArticle } from "../../../types";
import { Button } from "../../../components/system/ui/Button";
import { newsService, NewsArticle as NewsArticleAPI } from "../../../services/newsService";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Printer,
  Trash2,
  Plus,
  Image,
  Save,
  X,
  Tag,
  Search,
  Eye,
  CheckCircle,
  FileText,
  Layout,
  Maximize2,
  List as ListIcon,
  Grid,
  Check,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare
} from "lucide-react";

// --- Utility Components ---

const Badge = ({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "danger" | "outline", className?: string }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    outline: "bg-white text-slate-600 border-slate-200"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
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
            <Badge variant="success" className="mb-4 bg-brand-600 text-white border-none py-1 px-3">
              {article.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight shadow-black/10 text-shadow-sm">
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
            <p className="text-xl text-slate-600 font-serif leading-relaxed mb-10 first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px] first-letter:text-slate-900">
              {article.summary}
            </p>

            <div className="prose prose-lg prose-slate max-w-none text-slate-800 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-600 hover:prose-a:text-brand-700">
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
                  <Button variant="outline" className="w-full justify-start text-slate-600 hover:text-brand-600 hover:border-brand-200 bg-white">
                    <Share2 size={16} className="mr-3" /> Sao chép liên kết
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-slate-600 hover:text-brand-600 hover:border-brand-200 bg-white">
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

// --- Sub-component: News Editor Modal (Redesigned) ---
interface NewsEditorProps {
  article?: NewsArticle | null;
  onSave: (article: NewsArticle) => void;
  onClose: () => void;
}

export const NewsEditorModal = ({
  article,
  onSave,
  onClose,
}: NewsEditorProps) => {
  const [formData, setFormData] = useState<Partial<NewsArticle>>({
    title: "",
    summary: "",
    content: "",
    category: "Announcement",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070",
    status: "Draft",
    tags: [],
    authorName: "Admin", // Mock default
    authorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100",
    publishDate: new Date().toLocaleDateString("vi-VN"),
    readTime: "5 phút đọc",
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (article) {
      setFormData(article);
    }
  }, [article]);

  const handleChange = (field: keyof NewsArticle, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTags = [...(formData.tags || []), tagInput.trim()];
      handleChange("tags", newTags);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleChange(
      "tags",
      formData.tags?.filter((t) => t !== tagToRemove)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as NewsArticle);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-200">

        {/* Toolbar Header */}
        <div className="h-16 px-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 z-20">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose} className="hover:bg-slate-100 -ml-2">
              <X size={20} className="text-slate-500" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {article ? "Chỉnh sửa bài viết" : "Soạn bài viết mới"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className={formData.status === 'Published' ? 'text-emerald-600 font-medium' : 'text-slate-500'}>
                  {formData.status === 'Published' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
                <span>•</span>
                <span>Lưu lần cuối: Vừa xong</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              form="news-form"
              className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
            >
              <Save size={18} className="mr-2" /> Lưu & Xuất bản
            </Button>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          <form id="news-form" onSubmit={handleSubmit} className="flex-1 flex flex-col lg:flex-row h-full">

            {/* Editor Canvas */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 custom-scrollbar">
              <div className="max-w-4xl mx-auto bg-white min-h-full rounded-xl shadow-sm border border-slate-200 p-12">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  placeholder="Tiêu đề bài viết"
                  className="w-full text-4xl font-bold text-slate-900 border-none focus:ring-0 outline-none placeholder:text-slate-300 mb-6 bg-transparent p-0"
                />

                <div className="mb-8">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Sapo / Tóm tắt</label>
                  <textarea
                    className="w-full bg-slate-50 border-l-4 border-slate-200 hover:border-brand-500 focus:border-brand-500 p-4 text-lg text-slate-600 italic outline-none resize-none transition-colors rounded-r-lg"
                    value={formData.summary}
                    onChange={(e) => handleChange("summary", e.target.value)}
                    placeholder="Nhập tóm tắt ngắn gọi cho bài viết..."
                    rows={3}
                  ></textarea>
                </div>

                <div className="prose prose-lg max-w-none">
                  <textarea
                    className="w-full h-[500px] outline-none text-slate-800 placeholder:text-slate-300 resize-none font-serif leading-relaxed text-lg"
                    value={formData.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    placeholder="Nội dung bài viết bắt đầu tại đây..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Settings Sidebar */}
            <div className="w-[320px] bg-white border-l border-slate-200 overflow-y-auto p-6 space-y-8 flex-shrink-0 custom-scrollbar z-10 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.05)]">
              {/* Status & Visibility */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Layout size={14} className="text-brand-600" /> Cài đặt chung
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Trạng thái</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      value={formData.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Chuyên mục</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                    >
                      <option value="Announcement">Thông báo</option>
                      <option value="Strategy">Chiến lược</option>
                      <option value="Event">Sự kiện</option>
                      <option value="Culture">Văn hóa</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Ngày xuất bản</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      value={formData.publishDate}
                      onChange={(e) => handleChange("publishDate", e.target.value)}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Image size={14} className="text-brand-600" /> Media & SEO
                </h3>

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Ảnh đại diện (URL)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    value={formData.coverImage}
                    onChange={(e) => handleChange("coverImage", e.target.value)}
                    placeholder="https://..."
                  />

                  <div className="mt-3 aspect-video rounded-lg border border-slate-200 bg-slate-50 overflow-hidden relative group">
                    {formData.coverImage ? (
                      <img src={formData.coverImage} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        <Image size={24} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Tag size={14} className="text-brand-600" /> Phân loại
                </h3>

                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {formData.tags?.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 bg-brand-50 text-brand-700 rounded text-xs font-medium group">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-brand-400 hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    placeholder="Thêm thẻ tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  <Plus size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- News Manager (ADMIN COMPONENT) ---
export const NewsManager = () => {
  const [news, setNews] = useState<NewsArticleAPI[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticleAPI | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Published" | "Draft" | "Archived"
  >("All");
  const [filterModeration, setFilterModeration] = useState<
    "All" | "Pending" | "Approved" | "Rejected"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isLoading, setIsLoading] = useState(false);

  // Load news from API
  useEffect(() => {
    loadNews();
  }, [filterStatus, filterModeration]);

  const loadNews = async () => {
    try {
      setIsLoading(true);
      const articles = await newsService.getAllArticles({
        status: filterStatus !== "All" ? filterStatus : undefined,
        moderationStatus: filterModeration !== "All" ? filterModeration : undefined,
      });
      setNews(articles);
    } catch (error) {
      console.error("Error loading news:", error);
      alert("Không thể tải danh sách bài viết. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await newsService.deleteArticle(id);
        await loadNews();
        alert("Xóa bài viết thành công!");
      } catch (error: any) {
        console.error("Error deleting article:", error);
        alert(error.response?.data?.error || "Không thể xóa bài viết. Vui lòng thử lại.");
      }
    }
  };

  const handleSave = async (article: NewsArticle) => {
    // Validate required fields
    if (!article.title || !article.title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết!");
      return;
    }
    if (!article.content || !article.content.trim()) {
      alert("Vui lòng nhập nội dung bài viết!");
      return;
    }
    if (!article.category) {
      alert("Vui lòng chọn danh mục!");
      return;
    }

    try {
      if (editingArticle) {
        await newsService.updateArticle(editingArticle.id, article as any);
      } else {
        await newsService.createArticle(article as any);
      }
      await loadNews();
      setIsEditorOpen(false);
      alert(editingArticle ? "Cập nhật bài viết thành công!" : "Tạo bài viết thành công!");
    } catch (error: any) {
      console.error("Error saving article:", error);
      alert(error.response?.data?.error || "Không thể lưu bài viết. Vui lòng thử lại.");
    }
  };

  const handleModerate = async (id: string, status: "Approved" | "Rejected", notes?: string) => {
    try {
      await newsService.moderateArticle(id, status, notes);
      await loadNews();
      alert(`${status === "Approved" ? "Duyệt" : "Từ chối"} bài viết thành công!`);
    } catch (error: any) {
      console.error("Error moderating article:", error);
      alert(error.response?.data?.error || "Không thể kiểm duyệt bài viết. Vui lòng thử lại.");
    }
  };

  const handleCreate = () => {
    setEditingArticle(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (article: NewsArticleAPI) => {
    setEditingArticle(article);
    setIsEditorOpen(true);
  };

  const filteredNews = news.filter((item) => {
    const matchesStatus =
      filterStatus === "All" || item.status === filterStatus;
    const matchesModeration =
      filterModeration === "All" || item.moderationStatus === filterModeration;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesModeration && matchesSearch;
  });

  return (
    <div className="animate-fadeIn h-full flex flex-col relative px-8 py-8 max-w-[1600px] mx-auto">
      {/* Modal Editor */}
      {isEditorOpen && (
        <NewsEditorModal
          article={editingArticle}
          onSave={handleSave}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {/* Header */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">CMS</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500 text-xs font-medium tracking-wide">News Management</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Quản lý Tin tức</h2>
          <p className="text-slate-500 mt-1 max-w-2xl">
            Soạn thảo, xuất bản và quản lý các thông báo quan trọng của công ty.
          </p>
        </div>

        <Button onClick={handleCreate} className="bg-brand-600 hover:bg-brand-700 shadow-md text-white px-6">
          <Plus size={18} className="mr-2" /> Viết bài mới
        </Button>
      </div>

      {/* KPI Cards - Clean & Professional */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Tổng bài viết", value: news.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Chờ duyệt", value: news.filter((n) => n.moderationStatus === "Pending").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Đã xuất bản", value: news.filter((n) => n.status === "Published" && n.moderationStatus === "Approved").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Tổng lượt xem", value: news.reduce((sum, n) => sum + (n.viewCount || 0), 0).toLocaleString(), icon: Eye, color: "text-indigo-600", bg: "bg-indigo-50" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              {i === 2 && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>}
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-2 z-20">
        <div className="flex items-center gap-2 flex-1 w-full pl-2">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
              placeholder="Tìm kiếm theo tiêu đề, tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="h-6 w-px bg-slate-200 mx-2"></div>

          {/* Filters */}
          <select
            className="bg-transparent text-sm font-medium text-slate-600 outline-none hover:text-slate-900 cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Published">Đã xuất bản</option>
            <option value="Draft">Bản nháp</option>
            <option value="Archived">Lưu trữ</option>
          </select>

          <select
            className="bg-transparent text-sm font-medium text-slate-600 outline-none hover:text-slate-900 cursor-pointer ml-4"
            value={filterModeration}
            onChange={(e) => setFilterModeration(e.target.value as any)}
          >
            <option value="All">Tất cả kiểm duyệt</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Rejected">Bị từ chối</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ListIcon size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-4"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText size={48} className="mb-4 text-slate-200" />
            <p className="text-lg font-medium text-slate-900">Không tìm thấy bài viết nào</p>
            <p className="text-sm mb-6">Thử thay đổi bộ lọc hoặc tạo bài viết mới.</p>
            <Button onClick={handleCreate} className="bg-brand-600 text-white">Tạo bài viết mới</Button>
          </div>
        ) : viewMode === "list" ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-[40%]">Bài viết</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tác giả</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Kiểm duyệt</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNews.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex gap-4">
                      <div className="w-16 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                        <img src={item.coverImage} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-brand-600 transition-colors cursor-pointer" onClick={() => handleEdit(item)}>
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{item.category}</span>
                          <span>•</span>
                          <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : 'Chưa xuất bản'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <img src={item.authorAvatar} className="w-6 h-6 rounded-full" alt="" />
                      <span className="text-sm text-slate-700">{item.authorName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={item.status === 'Published' ? 'success' : item.status === 'Draft' ? 'warning' : 'default'}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    {item.moderationStatus === "Pending" ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">Chờ duyệt</Badge>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button onClick={() => handleModerate(item.id, "Approved")} className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200" title="Duyệt">
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Lý do từ chối:");
                              if (reason) handleModerate(item.id, "Rejected", reason);
                            }}
                            className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200" title="Từ chối"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ) : item.moderationStatus === "Approved" ? (
                      <Badge variant="success">Đã duyệt</Badge>
                    ) : (
                      <Badge variant="danger">Từ chối</Badge>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(item)} className="p-2 text-slate-500 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNews.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer" onClick={() => handleEdit(item)}>
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  <img src={item.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant={item.status === 'Published' ? 'success' : 'default'} className="shadow-sm backdrop-blur-sm bg-white/90">
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-xs text-brand-600 font-bold uppercase tracking-wider mb-2">{item.category}</div>
                  <h4 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">{item.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{item.summary}</p>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-2">
                      <img src={item.authorAvatar} className="w-5 h-5 rounded-full" alt="" />
                      <span className="text-xs font-medium text-slate-700">{item.authorName}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Eye size={12} />{item.viewCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

  // TODO: Load news from API
  useEffect(() => {
    // Mock data for now - replace with API call
    const mockNews: NewsArticle[] = [
      {
        id: "1",
        title: "Chào mừng đến với Nexus Corp",
        summary: "Khởi đầu mới cho một hành trình phát triển",
        content: "<p>Nội dung bài viết...</p>",
        coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
        category: "Announcement",
        authorName: "Admin",
        authorAvatar: "https://ui-avatars.com/api/?name=Admin",
        publishDate: "2024-01-15",
        readTime: "5 phút đọc",
        isFeatured: true,
        status: "Published",
        tags: ["announcement", "welcome"],
      },
    ];
    setNews(mockNews);
  }, []);

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    setView("detail");
    window.scrollTo(0, 0);
  };

  // Filter only published news for readers
  const publishedNews = news.filter((n) => n.status === "Published");

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
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
              <h3 className="text-2xl font-bold text-slate-900">Mới cập nhật</h3>
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
                        className="w-6 h-6 rounded-full grayscale group-hover:grayscale-0 transition-all"
                        alt=""
                      />
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
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
