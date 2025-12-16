import React, { useState } from "react";
import {
  MessageSquare,
  Search,
  Plus,
  Filter,
  TrendingUp,
  Award,
  MoreHorizontal,
  Heart,
  Share2,
  Bookmark,
  Hash,
  Users,
  Lightbulb,
  HelpCircle,
  Activity,
  Cpu,
  Coffee,
  X
} from "lucide-react";

// --- Configuration ---
const THEME = {
  bg: "bg-[#F8FAFC]", // Porcelain
  cardBg: "bg-white",
  primary: "text-[#00897B]",
  primaryBg: "bg-[#00897B]",
  primaryLight: "bg-teal-50",
  textPrimary: "text-slate-900",
  textSecondary: "text-slate-500",
  hover: "hover:bg-slate-50",
  buttonPrimary: "bg-slate-900 text-white hover:bg-slate-800",
};

// Mock data
const MOCK_POSTS = [
  {
    id: "1",
    title: "Kinh nghiệm làm việc từ xa hiệu quả",
    content: "Xin chào mọi người! Mình muốn chia sẻ một số kinh nghiệm làm việc từ xa...",
    author: "Nguyễn Văn An",
    authorAvatar: "NA",
    authorDepartment: "Phòng Kỹ thuật",
    category: "Chia sẻ kinh nghiệm",
    tags: ["work-from-home", "productivity"],
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
    content: "Mình muốn hỏi về quy trình đề xuất ý tưởng cải tiến trong công ty...",
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
    title: "Review sách: 'Atomic Habits'",
    content: "Mình vừa đọc xong cuốn 'Atomic Habits' của James Clear...",
    author: "Lê Hoàng Cường",
    authorAvatar: "LC",
    authorDepartment: "Phòng Nhân sự",
    category: "Chia sẻ kinh nghiệm",
    tags: ["sach", "phat-trien"],
    createdAt: "1 ngày trước",
    likes: 45,
    comments: 15,
    views: 320,
    isLiked: true,
    isPinned: false,
  },
];

const MOCK_CATEGORIES = [
  { id: "all", name: "Tất cả", icon: MessageSquare, count: 156 },
  { id: "share", name: "Chia sẻ", icon: Lightbulb, count: 45 },
  { id: "qa", name: "Hỏi đáp", icon: HelpCircle, count: 38 },
  { id: "activity", name: "Hoạt động", icon: Activity, count: 28 },
  { id: "tech", name: "Công nghệ", icon: Cpu, count: 22 },
  { id: "life", name: "Đời sống", icon: Coffee, count: 23 },
];

export default function ForumModule() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

  // User Helpers
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const shortName = (user?.fullName || 'User').split(' ').pop();
  const avatarInitials = (user?.fullName || 'User').substring(0, 2).toUpperCase();

  return (
    <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">

        {/* === LEFT COLUMN: NAVIGATION (3 cols) === */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          {/* Brand / Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="text-teal-600" /> Diễn Đàn
            </h1>
            <p className="text-slate-500 text-sm mt-1">Kết nối & Chia sẻ kiến thức</p>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl shadow-sm p-2">
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeCategory === cat.id
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <cat.icon size={18} className={activeCategory === cat.id ? "text-teal-600" : "text-slate-400"} />
                  {cat.name}
                </div>
                {activeCategory === cat.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                )}
              </button>
            ))}
          </div>

          {/* Trending Tags */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Trending Tags</h3>
            <div className="flex flex-wrap gap-2">
              {["productivity", "remote-work", "coding", "team-building"].map(tag => (
                <button key={tag} className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-600 hover:border-teal-200 hover:text-teal-600 transition-colors">
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* === MIDDLE COLUMN: FEED (6 cols) === */}
        <div className="col-span-12 lg:col-span-6 space-y-6">

          {/* Action Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-teal-100 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className={`${THEME.buttonPrimary} px-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-slate-900/10 font-bold transition-transform active:scale-95`}
            >
              <Plus size={20} /> <span className="hidden sm:inline">Viết bài</span>
            </button>
          </div>

          {/* Posts Stream */}
          <div className="space-y-6">
            {MOCK_POSTS.map((post) => (
              <div key={post.id} className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelectedPost(post)}>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                      {post.authorAvatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{post.author}</h4>
                      <p className="text-slate-400 text-xs">{post.authorDepartment} • {post.createdAt}</p>
                    </div>
                  </div>
                  {post.isPinned && (
                    <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">Pinned</span>
                  )}
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors">{post.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">{post.content}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-sm font-medium">
                      <Heart size={18} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm font-medium">
                      <MessageSquare size={18} /> {post.comments}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs font-mono text-slate-400">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === RIGHT COLUMN: STATS (3 cols) === */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* My Stats Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
                {avatarInitials}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{shortName}</h3>
                <p className="text-xs text-slate-500">Người đóng góp tích cực</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-900">12</div>
                <div className="text-xs text-slate-500 font-medium uppercase">Bài viết</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-900">89</div>
                <div className="text-xs text-slate-500 font-medium uppercase">Likes</div>
              </div>
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="text-orange-400" size={20} /> Top Đóng Góp
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((rank) => (
                <div key={rank} className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${rank === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                    {rank}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-slate-100 rounded mb-1"></div>
                    <div className="h-2 w-12 bg-slate-50 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* --- MODALS --- */}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Tạo bài viết mới</h2>
              <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <input type="text" placeholder="Tiêu đề bài viết..." className="w-full text-xl font-bold placeholder:text-slate-300 border-none focus:ring-0 px-0" autoFocus />
              <div className="h-px bg-slate-100"></div>
              <textarea rows={8} placeholder="Chia sẻ ý tưởng của bạn..." className="w-full resize-none border-none focus:ring-0 px-0 text-slate-600 leading-relaxed"></textarea>

              <div className="flex items-center gap-2 pt-4">
                <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Bookmark size={20} /></button>
                <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Hash size={20} /></button>
                <div className="flex-1"></div>
                <button onClick={() => setShowCreatePost(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Hủy</button>
                <button onClick={() => setShowCreatePost(false)} className={`${THEME.buttonPrimary} px-6 py-2.5 rounded-xl font-bold`}>Đăng bài</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-8 pb-0 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{selectedPost.authorAvatar}</div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedPost.author}</h3>
                  <p className="text-slate-500">{selectedPost.authorDepartment} • {selectedPost.createdAt}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedPost.title}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">{selectedPost.content}</p>

              <div className="mt-8 flex gap-2">
                {selectedPost.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-sm font-medium">#{tag}</span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-6 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">{avatarInitials}</div>
              <input type="text" placeholder="Viết bình luận..." className="flex-1 bg-white border-none shadow-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-100" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
