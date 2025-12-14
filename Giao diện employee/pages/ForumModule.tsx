
import React, { useState, useEffect, useRef } from "react";
import { ForumCategory, Poll, ForumComment } from "../types";
import { forumService, ForumPost } from "../services/forumService";
import { Button } from "../components/system/ui/Button";
import { Input } from "../components/system/ui/Input";
import {
  Search,
  Plus,
  Bell,
  Cpu,
  Calendar,
  ShoppingBag,
  HelpCircle,
  MessageSquare,
  Share2,
  Eye,
  Pin,
  MoreHorizontal,
  ArrowLeft,
  Image as ImageIcon,
  Paperclip,
  BellRing,
  ArrowBigUp,
  ArrowBigDown,
  BarChart2,
  Bookmark,
  Flag,
  Filter,
  Flame,
  Clock,
  CheckSquare,
  Square,
  Check,
  X,
  Tag,
  Trash2,
  AlertTriangle,
  User,
  Shield,
  ShieldAlert,
  Ban,
  Mail,
  Send,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Link,
  Code,
  MoreVertical,
  Smile,
  Sidebar,
  Indent,
  Outdent,
  Sparkles,
  FileImage,
  Link2,
  Wand2,
  Save,
  FileText,
  ThumbsUp,
} from "lucide-react";
import { UserProfile } from "./UserProfile";
import { authService } from "../services/authService";
import { CommentThread } from "../components/comments/CommentThread";

// --- Utility Components ---

const getIcon = (iconName: string, size: number = 20) => {
  switch (iconName) {
    case "Bell":
      return <Bell size={size} />;
    case "Cpu":
      return <Cpu size={size} />;
    case "Calendar":
      return <Calendar size={size} />;
    case "ShoppingBag":
      return <ShoppingBag size={size} />;
    case "HelpCircle":
      return <HelpCircle size={size} />;
    default:
      return <MessageSquare size={size} />;
  }
};

// --- NEW: User Hover Card Component (With 3s Delay) ---
interface UserHoverCardProps {
  name: string;
  avatar: string;
  dept: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const UserHoverCard: React.FC<UserHoverCardProps> = ({
  name,
  avatar,
  dept,
  children,
  onClick,
}) => {
  // Simulate finding full user profile
  const userProfile = {
    // TODO: Fetch from API
    fullName: name,
    avatarUrl: avatar,
    department: dept,
    position: "Nhân viên",
    email: "user@nexus.com",
    status: "Active",
    karmaPoints: 100,
    role: "Employee",
  };

  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<any>(null); // Use ref to hold the timer ID

  const handleMouseEnter = () => {
    // Clear any existing timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Set a new timer to show the card after 3 seconds (3000ms)
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 3000);
  };

  const handleMouseLeave = () => {
    // If mouse leaves before 3s, cancel the timer so it doesn't show
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Hide immediately when leaving
    setIsVisible(false);
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Đang mở khung chat với ${name}...`);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <div
      className="relative inline-block z-20"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="cursor-pointer" onClick={handleClick}>
        {children}
      </div>

      {/* Popover Content */}
      <div
        className={`absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 
                transition-all duration-300 z-50 transform origin-top-left 
                ${isVisible
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2 pointer-events-none"
          }
            `}
      >
        {/* Bridge to prevent closing when moving mouse from name to card */}
        <div className="absolute -top-4 left-0 w-full h-4 bg-transparent"></div>

        {/* Arrow */}
        <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t border-l border-slate-200 transform rotate-45"></div>

        <div className="p-5 text-left relative bg-white rounded-xl overflow-hidden">
          {/* Header Background */}
          <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-brand-600 to-brand-400"></div>

          <div className="relative pt-6 flex items-end justify-between mb-3">
            <div className="relative" onClick={handleClick}>
              <img
                src={userProfile.avatarUrl}
                alt={name}
                className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover bg-white cursor-pointer"
              />
              <span
                className={`absolute bottom-1 right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${userProfile.status === "Active"
                  ? "bg-green-500"
                  : "bg-slate-400"
                  }`}
              ></span>
            </div>
            <div className="mb-1">
              {userProfile.role !== "Employee" && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200 uppercase tracking-wide shadow-sm">
                  {userProfile.role}
                </span>
              )}
            </div>
          </div>

          <div>
            <h4
              className="font-bold text-slate-900 text-lg leading-tight hover:text-brand-700 transition-colors cursor-pointer"
              onClick={handleClick}
            >
              {userProfile.fullName}
            </h4>
            <p className="text-sm text-slate-500 font-medium">
              {userProfile.position}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100">
              <Cpu size={12} className="text-slate-400" />{" "}
              {userProfile.department}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 my-4 py-3 border-y border-slate-100">
            <div className="text-center">
              <span className="block font-bold text-lg text-brand-600">
                {userProfile.karmaPoints || 0}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Karma
              </span>
            </div>
            <div className="text-center border-l border-slate-100">
              <span className="block font-bold text-lg text-slate-900">12</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Bài viết
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleMessage}
              className="flex-1 h-9 text-xs bg-brand-600 hover:bg-brand-700 shadow-brand-200 shadow-lg"
            >
              <MessageSquare size={14} className="mr-1.5" /> Nhắn tin
            </Button>
            <Button
              variant="outline"
              onClick={handleClick}
              className="flex-1 h-9 text-xs border-slate-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              <User size={14} className="mr-1.5" /> Hồ sơ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PostActions = ({
  upvotes,
  commentCount,
  isLiked,
  onLike,
  onComment,
  onShare,
}: {
  upvotes: number;
  commentCount: number;
  isLiked?: boolean;
  onLike?: (e: React.MouseEvent) => void;
  onComment?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
}) => {
  return (
    <div className="flex items-center gap-1 border-t border-slate-100 pt-3 mt-3">
      <button
        onClick={onLike}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${isLiked
          ? "text-brand-600 bg-brand-50"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
      >
        <ThumbsUp size={18} className={isLiked ? "fill-current" : ""} />
        <span>Thích {upvotes > 0 && `(${upvotes})`}</span>
      </button>

      <button
        onClick={onComment}
        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
      >
        <MessageSquare size={18} />
        <span>Bình luận {commentCount > 0 && `(${commentCount})`}</span>
      </button>

      <button
        onClick={onShare}
        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
      >
        <Share2 size={18} />
        <span>Chia sẻ</span>
      </button>
    </div>
  );
};

// ... (Rest of ForumModule code, mainly CreatePostModal and other components)

// --- Main Module (Reader Only) ---
export const ForumModule = ({
  initialView = "feed",
}: {
  initialView?: "feed" | "profile";
}) => {
  const [view, setView] = useState<"feed" | "detail" | "profile">(initialView);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedSort, setFeedSort] = useState<"new" | "hot" | "saved">("new");
  const [profileTargetId, setProfileTargetId] = useState<string>("me");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Load approved posts and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Load only approved posts for reader view
        const [postsData, categoriesData] = await Promise.all([
          forumService.getAllPosts({ status: "Approved" }),
          forumService.getCategories(),
        ]);
        setPosts(postsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading forum data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePostClick = (post: ForumPost) => {
    setSelectedPost(post);
    setView("detail");
    window.scrollTo(0, 0);
  };

  const handleUserClick = (userName: string) => {
    // In real app, we would have user ID. Here we mock find ID by name or just pass name if needed
    const user = null; // TODO: Fetch from API
    if (user) {
      setProfileTargetId(user.id);
      setView("profile");
      window.scrollTo(0, 0);
    }
  };

  // Filter Logic
  let filteredPosts: ForumPost[] = [...posts];
  if (activeCategory !== "all") {
    filteredPosts = filteredPosts.filter(
      (p) => p.categoryId === activeCategory
    );
  }
  if (feedSort === "saved") {
    // TODO: Implement saved posts filter
    filteredPosts = [];
  } else if (feedSort === "hot") {
    filteredPosts = [...filteredPosts].sort(
      (a, b) => (b.upvoteCount || 0) + (b.commentCount || 0) - ((a.upvoteCount || 0) + (a.commentCount || 0))
    );
  }

  if (view === "profile") {
    return (
      <UserProfile
        key={profileTargetId}
        userId={profileTargetId}
        onBack={() => setView("feed")}
      />
    );
  }

  // Simplified CreatePostModal placeholder to reduce file size for this snippet
  const CreatePostModal = ({ onClose }: { onClose: () => void }) => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="bg-white p-6 rounded-lg">
              <h3>Create Post (Simplified)</h3>
              <Button onClick={onClose}>Close</Button>
          </div>
      </div>
  );

  // Simplified PostDetail placeholder
  const PostDetail = ({ post, onBack }: { post: ForumPost, onBack: () => void }) => (
      <div className="bg-white p-6 rounded-lg">
          <Button onClick={onBack}>Back</Button>
          <h2 className="text-2xl font-bold">{post.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
  );


  return (
    <div className="animate-fadeIn h-full">
      {showCreateModal && (
        <CreatePostModal onClose={() => setShowCreateModal(false)} />
      )}

      {view === "feed" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left Sidebar: Categories & Menu */}
          <div className="lg:col-span-3 space-y-6">
            <Button
              className="w-full justify-start shadow-md shadow-brand-200"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} className="mr-2" /> Tạo bài viết mới
            </Button>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900 mb-3 px-2">Feeds</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setFeedSort("new")}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${feedSort === "new"
                    ? "bg-slate-100 text-brand-600 font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Clock size={18} className="mr-3" /> Mới nhất
                </button>
                <button
                  onClick={() => setFeedSort("hot")}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${feedSort === "hot"
                    ? "bg-slate-100 text-orange-600 font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Flame size={18} className="mr-3" /> Nổi bật (Trending)
                </button>
              </div>

              <div className="border-t border-slate-100 my-4"></div>

              <h3 className="font-bold text-slate-900 mb-3 px-2">Chuyên mục</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === "all"
                    ? "bg-slate-100 text-brand-600 font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <span className="flex items-center">
                    <MessageSquare size={18} className="mr-3" /> Tất cả
                  </span>
                </button>
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat.id
                      ? "bg-slate-100 text-brand-600 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    <span className="flex items-center">
                      <span className={`mr-3`}>
                        {getIcon(cat.icon || "MessageSquare", 18)}
                      </span>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Feed */}
          <div className="lg:col-span-6 space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
              <Search size={20} className="text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, hashtag..."
                className="flex-1 bg-transparent border-none outline-none text-sm py-2"
              />
              <Button variant="ghost" className="text-slate-500 h-8 w-8 p-0">
                <Filter size={18} />
              </Button>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="text-slate-500">Đang tải bài viết...</div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <p className="text-slate-500">Chưa có bài viết nào được duyệt.</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {post.isPinned && (
                          <Pin
                            size={14}
                            className="text-brand-600 rotate-45"
                            fill="currentColor"
                          />
                        )}
                        <span className="text-xs font-bold text-slate-500 hover:underline">
                          {post.categoryName || "Chưa phân loại"}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          • Đăng bởi
                          <span className="font-medium text-slate-600 hover:text-brand-600 hover:underline">
                              {post.authorName}
                          </span>
                          • {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-brand-600 transition-colors">
                      {post.title}
                    </h2>

                    {/* Preview Content (truncated) */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {post.content}
                    </p>

                    <PostActions
                      upvotes={post.upvoteCount || 0}
                      commentCount={post.commentCount}
                      isLiked={false}
                      onLike={(e) => { e.stopPropagation(); }}
                      onComment={(e) => { e.stopPropagation(); }}
                      onShare={(e) => { e.stopPropagation(); }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Sidebar: Profile & Trending */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Profile Widget Placeholder */}
                <div className="p-4 text-center">
                    <p>Profile Widget</p>
                </div>
            </div>
          </div>
        </div>
      ) : selectedPost ? (
        <PostDetail
          post={selectedPost}
          onBack={() => setView("feed")}
        />
      ) : null}
    </div>
  );
};
