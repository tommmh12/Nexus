import React, { useState, useEffect } from "react";
import { NewsArticle } from "../../types";
import { newsService } from "../../services/newsService";
import { useRealtimeNews } from "../../hooks/useRealtimeNews";
import { Button } from "../system/ui/Button";
import { Input } from "../system/ui/Input";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ArrowRight,
  Share2,
  Printer,
  Edit2,
  Trash2,
  Plus,
  Image,
  Save,
  X,
  Tag,
  Search,
  Filter,
  Eye,
  MoreVertical,
  CheckCircle,
  FileText,
  Layout,
  Maximize2,
  Grid,
  List as ListIcon,
  AlertCircle,
} from "lucide-react";

// --- Sub-component: News Detail (Reader View) ---
export const NewsDetail = ({
  article,
  onBack,
}: {
  article: NewsArticle;
  onBack: () => void;
}) => {
  return (
    <div className="animate-fadeIn max-w-4xl mx-auto bg-white min-h-screen pb-12 shadow-sm rounded-xl overflow-hidden mt-4">
      {/* Header Image */}
      <div className="relative h-[400px] w-full group">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
        <Button
          variant="outline"
          onClick={onBack}
          className="absolute top-6 left-6 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md"
        >
          <ArrowLeft size={16} className="mr-2" /> Quay lại
        </Button>

        <div className="absolute bottom-0 left-0 p-8 w-full">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-brand-600 text-white text-xs font-bold uppercase tracking-wider mb-4 rounded-sm">
              {article.category}
            </span>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center text-slate-300 text-sm gap-6">
              <div className="flex items-center gap-2">
                <img
                  src={article.authorAvatar}
                  alt=""
                  className="w-6 h-6 rounded-full border border-white/30"
                />
                <span>{article.authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{article.publishDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="px-8 py-10">
        <div className="flex gap-10">
          <div className="flex-1">
            <p className="text-xl text-slate-600 font-medium leading-relaxed mb-8 border-l-4 border-brand-500 pl-4 italic">
              {article.summary}
            </p>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
                  >
                    <Tag size={12} className="mr-1 opacity-50" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="prose prose-lg prose-slate max-w-none text-slate-800">
              {/* Render HTML content safely in real app */}
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="w-64 hidden lg:block sticky top-8 h-fit space-y-6">
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Chia sẻ bài viết
              </h4>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Share2 size={16} className="mr-2" /> Share
                </Button>
                <Button variant="outline" className="w-10 px-0">
                  <Printer size={16} />
                </Button>
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
    coverImage:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070",
    status: "Draft",
    tags: [],
    authorName: "Admin", // Mock default
    authorAvatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100",
    publishDate: new Date().toLocaleDateString("vi-VN"),
    readTime: "5 phút đọc",
  });

  const [tagInput, setTagInput] = useState("");

  // Reset form data when article changes
  useEffect(() => {
    if (article) {
      setFormData(article);
    } else {
      // Reset to default values when creating new article
      setFormData({
        title: "",
        summary: "",
        content: "",
        category: "Announcement",
        coverImage:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070",
        status: "Draft",
        tags: [],
        authorName: "Admin", // Mock default
        authorAvatar:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100",
        publishDate: new Date().toLocaleDateString("vi-VN"),
        readTime: "5 phút đọc",
      });
    }
    setTagInput(""); // Reset tag input as well
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
    
    // Validate required fields
    if (!formData.title || !formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết");
      return;
    }
    
    if (!formData.content || !formData.content.trim()) {
      alert("Vui lòng nhập nội dung bài viết");
      return;
    }
    
    // Ensure all required fields are present
    const articleToSave: NewsArticle = {
      id: article?.id || `news-${Date.now()}`,
      title: formData.title.trim(),
      summary: formData.summary || "",
      content: formData.content.trim(),
      coverImage: formData.coverImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070",
      category: formData.category || "Announcement",
      authorName: formData.authorName || "Admin",
      authorAvatar: formData.authorAvatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100",
      publishDate: formData.publishDate || new Date().toLocaleDateString("vi-VN"),
      readTime: formData.readTime || "5 phút đọc",
      status: formData.status || "Draft",
      tags: formData.tags || [],
      isFeatured: formData.isFeatured || false,
    };
    
    onSave(articleToSave);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {article ? "Chỉnh sửa bài viết" : "Soạn bài viết mới"}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">
                {article ? article.id : "NEW"}
              </span>
              <span>•</span>
              <span>Chế độ soạn thảo</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              form="news-form"
              className="bg-brand-600 hover:bg-brand-700 shadow-md"
            >
              <Save size={18} className="mr-2" /> Lưu bài viết
            </Button>
          </div>
        </div>

        {/* Main Layout: 2 Columns */}
        <div className="flex-1 overflow-hidden">
          <form
            id="news-form"
            onSubmit={handleSubmit}
            className="h-full flex flex-col lg:flex-row"
          >
            {/* Left Column: Content (70%) */}
            <div className="flex-1 overflow-y-auto p-8 border-r border-slate-200 custom-scrollbar bg-slate-50/30">
              <div className="space-y-6 max-w-4xl mx-auto bg-white p-8 shadow-sm border border-slate-100 rounded-xl min-h-full">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    placeholder="Nhập tiêu đề bài viết..."
                    className="w-full text-3xl font-bold text-slate-900 border-none focus:ring-0 outline-none placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tóm tắt (Sapo)
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"
                    value={formData.summary}
                    onChange={(e) => handleChange("summary", e.target.value)}
                    placeholder="Mô tả ngắn gọn nội dung bài viết để thu hút người đọc..."
                  ></textarea>
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Nội dung chi tiết
                    </label>
                    <button
                      type="button"
                      className="text-xs text-brand-600 hover:underline flex items-center bg-brand-50 px-2 py-1 rounded"
                    >
                      <Maximize2 size={12} className="mr-1" /> Toàn màn hình
                    </button>
                  </div>
                  <textarea
                    className="w-full flex-1 bg-white border border-slate-200 rounded-lg p-4 text-base focus:ring-2 focus:ring-brand-500 outline-none min-h-[400px] font-mono leading-relaxed"
                    value={formData.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    placeholder="<p>Nội dung bài viết bắt đầu tại đây...</p>"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Right Column: Settings Sidebar (30%) */}
            <div className="w-full lg:w-[320px] bg-white overflow-y-auto p-6 space-y-6 custom-scrollbar border-l border-slate-200">
              {/* Card 1: Publish Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Layout size={16} className="text-brand-600" /> Cài đặt xuất
                  bản
                </h3>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                    Trạng thái
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-brand-500"
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="Draft">Bản nháp (Draft)</option>
                    <option value="Published">Đã xuất bản (Published)</option>
                    <option value="Archived">Lưu trữ (Archived)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                    Chuyên mục
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-brand-500"
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                  >
                    <option value="Strategy">Chiến lược</option>
                    <option value="Event">Sự kiện</option>
                    <option value="Culture">Văn hóa</option>
                    <option value="Announcement">Thông báo</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                    Ngày đăng
                  </label>
                  <input
                    type="text"
                    value={formData.publishDate}
                    onChange={(e) =>
                      handleChange("publishDate", e.target.value)
                    }
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Card 2: Media */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Image size={16} className="text-brand-600" /> Ảnh bìa
                </h3>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                    URL Ảnh
                  </label>
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => handleChange("coverImage", e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-brand-500"
                  />
                  {formData.coverImage ? (
                    <div className="mt-2 rounded-lg overflow-hidden aspect-video border border-slate-200 relative group">
                      <img
                        src={formData.coverImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                        Xem trước
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg aspect-video border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
                      Chưa có ảnh
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Tags */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Tag size={16} className="text-brand-600" /> Phân loại
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center bg-brand-50 border border-brand-100 text-brand-700 text-xs px-2 py-1 rounded-md font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-brand-400 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 pl-8 text-sm outline-none focus:border-brand-500"
                    placeholder="Thêm tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  <Plus
                    size={14}
                    className="absolute left-2.5 top-2.5 text-slate-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Nhấn Enter để thêm thẻ mới.
                </p>
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
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Published" | "Draft"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const allNews = await newsService.getAll();
        setNews(allNews);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Real-time updates
  useRealtimeNews({
    onArticleCreated: (article) => {
      setNews((prev) => [article, ...prev]);
    },
    onArticleUpdated: (article) => {
      setNews((prev) => prev.map((a) => (a.id === article.id ? article : a)));
    },
    onArticlePublished: (article) => {
      setNews((prev) => prev.map((a) => (a.id === article.id ? article : a)));
    },
    onArticleArchived: (article) => {
      setNews((prev) => prev.map((a) => (a.id === article.id ? article : a)));
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await newsService.deleteArticle(id);
        setNews((prev) => prev.filter((a) => a.id !== id));
      } catch (error: any) {
        alert(error.message || "Không thể xóa bài viết");
      }
    }
  };

  const handleSave = (article: NewsArticle) => {
    if (editingArticle) {
      setNews((prev) => prev.map((a) => (a.id === article.id ? article : a)));
    } else {
      const newArticle = { ...article, id: `news-${Date.now()}` };
      setNews((prev) => [newArticle, ...prev]);
    }
    setIsEditorOpen(false);
  };

  const handleCreate = () => {
    setEditingArticle(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setIsEditorOpen(true);
  };

  const filteredNews = news.filter((item) => {
    const matchesStatus =
      filterStatus === "All" || item.status === filterStatus;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="animate-fadeIn h-full flex flex-col relative">
      {/* Modal Editor */}
      {isEditorOpen && (
        <NewsEditorModal
          article={editingArticle}
          onSave={handleSave}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Tin tức</h2>
          <p className="text-slate-500 mt-1">
            CMS - Hệ thống quản trị nội dung bản tin.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={18} className="mr-2" /> Viết bài mới
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {["All", "Published", "Draft"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filterStatus === status
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {status === "All" ? "Tất cả" : status}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <div className="relative flex-1 md:flex-none">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm tiêu đề..."
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* View Toggles */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md ${
              viewMode === "list"
                ? "bg-white shadow text-brand-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ListIcon size={18} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md ${
              viewMode === "grid"
                ? "bg-white shadow text-brand-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
          {filteredNews.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {news.length === 0 ? "Chưa có bài viết nào" : "Không tìm thấy bài viết"}
              </h3>
              <p className="text-slate-500 mb-4">
                {news.length === 0 
                  ? "Bắt đầu bằng cách tạo bài viết mới để quản lý nội dung bản tin."
                  : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."}
              </p>
              {news.length === 0 && (
                <Button onClick={handleCreate}>
                  <Plus size={18} className="mr-2" /> Tạo bài viết đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Bài viết
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Tác giả
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Chuyên mục
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredNews.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4 w-[40%]">
                    <div className="flex gap-4">
                      <div className="h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={item.coverImage}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      <div>
                        <div
                          className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-brand-600 cursor-pointer"
                          onClick={() => handleEdit(item)}
                        >
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock size={12} /> {item.publishDate}
                          <span>•</span>
                          <Eye size={12} /> 1,234 views
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.authorAvatar}
                        className="w-6 h-6 rounded-full"
                        alt=""
                      />
                      <span className="text-sm text-slate-700 font-medium">
                        {item.authorName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        item.status === "Published"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : item.status === "Draft"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.status === "Published"
                            ? "bg-green-500"
                            : item.status === "Draft"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        }`}
                      ></div>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div>
          {filteredNews.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
              <FileText className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {news.length === 0 ? "Chưa có bài viết nào" : "Không tìm thấy bài viết"}
              </h3>
              <p className="text-slate-500 mb-4">
                {news.length === 0 
                  ? "Bắt đầu bằng cách tạo bài viết mới để quản lý nội dung bản tin."
                  : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."}
              </p>
              {news.length === 0 && (
                <Button onClick={handleCreate}>
                  <Plus size={18} className="mr-2" /> Tạo bài viết đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
              {filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={item.coverImage}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt=""
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-sm ${
                      item.status === "Published"
                        ? "bg-green-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-xs text-slate-500 mb-2">
                  {item.category}
                </div>
                <h3
                  className="font-bold text-slate-900 mb-2 line-clamp-2 leading-snug cursor-pointer hover:text-brand-600"
                  onClick={() => handleEdit(item)}
                >
                  {item.title}
                </h3>
                <div className="mt-auto flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    {item.publishDate}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
            </div>
          )}
        </div>
      )}
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const publishedNews = await newsService.getPublished();
        setNews(publishedNews);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Không thể tải bản tin. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Real-time updates for published articles
  useRealtimeNews({
    onArticlePublished: (article) => {
      if (article.status === "Published") {
        setNews((prev) => {
          const exists = prev.find((a) => a.id === article.id);
          if (exists) {
            return prev.map((a) => (a.id === article.id ? article : a));
          } else {
            return [article, ...prev];
          }
        });
      }
    },
    onArticleUpdated: (article) => {
      if (article.status === "Published") {
        setNews((prev) => prev.map((a) => (a.id === article.id ? article : a)));
      } else {
        setNews((prev) => prev.filter((a) => a.id !== article.id));
      }
    },
    onArticleArchived: (article) => {
      setNews((prev) => prev.filter((a) => a.id !== article.id));
    },
  });

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    setView("detail");
    window.scrollTo(0, 0);
  };

  // Filter only published news for readers
  const publishedNews = news.filter((n) => n.status === "Published");

  if (loading) {
    return (
      <div className="animate-fadeIn h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
          <p className="text-slate-500">Đang tải bản tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fadeIn h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button
            onClick={() => {
              setError(null);
              setLoading(true);
              newsService.getPublished()
                .then((data) => {
                  setNews(data);
                  setLoading(false);
                })
                .catch((err) => {
                  console.error("Error fetching news:", err);
                  setError("Không thể tải bản tin. Vui lòng thử lại sau.");
                  setLoading(false);
                });
            }}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn h-full">
      {view === "list" ? (
        <div className="space-y-8 p-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Bản tin Công ty
              </h1>
              <p className="text-slate-500">
                Cập nhật tin tức, sự kiện và thông báo mới nhất từ Nexus Corp.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
              <Search size={18} className="text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                className="bg-transparent border-none outline-none text-sm py-1 w-64"
              />
            </div>
          </div>

          {/* Empty State */}
          {publishedNews.length === 0 && (
            <div className="text-center py-16">
              <FileText className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có bản tin nào</h3>
              <p className="text-slate-500">Hiện tại chưa có bản tin nào được xuất bản.</p>
            </div>
          )}

          {/* Featured News (First item) */}
          {publishedNews.length > 0 && (
            <div
              onClick={() => handleArticleClick(publishedNews[0])}
              className="group relative h-[400px] w-full rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
            >
              <img
                src={publishedNews[0].coverImage}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-4xl">
                <span className="inline-block px-3 py-1 bg-brand-600 text-white text-xs font-bold uppercase tracking-wider mb-4 rounded-sm shadow-lg">
                  {publishedNews[0].category}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-brand-100 transition-colors">
                  {publishedNews[0].title}
                </h2>
                <p className="text-slate-200 text-lg mb-6 line-clamp-2 max-w-2xl">
                  {publishedNews[0].summary}
                </p>

                <div className="flex items-center text-white/80 text-sm gap-6 font-medium">
                  <div className="flex items-center gap-2">
                    <img
                      src={publishedNews[0].authorAvatar}
                      alt=""
                      className="w-6 h-6 rounded-full border border-white/30"
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
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-600 rounded-full"></span> Tin
              mới nhất
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedNews.slice(1).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleArticleClick(item)}
                  className="group cursor-pointer flex flex-col h-full"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-sm">
                    <img
                      src={item.coverImage}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt=""
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-2 py-1 rounded shadow-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center text-xs text-slate-500 mb-2 gap-2">
                      <span>{item.publishDate}</span>
                      <span>•</span>
                      <span>{item.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-auto">
                      <img
                        src={item.authorAvatar}
                        className="w-6 h-6 rounded-full"
                        alt=""
                      />
                      <span className="text-xs font-semibold text-slate-700">
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
