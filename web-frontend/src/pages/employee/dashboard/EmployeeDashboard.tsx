import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  BellRing,
  Bookmark,
  Briefcase,
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronRight,
  Clock,
  Coffee,
  CreditCard,
  Eye,
  FileText,
  Filter,
  Flame,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Smile,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  User,
  Users,
  Video,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Code,
  FileImage,
  Share2,
  X,
  Cake,
  Pin,
  Home,
  Settings,
  HelpCircle,
  Newspaper,
} from "lucide-react";
import {
  DashboardMeeting,
  DashboardTask,
  useEmployeeDashboard,
} from "../../../hooks/useEmployeeDashboard";
import { newsService } from "../../../services/newsService";
import {
  ForumCategory,
  ForumComment,
  ForumPost,
  forumService,
} from "../../../services/forumService";
import { authService } from "../../../services/authService";

// --- Configuration ---
const THEME = {
  bg: "bg-[#F8FAFC]",
  cardBg: "bg-white",
  textPrimary: "text-slate-900",
  textSecondary: "text-slate-500",
  textAccent: "text-teal-600",
  buttonPrimary: "bg-teal-600 text-white hover:bg-teal-700",
  buttonSecondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
};

// --- Helpers ---
const extractFirstImage = (content: string) => {
  const htmlImg = content.match(/<img[^>]*src=\"([^\"]+)\"[^>]*>/i);
  if (htmlImg?.[1]) return htmlImg[1];
  const markdownImg = content.match(/!\[[^\]]*\]\(([^\)]+)\)/i);
  if (markdownImg?.[1]) return markdownImg[1];
  return "";
};

const stripHtmlTags = (html: string): string => {
  let cleaned = html.replace(/!\[.*?\]\([^)]+\)/g, "");
  cleaned = cleaned.replace(/<img[^>]*>/gi, "");
  const doc = new DOMParser().parseFromString(cleaned, "text/html");
  return (doc.body.textContent || "").trim();
};

const stripContentPreview = (content: string, maxLength = 160) => {
  const text = stripHtmlTags(content);
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

const renderContentHtml = (content: string) => {
  if (!content) return "";
  const withImages = content.replace(
    /!\[[^\]]*\]\(([^\)]+)\)/g,
    '<img src="$1" alt="attachment" class="rounded-2xl w-full h-auto my-3" />'
  );
  const seen = new Set<string>();
  const deduped = withImages.replace(
    /<img[^>]*src="([^"]+)"[^>]*>/gi,
    (match, src) => {
      if (seen.has(src)) return "";
      seen.add(src);
      return match.replace(/style="[^"]*"/gi, "");
    }
  );
  return deduped;
};

// Reaction config
type ReactionType = "like" | "love" | "laugh" | "wow" | "sad" | "angry";
const reactionConfig: {
  type: ReactionType;
  emoji: string;
  label: string;
  color: string;
}[] = [
  { type: "like", emoji: "👍", label: "Thích", color: "text-blue-500" },
  { type: "love", emoji: "❤️", label: "Yêu thích", color: "text-red-500" },
  { type: "laugh", emoji: "😆", label: "Haha", color: "text-yellow-500" },
  { type: "wow", emoji: "😮", label: "Wow", color: "text-yellow-500" },
  { type: "sad", emoji: "😢", label: "Buồn", color: "text-yellow-500" },
  { type: "angry", emoji: "😠", label: "Phẫn nộ", color: "text-orange-500" },
];

// --- PostActions Component ---
const PostActions = ({
  postId,
  reactions,
  userReaction,
  commentCount,
  onComment,
  onShare,
  onReactionChange,
}: {
  postId: string;
  reactions: Record<string, number>;
  userReaction: string | null;
  commentCount: number;
  onComment?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
  onReactionChange?: (
    reactions: Record<string, number>,
    userReaction: string | null
  ) => void;
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [localReactions, setLocalReactions] =
    useState<Record<string, number>>(reactions);
  const [localUserReaction, setLocalUserReaction] = useState<string | null>(
    userReaction
  );
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalReactions(reactions);
    setLocalUserReaction(userReaction);
  }, [reactions, userReaction]);

  const handleReact = async (
    e: React.MouseEvent,
    reactionType: ReactionType
  ) => {
    e.stopPropagation();
    setShowReactionPicker(false);
    try {
      const result = await forumService.toggleReaction(
        "post",
        postId,
        reactionType
      );
      setLocalReactions(result.reactions);
      setLocalUserReaction(result.reacted ? reactionType : null);
      onReactionChange?.(
        result.reactions,
        result.reacted ? reactionType : null
      );
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  };

  const totalReactions = Object.values(localReactions).reduce(
    (sum, count) => sum + count,
    0
  );
  const topReactions = reactionConfig
    .filter((r) => localReactions[r.type] > 0)
    .sort((a, b) => localReactions[b.type] - localReactions[a.type])
    .slice(0, 3);
  const currentReactionConfig = localUserReaction
    ? reactionConfig.find((r) => r.type === localUserReaction)
    : null;

  return (
    <div className="border-t border-slate-100 pt-3 mt-3">
      {totalReactions > 0 && (
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
          <div className="flex -space-x-1">
            {topReactions.map((r) => (
              <span key={r.type} className="text-base">
                {r.emoji}
              </span>
            ))}
          </div>
          <span>{totalReactions} người đã bày tỏ cảm xúc</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        <div
          className="relative flex-1"
          onMouseEnter={() => {
            hoverTimeoutRef.current = setTimeout(
              () => setShowReactionPicker(true),
              500
            );
          }}
          onMouseLeave={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setTimeout(() => setShowReactionPicker(false), 800);
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (localUserReaction) {
                handleReact(e, localUserReaction as ReactionType);
              } else {
                setShowReactionPicker(!showReactionPicker);
              }
            }}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              localUserReaction
                ? `${currentReactionConfig?.color} bg-teal-50`
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            {currentReactionConfig ? (
              <>
                <span className="text-lg">{currentReactionConfig.emoji}</span>
                <span>{currentReactionConfig.label}</span>
              </>
            ) : (
              <>
                <ThumbsUp size={18} />
                <span>Thích</span>
              </>
            )}
          </button>

          {showReactionPicker && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white rounded-full shadow-xl border border-slate-200 flex items-center gap-1 z-50 animate-fadeIn">
              {reactionConfig.map((config) => (
                <button
                  key={config.type}
                  onClick={(e) => handleReact(e, config.type)}
                  className={`p-2 rounded-full hover:bg-slate-100 hover:scale-125 transition-all ${
                    localUserReaction === config.type
                      ? "bg-slate-100 scale-110"
                      : ""
                  }`}
                  title={config.label}
                >
                  <span className="text-xl">{config.emoji}</span>
                </button>
              ))}
            </div>
          )}
        </div>

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
    </div>
  );
};

// --- Main Component ---
const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, tasks, meetings, notifications, loading } =
    useEmployeeDashboard();

  const [news, setNews] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [forumCategories, setForumCategories] = useState<ForumCategory[]>([]);
  const [forumLoading, setForumLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [hotTopics, setHotTopics] = useState<ForumPost[]>([]);
  const [userStats, setUserStats] = useState<{
    postCount: number;
    commentCount: number;
    karmaPoints: number;
    joinDate: Date | null;
  } | null>(null);
  const [postReactions, setPostReactions] = useState<
    Record<
      string,
      { reactions: Record<string, number>; userReaction: string | null }
    >
  >({});
  const [feedSort, setFeedSort] = useState<"new" | "hot" | "saved">("new");

  const storedUser = authService.getStoredUser();
  const user = storedUser as any;
  const firstName = (user?.full_name || user?.name || "Bạn").split(" ")[0];

  // Greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12
      ? "Chào buổi sáng"
      : h < 18
      ? "Chào buổi chiều"
      : "Chào buổi tối";
  };

  const formatTimeAgo = (dateStr: string | Date) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    return `${diffDays} ngày trước`;
  };

  // Fetch News
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await newsService.getPublicArticles(3);
        setNews(response || []);
      } catch (e) {
        console.error("Failed to fetch news", e);
      }
    };
    fetchNews();
  }, []);

  // Fetch Forum Data
  useEffect(() => {
    const fetchForumData = async () => {
      setForumLoading(true);
      try {
        const [postsData, categoriesData] = await Promise.all([
          forumService.getAllPosts({ status: "Approved", limit: 20 }),
          forumService.getCategories(),
        ]);
        setForumPosts(postsData || []);
        setForumCategories(categoriesData || []);

        // Load hot topics
        try {
          const hotData = await forumService.getHotTopics(5);
          setHotTopics(hotData);
        } catch (e) {
          console.log("Hot topics not available yet");
        }

        // Load user stats
        if (user?.id) {
          try {
            const statsData = await forumService.getUserForumStats(user.id);
            setUserStats(statsData);
          } catch (e) {
            console.log("User stats not available yet");
          }
        }

        // Load reactions
        const reactionsMap: Record<
          string,
          { reactions: Record<string, number>; userReaction: string | null }
        > = {};
        for (const post of (postsData || []).slice(0, 20)) {
          try {
            const reactionData = await forumService.getReactions(
              "post",
              post.id
            );
            reactionsMap[post.id] = reactionData;
          } catch (e) {
            reactionsMap[post.id] = {
              reactions: {
                like: 0,
                love: 0,
                laugh: 0,
                wow: 0,
                sad: 0,
                angry: 0,
              },
              userReaction: null,
            };
          }
        }
        setPostReactions(reactionsMap);
      } catch (e) {
        console.error("Failed to fetch forum data", e);
      } finally {
        setForumLoading(false);
      }
    };
    fetchForumData();
  }, [user?.id]);

  // Filter posts
  let filteredPosts = [...forumPosts];
  if (activeCategory !== "all") {
    filteredPosts = filteredPosts.filter(
      (p) => p.categoryId === activeCategory
    );
  }
  if (feedSort === "saved") {
    filteredPosts = [];
  } else if (feedSort === "hot") {
    filteredPosts = [...filteredPosts].sort(
      (a, b) =>
        (b.upvoteCount || 0) +
        (b.commentCount || 0) -
        ((a.upvoteCount || 0) + (a.commentCount || 0))
    );
  }

  if (loading.stats) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent mr-3"></div>
        Đang tải...
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${THEME.bg} font-sans text-slate-800`}>
      {showCreatePost && (
        <CreatePostModal
          categories={forumCategories}
          onClose={() => setShowCreatePost(false)}
          onSuccess={(newPost) => {
            setForumPosts((prev) => [newPost, ...prev]);
            setShowCreatePost(false);
          }}
        />
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          reactionState={postReactions[selectedPost.id]}
          onReactionChange={(reactions, userReaction) => {
            setPostReactions((prev) => ({
              ...prev,
              [selectedPost.id]: { reactions, userReaction },
            }));
          }}
        />
      )}

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* === LEFT SIDEBAR: Welcome + Quick Actions (2 cols) === */}
        <div className="lg:col-span-2 space-y-5 px-3 py-5 bg-white/50 border-r border-slate-100">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg">
            <h1 className="text-xl font-bold mb-1">
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p className="text-teal-100 text-sm">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <div className="mt-3 pt-3 border-t border-teal-500/30 text-xs text-teal-100 flex items-center gap-2">
              {meetings.length === 0 ? (
                <>
                  <Coffee size={14} /> Không có cuộc họp nào hôm nay
                </>
              ) : (
                <>
                  <Clock size={14} /> {meetings.length} cuộc họp ·{" "}
                  {stats.pendingTasks} việc cần làm
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900 mb-3 text-sm">
              Truy cập nhanh
            </h3>
            <div className="space-y-1">
              <QuickActionItem
                icon={CheckSquare}
                label="Công việc"
                onClick={() => navigate("/employee/tasks")}
                badge={stats.pendingTasks}
              />
              <QuickActionItem
                icon={Calendar}
                label="Lịch họp"
                onClick={() => navigate("/employee/meetings")}
                badge={meetings.length}
              />
              <QuickActionItem
                icon={MessageSquare}
                label="Tin nhắn"
                onClick={() => navigate("/employee/chat")}
              />
              <QuickActionItem
                icon={Video}
                label="Đặt phòng"
                onClick={() => navigate("/employee/booking")}
              />
              <QuickActionItem
                icon={Newspaper}
                label="Tin tức"
                onClick={() => navigate("/employee/news")}
              />
              <QuickActionItem
                icon={User}
                label="Hồ sơ"
                onClick={() => navigate("/employee/profile")}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
              <Bell size={14} className="text-slate-400" /> Thông báo mới
            </h3>
            <div className="space-y-2">
              {notifications
                .filter((n) => !n.isRead)
                .slice(0, 3)
                .map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-2 items-start p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 line-clamp-1">
                        {n.title}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))}
              {notifications.filter((n) => !n.isRead).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">
                  Không có thông báo mới
                </p>
              )}
            </div>
          </div>

          {/* Today's Tasks Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center justify-between">
              <span>Việc hôm nay</span>
              <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                {tasks.length}
              </span>
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {tasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/employee/tasks/${t.id}`)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      t.priority === "Critical" ? "bg-red-500" : "bg-slate-300"
                    }`}
                  ></div>
                  <span className="flex-1 truncate text-slate-700">
                    {t.title}
                  </span>
                  <ChevronRight size={12} className="text-slate-300" />
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2 flex flex-col items-center gap-1">
                  <CheckCircle size={20} className="text-emerald-400" />
                  Không có việc nào
                </p>
              )}
            </div>
          </div>
        </div>

        {/* === CENTER: FORUM FEED (7 cols) === */}
        <div className="lg:col-span-7 space-y-4 px-4 py-5">
          {/* Search + Create */}
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
              <Search size={20} className="text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, hashtag..."
                className="flex-1 bg-transparent border-none outline-none text-sm py-2"
              />
              <button className="text-slate-500 h-8 w-8 p-0 hover:bg-slate-100 rounded-lg flex items-center justify-center">
                <Filter size={18} />
              </button>
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg transition-colors"
            >
              <Plus size={18} /> Tạo bài viết
            </button>
          </div>

          {/* Feed Sort Tabs */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <button
              onClick={() => setFeedSort("new")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                feedSort === "new"
                  ? "bg-teal-100 text-teal-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Clock size={16} className="inline mr-2" /> Mới nhất
            </button>
            <button
              onClick={() => setFeedSort("hot")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                feedSort === "hot"
                  ? "bg-orange-100 text-orange-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Flame size={16} className="inline mr-2" /> Nổi bật
            </button>
            <button
              onClick={() => setFeedSort("saved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                feedSort === "saved"
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Bookmark size={16} className="inline mr-2" /> Đã lưu
            </button>
          </div>

          {/* Posts */}
          {forumLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="text-slate-500">Đang tải bài viết...</div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <MessageSquare
                size={48}
                className="mx-auto mb-3 text-slate-300"
              />
              <p className="text-slate-500">Chưa có bài viết nào.</p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="mt-4 text-teal-600 font-medium text-sm hover:underline"
              >
                Viết bài đầu tiên →
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
              >
                {/* Header */}
                <div className="p-4 pb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={
                        post.authorAvatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          post.authorName
                        )}&background=0d9488&color=fff`
                      }
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 hover:underline">
                          {post.authorName}
                        </span>
                        {post.isPinned && (
                          <Pin
                            size={14}
                            className="text-teal-600 rotate-45"
                            fill="currentColor"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span>{formatTimeAgo(post.createdAt)}</span>
                        <span>•</span>
                        <span className="text-teal-600 font-medium">
                          {post.categoryName || "Chưa phân loại"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-[17px] font-bold text-slate-900 mb-2 leading-snug group-hover:text-teal-600 transition-colors">
                    {post.title}
                  </h2>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-teal-600 hover:underline"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {stripHtmlTags(post.content) && (
                    <p className="text-slate-800 text-[15px] leading-relaxed line-clamp-3">
                      {stripContentPreview(post.content)}
                    </p>
                  )}
                </div>

                {/* Image */}
                {extractFirstImage(post.content) && (
                  <div className="mt-2">
                    <img
                      src={extractFirstImage(post.content)}
                      alt=""
                      className="w-full max-h-[500px] object-cover"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="px-4 py-2">
                  <PostActions
                    postId={post.id}
                    reactions={
                      postReactions[post.id]?.reactions || {
                        like: 0,
                        love: 0,
                        laugh: 0,
                        wow: 0,
                        sad: 0,
                        angry: 0,
                      }
                    }
                    userReaction={postReactions[post.id]?.userReaction || null}
                    commentCount={post.commentCount || 0}
                    onComment={(e) => e.stopPropagation()}
                    onShare={(e) => e.stopPropagation()}
                    onReactionChange={(reactions, userReaction) => {
                      setPostReactions((prev) => ({
                        ...prev,
                        [post.id]: { reactions, userReaction },
                      }));
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* === RIGHT SIDEBAR: User + Hot Topics (3 cols) === */}
        <div className="lg:col-span-3 space-y-5 px-3 py-5 bg-white/50 border-l border-slate-100">
          {/* User Karma Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-teal-600 to-teal-500"></div>
            <div className="px-4 pb-4 -mt-8">
              <img
                src={
                  user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.full_name || "U"
                  )}&background=0d9488&color=fff`
                }
                alt={user?.full_name || "User"}
                className="w-16 h-16 rounded-full border-4 border-white mb-2 object-cover bg-white"
              />
              <h3 className="font-bold text-slate-900">
                {user?.full_name || "Người dùng"}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {user?.position || "Nhân viên"}
              </p>

              <div className="grid grid-cols-2 gap-2 text-center border-t border-slate-100 pt-3">
                <div>
                  <div className="font-bold text-lg text-teal-600">
                    {userStats?.karmaPoints || 0}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <Sparkles size={12} className="text-amber-500" /> Karma
                  </div>
                </div>
                <div>
                  <div className="font-bold text-lg text-slate-900">
                    {userStats?.joinDate
                      ? new Date(userStats.joinDate).toLocaleDateString(
                          "vi-VN",
                          { day: "2-digit", month: "2-digit" }
                        )
                      : "--/--"}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <Cake size={12} className="text-pink-500" /> Cake Day
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
                <span>{userStats?.postCount || 0} bài viết</span>
                <span>•</span>
                <span>{userStats?.commentCount || 0} bình luận</span>
              </div>

              <button
                onClick={() => navigate("/employee/profile")}
                className="w-full mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
              >
                <User size={14} /> Xem hồ sơ
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900 mb-3 text-sm">
              Chuyên mục
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveCategory("all")}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === "all"
                    ? "bg-teal-100 text-teal-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MessageSquare size={16} className="mr-2" /> Tất cả
              </button>
              {forumCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.id
                      ? "bg-teal-100 text-teal-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Briefcase size={16} className="mr-2" /> {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Hot Topics */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center">
              <Flame
                size={16}
                className="text-orange-500 mr-2"
                fill="currentColor"
              />{" "}
              Chủ đề nóng 24h
            </h3>
            {hotTopics.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                Chưa có chủ đề nóng
              </p>
            ) : (
              <ul className="space-y-3">
                {hotTopics.map((p, idx) => (
                  <li
                    key={p.id}
                    onClick={() => setSelectedPost(p)}
                    className="text-sm cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-orange-500 bg-orange-50 rounded px-1.5 py-0.5">
                        #{idx + 1}
                      </span>
                      <div className="flex-1">
                        <span className="font-bold text-slate-700 hover:text-teal-600 block line-clamp-2 mb-1">
                          {p.title}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={10} />
                            {p.upvoteCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={10} />
                            {p.commentCount || 0}
                          </span>
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Company News */}
          {news.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white shadow-lg">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Tin công ty
              </h3>
              <h4 className="text-sm font-bold mb-2 line-clamp-2">
                {news[0].title}
              </h4>
              <button
                onClick={() => navigate("/employee/news")}
                className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                Xem thêm <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="text-xs text-slate-400 text-center">
            <p>Nexus Internal Forum &copy; 2024</p>
            <div className="flex justify-center gap-2 mt-1">
              <a href="#" className="hover:underline">
                Quy định
              </a>
              <a href="#" className="hover:underline">
                Bảo mật
              </a>
              <a href="#" className="hover:underline">
                Liên hệ Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const QuickActionItem = ({
  icon: Icon,
  label,
  onClick,
  badge,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  badge?: number;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
  >
    <span className="flex items-center gap-2">
      <Icon size={16} />
      {label}
    </span>
    {badge !== undefined && badge > 0 && (
      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
        {badge}
      </span>
    )}
  </button>
);

// --- CreatePostModal (Reddit-style with Rich Text Editor) ---
const CreatePostModal = ({
  categories,
  onClose,
  onSuccess,
}: {
  categories: ForumCategory[];
  onClose: () => void;
  onSuccess: (post: ForumPost) => void;
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [selectedCategory, setSelectedCategory] =
    useState<ForumCategory | null>(categories[0] || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<null | "image">(
    null
  );
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const API_BASE =
    (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

  // Update selected category when categoryId changes
  useEffect(() => {
    if (categoryId) {
      const cat = categories.find((c) => c.id === categoryId);
      setSelectedCategory(cat || null);
    }
  }, [categoryId, categories]);

  // Rich text editor command
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (contentEditableRef.current) {
      setContent(contentEditableRef.current.innerHTML);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const token = localStorage.getItem("accessToken");
    setIsUploadingImage(true);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch(`${API_BASE}/upload/forum-image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const result = await response.json();
        if (result.success && result.data?.url) {
          const imageUrl = result.data.url;
          setAttachedImages((prev) => [...prev, imageUrl]);
          // Insert image into editor
          if (contentEditableRef.current) {
            const img = document.createElement("img");
            img.src = imageUrl;
            img.style.maxWidth = "300px";
            img.style.maxHeight = "200px";
            img.style.objectFit = "contain";
            img.className = "rounded-lg my-2 inline-block";
            contentEditableRef.current.appendChild(img);
            setContent(contentEditableRef.current.innerHTML);
          }
        } else {
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            if (imageUrl) {
              setAttachedImages((prev) => [...prev, imageUrl]);
              if (contentEditableRef.current) {
                const img = document.createElement("img");
                img.src = imageUrl;
                img.style.maxWidth = "300px";
                img.style.maxHeight = "200px";
                img.style.objectFit = "contain";
                img.className = "rounded-lg my-2 inline-block";
                contentEditableRef.current.appendChild(img);
                setContent(contentEditableRef.current.innerHTML);
              }
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
    setIsUploadingImage(false);
    if (e.target) e.target.value = "";
  };

  const handleInsertLink = () => {
    const linkText = prompt("Nhập text cho liên kết:");
    if (!linkText) return;
    const linkUrl = prompt("Nhập URL:");
    if (!linkUrl) return;
    if (contentEditableRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const anchor = document.createElement("a");
        anchor.href = linkUrl;
        anchor.textContent = linkText;
        anchor.target = "_blank";
        anchor.className = "text-teal-600 hover:underline";
        range.deleteContents();
        range.insertNode(anchor);
      }
      setContent(contentEditableRef.current.innerHTML);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết!");
      return;
    }
    if (!content.trim() && attachedImages.length === 0) {
      alert("Vui lòng nhập nội dung hoặc thêm ảnh!");
      return;
    }
    setIsSubmitting(true);
    try {
      // Use innerHTML to preserve embedded images from editor
      let postContent = contentEditableRef.current?.innerHTML || content;

      // Only add attached images that are NOT already embedded in the content (server URLs only, skip base64)
      const imagesToAdd = attachedImages.filter(
        (img) => !postContent.includes(img) && !img.startsWith("data:")
      );

      if (imagesToAdd.length > 0) {
        const imageHtml = imagesToAdd
          .map(
            (img) =>
              `<img src="${img}" style="max-width:100%; border-radius:8px; margin:8px 0;" />`
          )
          .join("");
        postContent = postContent
          ? `${postContent}<br/>${imageHtml}`
          : imageHtml;
      }
      const newPost = await forumService.createPost({
        title: title.trim(),
        content: postContent,
        categoryId,
      });
      onSuccess(newPost);
    } catch (e) {
      console.error("Failed to create post", e);
      alert("Không thể đăng bài. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
        {/* Header - Reddit Style */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  {selectedCategory ? selectedCategory.name : "Chọn chuyên mục"}
                </span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="text-xs text-slate-500 bg-transparent border-none outline-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 flex flex-col overflow-y-auto">
          {/* Title Input */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                placeholder="Tiêu đề bài viết..."
                className="flex-1 text-xl font-bold text-slate-800 placeholder:text-slate-400 border-none focus:ring-0 px-0 outline-none pr-4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={300}
                autoFocus
              />
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  title.length > 250
                    ? "bg-red-50 text-red-500"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {title.length}/300
              </span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1 border-b border-slate-100 pb-2 mb-3 text-slate-500 flex-wrap">
            <button
              onClick={() => execCommand("bold")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="In đậm"
            >
              <Bold size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("italic")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="In nghiêng"
            >
              <Italic size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("underline")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Gạch chân"
            >
              <Underline size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("strikeThrough")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Gạch ngang"
            >
              <Strikethrough size={16} strokeWidth={2.5} />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button
              onClick={() => execCommand("insertUnorderedList")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Danh sách"
            >
              <List size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("insertOrderedList")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Danh sách đánh số"
            >
              <ListOrdered size={16} strokeWidth={2.5} />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button
              onClick={() => execCommand("justifyLeft")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Căn trái"
            >
              <AlignLeft size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("justifyCenter")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Căn giữa"
            >
              <AlignCenter size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("justifyRight")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Căn phải"
            >
              <AlignRight size={16} strokeWidth={2.5} />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button
              onClick={handleInsertLink}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Chèn liên kết"
            >
              <Link size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("formatBlock", "pre")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Code"
            >
              <Code size={16} strokeWidth={2.5} />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            {/* Image Button */}
            <button
              onClick={() =>
                setActiveAttachment(
                  activeAttachment === "image" ? null : "image"
                )
              }
              className={`p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors ${
                activeAttachment === "image" ? "bg-slate-200" : ""
              }`}
              title="Thêm hình ảnh"
            >
              <FileImage size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Content Editor */}
          <div className="flex-1 min-h-[200px]">
            <div
              ref={contentEditableRef}
              contentEditable
              className="w-full flex-1 border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none text-slate-700 text-base leading-relaxed min-h-[200px] outline-none"
              style={{ minHeight: "200px" }}
              onInput={() => {
                if (contentEditableRef.current) {
                  setContent(contentEditableRef.current.innerHTML);
                }
              }}
              data-placeholder="Chia sẻ ý tưởng của bạn..."
              suppressContentEditableWarning
            />
            <style>{`
              [contenteditable][data-placeholder]:empty:before {
                content: attr(data-placeholder);
                color: #94a3b8;
                pointer-events: none;
              }
            `}</style>
          </div>

          {/* Image Attachment Section */}
          {activeAttachment === "image" && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  Thêm hình ảnh
                </h3>
                <button
                  onClick={() => setActiveAttachment(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {isUploadingImage ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                    <p className="text-sm font-medium text-slate-700">
                      Đang tải ảnh lên...
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 w-full"
                  >
                    <FileImage size={40} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Kéo thả hình ảnh vào đây
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        hoặc click để chọn tệp
                      </p>
                    </div>
                  </button>
                )}
              </div>
              {attachedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {attachedImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        onClick={() =>
                          setAttachedImages((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang đăng...
              </>
            ) : (
              <>
                <Send size={16} /> Đăng bài
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PostDetailModal (White theme) ---
const PostDetailModal = ({
  post,
  onClose,
  reactionState,
  onReactionChange,
}: {
  post: ForumPost;
  onClose: () => void;
  reactionState?: {
    reactions: Record<string, number>;
    userReaction: string | null;
  };
  onReactionChange?: (
    reactions: Record<string, number>,
    userReaction: string | null
  ) => void;
}) => {
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>(
    reactionState?.reactions || {}
  );
  const [userReaction, setUserReaction] = useState<string | null>(
    reactionState?.userReaction || null
  );
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [visibleComments, setVisibleComments] = useState(5);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // State for comment reactions and replies
  const [commentReactions, setCommentReactions] = useState<
    Record<
      string,
      { reactions: Record<string, number>; userReaction: string | null }
    >
  >({});
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    authorName: string;
  } | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const data = await forumService.getComments(post.id);
        setComments(data || []);

        // Load reactions for all comments
        if (data && data.length > 0) {
          const reactionsMap: Record<
            string,
            { reactions: Record<string, number>; userReaction: string | null }
          > = {};
          await Promise.all(
            data.map(async (comment: any) => {
              try {
                const reactionData = await forumService.getReactions(
                  "comment",
                  comment.id
                );
                reactionsMap[comment.id] = reactionData;
              } catch (error) {
                reactionsMap[comment.id] = {
                  reactions: {},
                  userReaction: null,
                };
              }
            })
          );
          setCommentReactions(reactionsMap);
        }
      } catch (error) {
        console.error("Failed to load comments", error);
      } finally {
        setLoadingComments(false);
      }
    };
    fetchComments();
  }, [post.id]);

  useEffect(() => {
    if (reactionState) {
      setReactions(reactionState.reactions);
      setUserReaction(reactionState.userReaction);
    }
  }, [reactionState]);

  const handleToggleReaction = async (reactionType: string) => {
    setShowReactionPicker(false);
    try {
      const res = await forumService.toggleReaction(
        "post",
        post.id,
        reactionType as any
      );
      setReactions(res.reactions || {});
      setUserReaction(res.reacted ? reactionType : null);
      onReactionChange?.(res.reactions, res.reacted ? reactionType : null);
    } catch (error) {
      console.error("Failed to toggle reaction", error);
    }
  };

  const handleAddComment = async () => {
    const content = newComment.trim();
    if (!content) return;
    try {
      setSubmittingComment(true);
      const created = await forumService.createComment(post.id, { content });
      setComments((prev) => [...prev, created]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle comment reaction (like)
  const handleCommentReaction = async (
    commentId: string,
    reactionType: string = "like"
  ) => {
    try {
      const res = await forumService.toggleReaction(
        "comment",
        commentId,
        reactionType as any
      );
      setCommentReactions((prev) => ({
        ...prev,
        [commentId]: {
          reactions: res.reactions || {},
          userReaction: res.reacted ? reactionType : null,
        },
      }));
    } catch (error) {
      console.error("Failed to toggle comment reaction", error);
    }
  };

  // Handle reply to comment
  const handleReplyToComment = (comment: ForumComment) => {
    setReplyingTo({
      id: comment.id,
      authorName: comment.authorName || "Unknown",
    });
    setReplyContent("");
    // Focus input after setting reply
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Submit reply
  const handleSubmitReply = async () => {
    const content = replyContent.trim();
    if (!content || !replyingTo) return;
    try {
      setSubmittingComment(true);
      const created = await forumService.createComment(post.id, {
        content,
        parentId: replyingTo.id,
      });
      setComments((prev) => [...prev, created]);
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to add reply", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const formatTimeAgo = (dateStr: string | Date) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Extract image from content
  const postImage = extractFirstImage(post.content);
  const textContent = stripHtmlTags(post.content);

  // Calculate total reactions
  const totalReactions = Object.values(reactions).reduce(
    (sum, count) => sum + count,
    0
  );

  // Get top reactions for display
  const topReactions = reactionConfig
    .filter((r) => reactions[r.type] > 0)
    .sort((a, b) => reactions[b.type] - reactions[a.type])
    .slice(0, 3);

  const currentReactionConfig = userReaction
    ? reactionConfig.find((r) => r.type === userReaction)
    : null;

  const storedUser = authService.getStoredUser();

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-slate-900 font-bold text-lg">
            Bài viết của {post.authorName}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content: Post + Comments */}
        <div className="flex-1 overflow-y-auto">
          {/* Author Info */}
          <div className="p-4 flex items-start gap-3">
            <img
              src={
                post.authorAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  post.authorName
                )}&background=0d9488&color=fff`
              }
              alt={post.authorName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-[15px]">
                  {post.authorName}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>
                  {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "numeric",
                  })}{" "}
                  lúc{" "}
                  {new Date(post.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>·</span>
                <span>🌐</span>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-3">
            {textContent && (
              <p className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                {textContent}
              </p>
            )}
          </div>

          {/* Image - Full width */}
          {postImage && (
            <div className="w-full">
              <img
                src={postImage}
                alt=""
                className="w-full object-contain bg-slate-100"
              />
            </div>
          )}

          {/* Reaction Stats Bar */}
          <div className="px-4 py-2 flex items-center justify-between text-slate-500 text-[13px]">
            <div className="flex items-center gap-1">
              {topReactions.length > 0 ? (
                <>
                  <div className="flex -space-x-1">
                    {topReactions.map((r) => (
                      <span key={r.type} className="text-base">
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                  <span className="ml-1 hover:underline cursor-pointer">
                    {totalReactions}
                  </span>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              {comments.length > 0 && (
                <span className="hover:underline cursor-pointer">
                  {comments.length} bình luận
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mx-4 border-t border-b border-slate-200 py-1">
            <div className="flex items-center">
              {/* Like button with hover reaction picker */}
              <div
                className="relative flex-1"
                onMouseEnter={() => {
                  hoverTimeoutRef.current = setTimeout(
                    () => setShowReactionPicker(true),
                    500
                  );
                }}
                onMouseLeave={() => {
                  if (hoverTimeoutRef.current)
                    clearTimeout(hoverTimeoutRef.current);
                  setTimeout(() => setShowReactionPicker(false), 800);
                }}
              >
                <button
                  onClick={() => handleToggleReaction(userReaction || "like")}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    userReaction
                      ? `${currentReactionConfig?.color}`
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {currentReactionConfig ? (
                    <>
                      <span className="text-lg">
                        {currentReactionConfig.emoji}
                      </span>
                      <span>{currentReactionConfig.label}</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp size={18} />
                      <span>Thích</span>
                    </>
                  )}
                </button>

                {showReactionPicker && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 bg-white rounded-full shadow-xl border border-slate-200 flex items-center gap-0.5 z-50">
                    {reactionConfig.map((config) => (
                      <button
                        key={config.type}
                        onClick={() => handleToggleReaction(config.type)}
                        className={`p-1.5 rounded-full hover:bg-slate-100 hover:scale-125 transition-all ${
                          userReaction === config.type
                            ? "bg-slate-200 scale-110"
                            : ""
                        }`}
                        title={config.label}
                      >
                        <span className="text-2xl">{config.emoji}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => inputRef.current?.focus()}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <MessageSquare size={18} />
                <span>Bình luận</span>
              </button>

              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors">
                <Share2 size={18} />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-4 space-y-3">
            {/* Sort dropdown */}
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <span className="font-semibold">Phù hợp nhất</span>
              <ChevronRight size={16} className="rotate-90" />
            </div>

            {loadingComments ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-teal-500 border-t-transparent"></div>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-2">
                Hãy là người đầu tiên bình luận.
              </p>
            ) : (
              <>
                {comments
                  .filter((c) => !c.parentId)
                  .slice(0, visibleComments)
                  .map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <img
                        src={
                          c.authorAvatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            c.authorName || ""
                          )}&background=0d9488&color=fff`
                        }
                        alt={c.authorName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        {/* Comment bubble */}
                        <div className="bg-slate-100 rounded-2xl px-3 py-2 inline-block max-w-full">
                          <span className="font-semibold text-slate-900 text-[13px] block">
                            {c.authorName}
                          </span>
                          <p className="text-slate-700 text-[15px]">
                            {c.content}
                          </p>
                        </div>

                        {/* Comment actions */}
                        <div className="flex items-center gap-3 mt-1 ml-3 text-xs text-slate-500">
                          <span>{formatTimeAgo(c.createdAt)}</span>
                          <button
                            onClick={() => handleCommentReaction(c.id, "like")}
                            className={`font-semibold hover:underline ${
                              commentReactions[c.id]?.userReaction === "like"
                                ? "text-blue-600"
                                : ""
                            }`}
                          >
                            {commentReactions[c.id]?.userReaction === "like"
                              ? "Đã thích"
                              : "Thích"}
                            {(commentReactions[c.id]?.reactions?.like ||
                              c.upvoteCount ||
                              0) > 0 && (
                              <span className="ml-1">
                                (
                                {commentReactions[c.id]?.reactions?.like ||
                                  c.upvoteCount}
                                )
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => handleReplyToComment(c)}
                            className="font-semibold hover:underline"
                          >
                            Trả lời
                          </button>
                        </div>

                        {/* Reply input inline */}
                        {replyingTo?.id === c.id && (
                          <div className="ml-3 mt-2 flex items-start gap-2">
                            <img
                              src={
                                (storedUser as any)?.avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  (storedUser as any)?.full_name || "U"
                                )}&background=0d9488&color=fff`
                              }
                              alt="You"
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center bg-slate-100 rounded-2xl px-3 py-1.5">
                                <input
                                  type="text"
                                  value={replyContent}
                                  onChange={(e) =>
                                    setReplyContent(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSubmitReply();
                                    }
                                    if (e.key === "Escape") {
                                      handleCancelReply();
                                    }
                                  }}
                                  placeholder={`Trả lời ${replyingTo.authorName}...`}
                                  className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                                  autoFocus
                                />
                                <button
                                  onClick={handleSubmitReply}
                                  disabled={
                                    !replyContent.trim() || submittingComment
                                  }
                                  className="ml-2 text-teal-600 font-semibold text-sm disabled:opacity-50"
                                >
                                  Gửi
                                </button>
                                <button
                                  onClick={handleCancelReply}
                                  className="ml-2 text-slate-400 hover:text-slate-600"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Show replies (comments with parentId === c.id) */}
                        {comments
                          .filter((reply) => reply.parentId === c.id)
                          .map((reply) => (
                            <div
                              key={reply.id}
                              className="ml-6 mt-2 flex gap-2"
                            >
                              <img
                                src={
                                  reply.authorAvatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    reply.authorName || ""
                                  )}&background=0d9488&color=fff`
                                }
                                alt={reply.authorName}
                                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="bg-slate-100 rounded-2xl px-3 py-1.5 inline-block max-w-full">
                                  <span className="font-semibold text-slate-900 text-[12px] block">
                                    {reply.authorName}
                                  </span>
                                  <p className="text-slate-700 text-[14px]">
                                    {reply.content}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 ml-3 text-[11px] text-slate-500">
                                  <span>{formatTimeAgo(reply.createdAt)}</span>
                                  <button
                                    onClick={() =>
                                      handleCommentReaction(reply.id, "like")
                                    }
                                    className={`font-semibold hover:underline ${
                                      commentReactions[reply.id]
                                        ?.userReaction === "like"
                                        ? "text-blue-600"
                                        : ""
                                    }`}
                                  >
                                    {commentReactions[reply.id]
                                      ?.userReaction === "like"
                                      ? "Đã thích"
                                      : "Thích"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}

                {comments.filter((c) => !c.parentId).length >
                  visibleComments && (
                  <button
                    onClick={() => setVisibleComments((prev) => prev + 10)}
                    className="text-slate-600 text-sm font-semibold hover:underline flex items-center gap-1 ml-10"
                  >
                    Xem thêm bình luận
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Fixed Comment Input at bottom */}
        <div className="p-3 border-t border-slate-200 flex items-center gap-2">
          <img
            src={
              (storedUser as any)?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                (storedUser as any)?.full_name || "U"
              )}&background=0d9488&color=fff`
            }
            alt="You"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 flex items-center bg-slate-100 rounded-full px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              placeholder="Viết bình luận..."
              className="flex-1 bg-transparent outline-none text-slate-800 text-sm placeholder:text-slate-500"
            />
            <div className="flex items-center gap-1 text-slate-500">
              <button className="p-1 hover:bg-slate-200 rounded-full">
                <Smile size={18} />
              </button>
            </div>
          </div>
          {newComment.trim() && (
            <button
              onClick={handleAddComment}
              disabled={submittingComment}
              className="text-teal-600 font-semibold text-sm hover:text-teal-500 disabled:opacity-50"
            >
              {submittingComment ? "..." : "Gửi"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
