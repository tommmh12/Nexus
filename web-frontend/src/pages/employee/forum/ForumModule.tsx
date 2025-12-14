import React, { useState } from "react";

// Mock data for UI preview
const MOCK_POSTS = [
  {
    id: "1",
    title: "Kinh nghiệm làm việc từ xa hiệu quả",
    content:
      "Xin chào mọi người! Mình muốn chia sẻ một số kinh nghiệm làm việc từ xa mà mình đã áp dụng trong thời gian qua...\n\n1. Thiết lập không gian làm việc riêng biệt\n2. Đặt lịch trình cố định\n3. Sử dụng các công cụ quản lý thời gian\n4. Duy trì kết nối với đồng nghiệp",
    author: "Nguyễn Văn An",
    authorAvatar: "NA",
    authorDepartment: "Phòng Kỹ thuật",
    category: "Chia sẻ kinh nghiệm",
    tags: ["work-from-home", "productivity", "tips"],
    createdAt: "2 giờ trước",
    likes: 24,
    comments: 8,
    views: 156,
    isLiked: false,
    isPinned: true,
  },
  {
    id: "2",
    title: "Hỏi đáp: Quy trình đề xuất ý tưởng mới",
    content:
      "Mình muốn hỏi về quy trình đề xuất ý tưởng cải tiến trong công ty. Cần chuẩn bị những gì và gửi cho ai ạ?",
    author: "Trần Thị Bình",
    authorAvatar: "TB",
    authorDepartment: "Phòng Marketing",
    category: "Hỏi đáp",
    tags: ["hoi-dap", "quy-trinh"],
    createdAt: "5 giờ trước",
    likes: 5,
    comments: 12,
    views: 89,
    isLiked: true,
    isPinned: false,
  },
  {
    id: "3",
    title: "Review sách: 'Atomic Habits' - Thay đổi tí hon, hiệu quả bất ngờ",
    content:
      "Mình vừa đọc xong cuốn 'Atomic Habits' của James Clear và muốn chia sẻ với mọi người. Đây là những điểm chính mình rút ra được:\n\n• Thói quen nhỏ tạo nên sự khác biệt lớn\n• Hệ thống quan trọng hơn mục tiêu\n• 4 bước xây dựng thói quen tốt...",
    author: "Lê Hoàng Cường",
    authorAvatar: "LC",
    authorDepartment: "Phòng Nhân sự",
    category: "Chia sẻ kinh nghiệm",
    tags: ["sach", "phat-trien-ban-than"],
    createdAt: "1 ngày trước",
    likes: 45,
    comments: 15,
    views: 320,
    isLiked: true,
    isPinned: false,
  },
  {
    id: "4",
    title: "Tuyển thành viên CLB Bóng đá",
    content:
      "CLB Bóng đá công ty đang tìm kiếm thành viên mới! 🏃‍♂️⚽\n\nThời gian tập: Thứ 3 & Thứ 5, 18h-20h\nĐịa điểm: Sân bóng Phú Thọ\n\nĐăng ký: Link form đăng ký ở comment",
    author: "Phạm Văn Dũng",
    authorAvatar: "PD",
    authorDepartment: "Phòng IT",
    category: "Hoạt động",
    tags: ["clb", "the-thao", "bong-da"],
    createdAt: "2 ngày trước",
    likes: 32,
    comments: 20,
    views: 245,
    isLiked: false,
    isPinned: false,
  },
];

const MOCK_CATEGORIES = [
  { id: "all", name: "Tất cả", icon: "📋", count: 156 },
  { id: "share", name: "Chia sẻ kinh nghiệm", icon: "💡", count: 45 },
  { id: "qa", name: "Hỏi đáp", icon: "❓", count: 38 },
  { id: "activity", name: "Hoạt động", icon: "🎉", count: 28 },
  { id: "tech", name: "Công nghệ", icon: "💻", count: 22 },
  { id: "life", name: "Đời sống", icon: "🌱", count: 23 },
];

const MOCK_TRENDING_TAGS = [
  { name: "productivity", count: 45 },
  { name: "tips", count: 32 },
  { name: "coding", count: 28 },
  { name: "teamwork", count: 25 },
  { name: "remote-work", count: 20 },
];

export default function ForumModule() {
  // Mock user for UI preview
  const user = { fullName: "Nguyễn Văn Bình" };
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "trending">(
    "latest"
  );
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<
    (typeof MOCK_POSTS)[0] | null
  >(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");

  const filteredPosts = MOCK_POSTS.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "share" && post.category === "Chia sẻ kinh nghiệm") ||
      (activeCategory === "qa" && post.category === "Hỏi đáp") ||
      (activeCategory === "activity" && post.category === "Hoạt động");
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = () => {
    console.log("Creating post:", {
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
    });
    setShowCreatePost(false);
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostCategory("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">🗣️ Diễn đàn nội bộ</h1>
            <p className="text-purple-100">
              Nơi chia sẻ kiến thức, kinh nghiệm và kết nối với đồng nghiệp
            </p>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="px-5 py-2.5 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tạo bài viết
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative max-w-xl">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết, chủ đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none"
          />
          <svg
            className="w-5 h-5 text-white/60 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Categories */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Danh mục</h3>
            <div className="space-y-1">
              {MOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    activeCategory === cat.id
                      ? "bg-purple-50 text-purple-700"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Trending Tags */}
          <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              🔥 Tags nổi bật
            </h3>
            <div className="flex flex-wrap gap-2">
              {MOCK_TRENDING_TAGS.map((tag) => (
                <button
                  key={tag.name}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 rounded-full text-xs font-medium transition-colors"
                >
                  #{tag.name}{" "}
                  <span className="text-gray-400">({tag.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Posts */}
        <div className="col-span-6">
          {/* Sort Options */}
          <div className="flex items-center gap-2 mb-4">
            {[
              { key: "latest", label: "Mới nhất", icon: "🕐" },
              { key: "popular", label: "Phổ biến", icon: "🔥" },
              { key: "trending", label: "Xu hướng", icon: "📈" },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key as typeof sortBy)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === option.key
                    ? "bg-purple-100 text-purple-700"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                  post.isPinned ? "border-l-4 border-purple-500" : ""
                }`}
              >
                <div className="p-5">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center font-semibold">
                        {post.authorAvatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {post.author}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.authorDepartment} • {post.createdAt}
                        </p>
                      </div>
                    </div>
                    {post.isPinned && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        📌 Ghim
                      </span>
                    )}
                  </div>

                  {/* Post Content */}
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="text-left w-full"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-purple-600 transition-colors mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {post.content}
                    </p>
                  </button>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">
                      {post.category}
                    </span>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                    <button
                      className={`flex items-center gap-1.5 text-sm ${
                        post.isLiked
                          ? "text-red-500"
                          : "text-gray-500 hover:text-red-500"
                      } transition-colors`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={post.isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {post.comments} bình luận
                    </button>
                    <span className="flex items-center gap-1.5 text-sm text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {post.views} lượt xem
                    </span>
                    <button className="ml-auto text-gray-400 hover:text-gray-600">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3">
          {/* My Stats */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              📊 Hoạt động của tôi
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Bài viết</span>
                <span className="font-semibold text-gray-800">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Bình luận</span>
                <span className="font-semibold text-gray-800">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Lượt thích nhận</span>
                <span className="font-semibold text-gray-800">89</span>
              </div>
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              🏆 Top đóng góp
            </h3>
            <div className="space-y-3">
              {[
                { name: "Nguyễn Văn An", avatar: "NA", posts: 45, rank: 1 },
                { name: "Trần Thị Bình", avatar: "TB", posts: 38, rank: 2 },
                { name: "Lê Hoàng Cường", avatar: "LC", posts: 32, rank: 3 },
              ].map((contributor) => (
                <div key={contributor.name} className="flex items-center gap-3">
                  <span className="text-lg">
                    {contributor.rank === 1
                      ? "🥇"
                      : contributor.rank === 2
                      ? "🥈"
                      : "🥉"}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-medium">
                    {contributor.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {contributor.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {contributor.posts} bài viết
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                ✏️ Tạo bài viết mới
              </h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bài viết..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Chọn danh mục</option>
                  <option value="share">Chia sẻ kinh nghiệm</option>
                  <option value="qa">Hỏi đáp</option>
                  <option value="activity">Hoạt động</option>
                  <option value="tech">Công nghệ</option>
                  <option value="life">Đời sống</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung
                </label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Viết nội dung bài viết..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  title="Thêm ảnh"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  title="Đính kèm file"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  title="Thêm tag"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostTitle.trim() || !newPostContent.trim()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                >
                  Đăng bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-gray-800">Chi tiết bài viết</h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center font-semibold text-lg">
                  {selectedPost.authorAvatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {selectedPost.author}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedPost.authorDepartment} • {selectedPost.createdAt}
                  </p>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedPost.title}
              </h2>

              {/* Content */}
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedPost.content}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100">
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-500 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Thích ({selectedPost.likes})
                </button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 rounded-lg text-gray-600 hover:text-blue-500 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Chia sẻ
                </button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 rounded-lg text-gray-600 hover:text-yellow-500 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  Lưu
                </button>
              </div>

              {/* Comments Section */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-4">
                  💬 Bình luận ({selectedPost.comments})
                </h4>
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <input
                    type="text"
                    placeholder="Viết bình luận..."
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <p className="text-center text-gray-500 text-sm py-4">
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
