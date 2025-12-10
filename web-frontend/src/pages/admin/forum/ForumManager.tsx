import React, { useState, useEffect } from "react";
import { forumService, ForumPost, ForumCategory } from "../../../services/forumService";
import { Button } from "../../../components/system/ui/Button";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  ArrowBigUp,
  Shield,
  ShieldCheck,
  ShieldX,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Pin,
  BarChart3,
  Users,
  TrendingUp,
  FileText,
  AlertTriangle,
  Calendar,
  User,
  Tag,
  Plus,
  Save,
  X,
  Check,
  MoreHorizontal
} from "lucide-react";

// --- Utility Components ---

const Badge = ({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "danger" | "outline" | "brand", className?: string }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    brand: "bg-indigo-50 text-indigo-700 border-indigo-200",
    outline: "bg-white text-slate-600 border-slate-200"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const ForumManager = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "categories">("posts");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showModerationModal, setShowModerationModal] = useState(false);

  // Category management states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: "",
    colorClass: "",
    order: 0,
  });

  useEffect(() => {
    if (activeTab === "posts") {
      loadPosts();
    } else {
      loadCategories();
    }
  }, [filterStatus, activeTab]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await forumService.getAllPosts({
        status: filterStatus !== "All" ? filterStatus : undefined,
      });
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
      alert("Không thể tải danh sách bài viết. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async (id: string, status: "Approved" | "Rejected", notes?: string) => {
    try {
      await forumService.moderatePost(id, status, notes);
      await loadPosts();
      setShowModerationModal(false);
      setSelectedPost(null);
      alert(`${status === "Approved" ? "Duyệt" : "Từ chối"} bài viết thành công!`);
    } catch (error: any) {
      console.error("Error moderating post:", error);
      alert(error.response?.data?.error || "Không thể kiểm duyệt bài viết. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await forumService.deletePost(id);
        await loadPosts();
        alert("Xóa bài viết thành công!");
      } catch (error: any) {
        console.error("Error deleting post:", error);
        alert(error.response?.data?.error || "Không thể xóa bài viết. Vui lòng thử lại.");
      }
    }
  };

  // Category management functions
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await forumService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      alert("Không thể tải danh sách danh mục. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCategoryModal = (category?: ForumCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "",
        colorClass: category.colorClass || "",
        order: category.order,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        description: "",
        icon: "",
        colorClass: "",
        order: categories.length > 0 ? Math.max(...categories.map(c => c.order)) + 1 : 0,
      });
    }
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert("Vui lòng nhập tên danh mục!");
      return;
    }

    try {
      if (editingCategory) {
        await forumService.updateCategory(editingCategory.id, categoryForm);
        alert("Cập nhật danh mục thành công!");
      } else {
        await forumService.createCategory(categoryForm);
        alert("Tạo danh mục thành công!");
      }
      await loadCategories();
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "", icon: "", colorClass: "", order: 0 });
    } catch (error: any) {
      console.error("Error saving category:", error);
      alert(error.response?.data?.error || "Không thể lưu danh mục. Vui lòng thử lại.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này? Các bài viết trong danh mục này sẽ bị ảnh hưởng.")) {
      try {
        await forumService.deleteCategory(id);
        await loadCategories();
        alert("Xóa danh mục thành công!");
      } catch (error: any) {
        console.error("Error deleting category:", error);
        alert(error.response?.data?.error || "Không thể xóa danh mục. Vui lòng thử lại.");
      }
    }
  };

  // Moderation Modal Component
  const ModerationModal = ({ post, onApprove, onReject, onClose }: {
    post: ForumPost;
    onApprove: () => void;
    onReject: (notes: string) => void;
    onClose: () => void;
  }) => {
    const [rejectNotes, setRejectNotes] = useState("");

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Kiểm duyệt bài viết</h3>
              <p className="text-xs text-slate-500 mt-0.5">ID: {post.id}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 hover:shadow-sm transition-all">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
            <div className="flex gap-8">
              {/* Post Content */}
              <div className="flex-1">
                <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mb-6">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                      <img src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName}`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{post.authorName}</h4>
                      <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-4">{post.title}</h2>
                  <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </div>
                </div>

                {/* Rejection Notes Area */}
                {post.status === "Pending" && (
                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                    <label className="text-sm font-bold text-amber-900 mb-2 block flex items-center gap-2">
                      <AlertTriangle size={16} /> Ghi chú từ chối (bắt buộc nếu từ chối)
                    </label>
                    <textarea
                      className="w-full bg-white border border-amber-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none h-24 resize-none"
                      placeholder="Nhập lý do từ chối bài viết này..."
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="w-72 flex-shrink-0 space-y-6">
                {/* Quick Stats */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thông số</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-sm text-slate-600 flex items-center gap-2"><Eye size={14} /> Lượt xem</span>
                      <span className="font-semibold text-slate-900">{post.viewCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-sm text-slate-600 flex items-center gap-2"><MessageSquare size={14} /> Bình luận</span>
                      <span className="font-semibold text-slate-900">{post.commentCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-600 flex items-center gap-2"><ArrowBigUp size={14} /> Upvotes</span>
                      <span className="font-semibold text-slate-900">{post.upvoteCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tình trạng</h4>
                  <div className="flex flex-col gap-2">
                    <Badge
                      variant={post.status === 'Approved' ? 'success' : post.status === 'Pending' ? 'warning' : 'danger'}
                      className="w-fit"
                    >
                      {post.status}
                    </Badge>
                    {post.categoryName && <Badge variant="default" className="w-fit">{post.categoryName}</Badge>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-white z-10">
            <Button variant="ghost" onClick={onClose} className="text-slate-500">
              Đóng
            </Button>
            {post.status === "Pending" && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (rejectNotes.trim()) {
                      onReject(rejectNotes);
                    } else {
                      alert("Vui lòng nhập lý do từ chối!");
                    }
                  }}
                  className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-sm"
                >
                  <ShieldX size={16} className="mr-2" /> Từ chối
                </Button>
                <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                  <ShieldCheck size={16} className="mr-2" /> Duyệt bài
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: posts.length,
    pending: posts.filter((p) => p.status === "Pending").length,
    approved: posts.filter((p) => p.status === "Approved").length,
    rejected: posts.filter((p) => p.status === "Rejected").length,
    totalViews: posts.reduce((sum, p) => sum + p.viewCount, 0),
    totalComments: posts.reduce((sum, p) => sum + p.commentCount, 0),
  };

  return (
    <div className="animate-fadeIn h-full flex flex-col px-8 py-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">CMS</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500 text-xs font-medium tracking-wide">Community</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Diễn đàn Nội bộ</h2>
          <p className="text-slate-500 mt-1 max-w-2xl">
            Kiểm duyệt nội dung, quản lý danh mục và theo dõi các cuộc thảo luận.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'posts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Bài viết
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'categories' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Danh mục
          </button>
        </div>
      </div>

      {/* KPI Cards - Clean & Professional */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Tổng thảo luận", value: stats.total, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Cần duyệt", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Đã duyệt", value: stats.approved, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Tương tác", value: (stats.totalViews + stats.totalComments).toLocaleString(), icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Conditional Content based on activeTab */}
      {activeTab === "posts" ? (
        <>
          {/* Controls */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-2 z-20">
            <div className="flex items-center gap-2 flex-1 w-full pl-2">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  placeholder="Tìm kiếm nội dung thảo luận..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="h-6 w-px bg-slate-200 mx-2"></div>

              {/* Filter */}
              <select
                className="bg-transparent text-sm font-medium text-slate-600 outline-none hover:text-slate-900 cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Rejected">Đã từ chối</option>
              </select>
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-4"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <MessageSquare size={48} className="mb-4 text-slate-200" />
                <p className="text-lg font-medium text-slate-900">Không có bài viết nào</p>
                <p className="text-sm">Chưa có nội dung nào phù hợp với bộ lọc hiện tại.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-[40%]">Bài viết</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tác giả</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tương tác</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          {post.isPinned && <Pin size={16} className="text-brand-600 fill-brand-600 shrink-0 mt-1" />}
                          <div>
                            <h4
                              className="text-sm font-bold text-slate-900 mb-1 group-hover:text-brand-600 transition-colors cursor-pointer"
                              onClick={() => { setSelectedPost(post); setShowModerationModal(true); }}
                            >
                              {post.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mb-2">{post.content}</p>
                            {post.categoryName && <Badge variant="outline">{post.categoryName}</Badge>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                            {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full rounded-full" alt="" /> : post.authorName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{post.authorName}</p>
                            <p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-start gap-2">
                          <Badge variant={post.status === 'Approved' ? 'success' : post.status === 'Pending' ? 'warning' : 'danger'}>
                            {post.status}
                          </Badge>
                          {post.status === 'Pending' && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setSelectedPost(post); setShowModerationModal(true); }}
                                className="text-xs px-2 py-1 bg-brand-50 text-brand-700 rounded hover:bg-brand-100 font-medium"
                              >
                                Xử lý
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><Eye size={14} /> {post.viewCount}</span>
                          <span className="flex items-center gap-1"><MessageSquare size={14} /> {post.commentCount}</span>
                          <span className="flex items-center gap-1"><ArrowBigUp size={14} /> {post.upvoteCount}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => { setSelectedPost(post); setShowModerationModal(true); }}
                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Categories Management */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Danh mục Diễn đàn</h3>
                <p className="text-sm text-slate-500">Quản lý cấu trúc chủ đề của diễn đàn.</p>
              </div>
              <Button onClick={() => handleOpenCategoryModal()} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
                <Plus size={16} className="mr-2" /> Thêm danh mục
              </Button>
            </div>

            {isLoading ? (
              <div className="p-20 text-center text-slate-500">Đang tải...</div>
            ) : categories.length === 0 ? (
              <div className="p-20 text-center text-slate-500">Chưa có danh mục nào.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên danh mục</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Icon / Màu</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Thứ tự</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">{category.name}</td>
                      <td className="py-4 px-6 text-sm text-slate-500 truncate max-w-xs">{category.description || "-"}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {category.icon && <span className="text-lg">{category.icon}</span>}
                          {category.colorClass && <div className={`w-6 h-6 rounded ${category.colorClass}`} />}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">{category.order}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenCategoryModal(category)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Moderation Modal */}
      {showModerationModal && selectedPost && (
        <ModerationModal
          post={selectedPost}
          onApprove={() => handleModerate(selectedPost.id, "Approved")}
          onReject={(notes) => handleModerate(selectedPost.id, "Rejected", notes)}
          onClose={() => {
            setShowModerationModal(false);
            setSelectedPost(null);
          }}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md ring-1 ring-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">{editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tên danh mục <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Mô tả</label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 h-20 resize-none"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Icon (Emoji)</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    placeholder="📝"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Thứ tự</label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    value={categoryForm.order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
              <Button variant="ghost" onClick={() => setShowCategoryModal(false)}>Hủy</Button>
              <Button onClick={handleSaveCategory} className="bg-brand-600 text-white hover:bg-brand-700">Lưu danh mục</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
