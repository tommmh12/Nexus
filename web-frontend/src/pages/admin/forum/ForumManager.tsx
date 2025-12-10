import React, { useState, useEffect } from "react";
import { forumService, ForumPost, ForumCategory } from "../../../services/forumService";
import { X } from "lucide-react";
import { Button } from "../../../components/system/ui/Button";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  ArrowBigUp,
  ArrowBigDown,
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
} from "lucide-react";

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Kiểm duyệt bài viết</h3>
              <p className="text-sm text-slate-500 mt-1">Xem xét và quyết định duyệt/từ chối</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Post Info */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  {post.authorAvatar ? (
                    <img src={post.authorAvatar} className="w-12 h-12 rounded-full" alt="" />
                  ) : (
                    <User size={24} className="text-slate-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-900">{post.authorName || "Unknown"}</p>
                    <span className="text-xs text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  {post.categoryName && (
                    <span className="text-xs bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {post.categoryName}
                    </span>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    post.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : post.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {post.status === "Approved" ? "Đã duyệt" : post.status === "Pending" ? "Chờ duyệt" : "Từ chối"}
                </span>
              </div>
              <h4 className="font-bold text-lg text-slate-900 mb-2">{post.title}</h4>
              <div className="text-slate-700 whitespace-pre-wrap">{post.content}</div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                <Eye size={20} className="mx-auto text-slate-400 mb-1" />
                <p className="text-2xl font-bold text-slate-900">{post.viewCount || 0}</p>
                <p className="text-xs text-slate-500">Lượt xem</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                <MessageSquare size={20} className="mx-auto text-slate-400 mb-1" />
                <p className="text-2xl font-bold text-slate-900">{post.commentCount || 0}</p>
                <p className="text-xs text-slate-500">Bình luận</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                <ArrowBigUp size={20} className="mx-auto text-slate-400 mb-1" />
                <p className="text-2xl font-bold text-slate-900">{post.upvoteCount || 0}</p>
                <p className="text-xs text-slate-500">Upvotes</p>
              </div>
            </div>

            {/* Reject Notes */}
            {post.status === "Pending" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Lý do từ chối (nếu từ chối)
                </label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"
                  placeholder="Nhập lý do từ chối bài viết này..."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            {post.status === "Pending" && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (rejectNotes.trim()) {
                      onReject(rejectNotes);
                    } else {
                      const notes = prompt("Lý do từ chối:");
                      if (notes) onReject(notes);
                    }
                  }}
                  className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                >
                  <ShieldX size={16} className="mr-2" /> Từ chối
                </Button>
                <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700 text-white">
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
    <div className="animate-fadeIn h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Kiểm duyệt Diễn đàn Nội bộ</h2>
            <p className="text-slate-500 mt-1">
              Quản lý và kiểm duyệt nội dung diễn đàn nội bộ
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Tổng bài viết</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 mb-1">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">Đã từ chối</p>
                <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-200 rounded-lg flex items-center justify-center">
                <XCircle size={24} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Tổng lượt xem</p>
                <p className="text-lg font-bold text-slate-900">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Tổng bình luận</p>
                <p className="text-lg font-bold text-slate-900">{stats.totalComments.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Tương tác trung bình</p>
                <p className="text-lg font-bold text-slate-900">
                  {stats.total > 0 ? Math.round((stats.totalViews + stats.totalComments) / stats.total) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional Content based on activeTab */}
      {activeTab === "posts" ? (
        <>
          {/* Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {["All", "Pending", "Approved", "Rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                      filterStatus === status
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {status === "All" ? "Tất cả" : status === "Pending" ? "Chờ duyệt" : status === "Approved" ? "Đã duyệt" : "Từ chối"}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 md:flex-none md:w-64">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Posts List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-slate-200">
          <div className="text-slate-500">Đang tải...</div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Shield size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Không có bài viết nào.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
          <div className="overflow-x-auto">
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
                    Tương tác
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ngày đăng
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 w-[40%]">
                      <div className="flex items-start gap-3">
                        {post.isPinned && (
                          <Pin size={16} className="text-brand-600 rotate-45 mt-1 flex-shrink-0" fill="currentColor" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-brand-600 cursor-pointer"
                            onClick={() => {
                              setSelectedPost(post);
                              setShowModerationModal(true);
                            }}
                          >
                            {post.title}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1">{post.content}</div>
                          {post.categoryName && (
                            <div className="mt-1">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                {post.categoryName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                          {post.authorAvatar ? (
                            <img src={post.authorAvatar} className="w-8 h-8 rounded-full" alt="" />
                          ) : (
                            <User size={16} className="text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{post.authorName || "Unknown"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            post.status === "Approved"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : post.status === "Pending"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              post.status === "Approved"
                                ? "bg-green-500"
                                : post.status === "Pending"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          {post.status === "Approved" ? "Đã duyệt" : post.status === "Pending" ? "Chờ duyệt" : "Từ chối"}
                        </span>
                        {post.status === "Pending" && (
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={() => {
                                setSelectedPost(post);
                                setShowModerationModal(true);
                              }}
                              className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
                              title="Duyệt bài"
                            >
                              <ShieldCheck size={12} /> Duyệt
                            </button>
                            <button
                              onClick={() => {
                                const notes = prompt("Lý do từ chối:");
                                if (notes) handleModerate(post.id, "Rejected", notes);
                              }}
                              className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                              title="Từ chối"
                            >
                              <ShieldX size={12} /> Từ chối
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Eye size={12} /> {post.viewCount || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowBigUp size={12} /> {post.upvoteCount || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare size={12} /> {post.commentCount || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(post.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPost(post);
                            setShowModerationModal(true);
                          }}
                          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          </div>
        </div>
      )}
        </>
      ) : (
        <>
          {/* Categories Management */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Quản lý Danh mục</h3>
            <Button
              onClick={() => handleOpenCategoryModal()}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              <Plus size={16} className="mr-2" />
              Thêm danh mục
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-slate-200">
              <div className="text-slate-500">Đang tải...</div>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Tag size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">Chưa có danh mục nào.</p>
              <Button
                onClick={() => handleOpenCategoryModal()}
                className="bg-brand-600 hover:bg-brand-700 text-white"
              >
                <Plus size={16} className="mr-2" />
                Tạo danh mục đầu tiên
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tên danh mục
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Icon / Màu
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Thứ tự
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 max-w-md truncate">
                            {category.description || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {category.icon && (
                              <span className="text-lg">{category.icon}</span>
                            )}
                            {category.colorClass && (
                              <div
                                className={`w-6 h-6 rounded ${category.colorClass}`}
                                title={category.colorClass}
                              />
                            )}
                            {!category.icon && !category.colorClass && (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">{category.order}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenCategoryModal(category)}
                              className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              </div>
            </div>
          )}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCategoryModal(false);
              setEditingCategory(null);
              setCategoryForm({ name: "", description: "", icon: "", colorClass: "", order: 0 });
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingCategory ? "Chỉnh sửa Danh mục" : "Thêm Danh mục Mới"}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setCategoryForm({ name: "", description: "", icon: "", colorClass: "", order: 0 });
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Nhập tên danh mục..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Nhập mô tả (tùy chọn)..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    placeholder="Emoji hoặc icon"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Màu sắc</label>
                  <input
                    type="text"
                    value={categoryForm.colorClass}
                    onChange={(e) => setCategoryForm({ ...categoryForm, colorClass: e.target.value })}
                    placeholder="bg-blue-500"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Thứ tự</label>
                <input
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setCategoryForm({ name: "", description: "", icon: "", colorClass: "", order: 0 });
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleSaveCategory} className="bg-brand-600 hover:bg-brand-700 text-white">
                <Save size={16} className="mr-2" />
                {editingCategory ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </div>
        </div>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCategoryModal(false);
              setEditingCategory(null);
              setCategoryForm({ name: "", description: "", icon: "", colorClass: "", order: 0 });
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingCategory ? "Chỉnh sửa Danh mục" : "Thêm Danh mục Mới"}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setCategoryForm({ name: "", description: "", icon: "", colorClass: "", order: 0 });
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Nhập tên danh mục..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Nhập mô tả (tùy chọn)..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    placeholder="Emoji hoặc icon"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Màu sắc</label>
                  <input
                    type="text"
                    value={categoryForm.colorClass}
                    onChange={(e) => setCategoryForm({ ...categoryForm, colorClass: e.target.value })}
                    placeholder="bg-blue-500"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Thứ tự</label>
                <input
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setCategoryForm({ name: "", description: "", icon: "", colorClass: "", order: 0 });
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleSaveCategory} className="bg-brand-600 hover:bg-brand-700 text-white">
                <Save size={16} className="mr-2" />
                {editingCategory ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

