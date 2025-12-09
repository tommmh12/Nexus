import React, { useState, useRef, useEffect } from "react";
import { ForumPost, ForumCategory, Poll, ForumComment } from "../../types";
import { forumService } from "../../services/forumService";
import { useRealtimeForum } from "../../hooks/useRealtimeForum";
import { Button } from "../system/ui/Button";
import { Input } from "../system/ui/Input";
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
  Edit2,
  Trash2,
  X,
  Save,
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
  Type,
  Link,
  Code,
  MoreVertical,
  Smile,
  Sidebar,
} from "lucide-react";
import { UserProfile } from "./UserProfile";

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
                ${
                  isVisible
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
                className={`absolute bottom-1 right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${
                  userProfile.status === "Active"
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

const VoteControl = ({
  upvotes,
  downvotes,
  userVote,
}: {
  upvotes: number;
  downvotes: number;
  userVote?: 1 | 0 | -1;
}) => {
  const [score, setScore] = useState(upvotes - downvotes);
  const [vote, setVote] = useState(userVote || 0);

  const handleVote = (type: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    if (vote === type) {
      // Cancel vote
      setVote(0);
      setScore(type === 1 ? score - 1 : score + 1);
    } else {
      // Change vote
      const diff = vote === 0 ? 1 : 2;
      setScore(type === 1 ? score + diff : score - diff);
      setVote(type);
    }
  };

  return (
    <div className="flex flex-col items-center bg-slate-50 p-2 rounded-lg h-fit">
      <button
        onClick={(e) => handleVote(1, e)}
        className={`p-1 hover:bg-slate-200 rounded ${
          vote === 1 ? "text-orange-600" : "text-slate-500"
        }`}
      >
        <ArrowBigUp size={24} fill={vote === 1 ? "currentColor" : "none"} />
      </button>
      <span
        className={`text-sm font-bold my-1 ${
          vote === 1
            ? "text-orange-600"
            : vote === -1
            ? "text-blue-600"
            : "text-slate-700"
        }`}
      >
        {score}
      </span>
      <button
        onClick={(e) => handleVote(-1, e)}
        className={`p-1 hover:bg-slate-200 rounded ${
          vote === -1 ? "text-blue-600" : "text-slate-500"
        }`}
      >
        <ArrowBigDown size={24} fill={vote === -1 ? "currentColor" : "none"} />
      </button>
    </div>
  );
};

const PollWidget = ({ poll }: { poll: Poll }) => {
  const [votedOption, setVotedOption] = useState<string | undefined>(
    poll.userVotedOptionId
  );
  const [totalVotes, setTotalVotes] = useState(poll.totalVotes);

  const handleVote = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!votedOption) {
      setVotedOption(optionId);
      setTotalVotes(totalVotes + 1);
    }
  };

  return (
    <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
        <BarChart2 size={16} className="mr-2 text-brand-600" /> {poll.question}
      </h4>
      <div className="space-y-3">
        {poll.options.map((opt) => {
          const votes = votedOption === opt.id ? opt.votes + 1 : opt.votes;
          const percent = Math.round((votes / totalVotes) * 100) || 0;

          return (
            <div
              key={opt.id}
              onClick={(e) => handleVote(opt.id, e)}
              className={`relative border rounded-lg overflow-hidden h-10 flex items-center px-4 cursor-pointer transition-all ${
                votedOption === opt.id
                  ? "border-brand-500 ring-1 ring-brand-500"
                  : "border-slate-300 hover:border-brand-400"
              }`}
            >
              {/* Progress Bar Background */}
              <div
                className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
                  votedOption === opt.id ? "bg-brand-100" : "bg-slate-200"
                }`}
                style={{ width: votedOption ? `${percent}%` : "0%" }}
              ></div>

              {/* Text Content */}
              <div className="relative z-10 flex justify-between w-full text-sm">
                <span
                  className={`font-medium ${
                    votedOption === opt.id ? "text-brand-800" : "text-slate-700"
                  }`}
                >
                  {opt.text} {votedOption === opt.id && "(Đã chọn)"}
                </span>
                {votedOption && (
                  <span className="font-bold text-slate-900">{percent}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-slate-500 flex justify-between">
        <span>Tổng số phiếu: {totalVotes}</span>
        <span>Kết thúc sau: 2 ngày</span>
      </div>
    </div>
  );
};

// --- REDESIGNED: Create Post Modal ---
const CreatePostModal = ({ 
  onClose, 
  onPostCreated 
}: { 
  onClose: () => void;
  onPostCreated?: () => void;
}) => {
  // Current User Mock
  const currentUser = {
    name: "Trần Minh Đức", // Mock logged in user
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
    initials: "TD",
    dept: "Technology",
  };

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await forumService.getCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết");
      return;
    }
    
    if (!content.trim()) {
      setError("Vui lòng nhập nội dung bài viết");
      return;
    }

    if (!categoryId) {
      setError("Vui lòng chọn chuyên mục");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newPost = await forumService.createPost({
        title: title.trim(),
        content: content.trim(),
        categoryId,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        authorDept: currentUser.dept,
        tags: [],
        status: "Pending",
      });

      if (onPostCreated) {
        onPostCreated();
      }
      
      onClose();
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(err.message || "Không thể đăng bài. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col min-h-[400px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
              {currentUser.initials}
            </div>
            <span className="font-bold text-slate-900 text-sm">
              {currentUser.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Title Input */}
          <input
            type="text"
            placeholder="Thêm chủ đề"
            className="w-full text-xl font-medium text-slate-700 placeholder:text-slate-400 border-none focus:ring-0 px-0 mb-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />

          {/* Toolbar */}
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-3 text-slate-500 overflow-x-auto">
            <button
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Bold"
            >
              <Bold size={18} strokeWidth={2.5} />
            </button>
            <button
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Italic"
            >
              <Italic size={18} strokeWidth={2.5} />
            </button>
            <button
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Underline"
            >
              <Underline size={18} strokeWidth={2.5} />
            </button>
            <button
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Strikethrough"
            >
              <Strikethrough size={18} strokeWidth={2.5} />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="List"
            >
              <List size={18} strokeWidth={2.5} />
            </button>
            <button
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Ordered List"
            >
              <ListOrdered size={18} strokeWidth={2.5} />
            </button>
            <button
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Indent"
            >
              <AlignLeft size={18} strokeWidth={2.5} />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Text Color"
            >
              <Type
                size={18}
                strokeWidth={2.5}
                className="text-slate-800 underline decoration-slate-400"
              />
            </button>
            <button
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors flex items-center"
              title="Font Size"
            >
              <span className="text-sm font-bold">Aa</span>
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Quote"
            >
              <span className="font-serif font-bold text-lg">99</span>
            </button>
            <button
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Link"
            >
              <Link size={18} strokeWidth={2.5} />
            </button>
            <button
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Code"
            >
              <Code size={18} strokeWidth={2.5} />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors">
              <MoreHorizontal size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Content Input */}
          <textarea
            className="w-full flex-1 border-none focus:ring-0 resize-none px-0 text-slate-700 placeholder:text-slate-400 text-base leading-relaxed"
            placeholder="Nhập nội dung bài viết..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Left Actions */}
          <div className="flex items-center gap-4 text-slate-500">
            <button className="hover:text-slate-700 transition-colors">
              <Smile size={20} strokeWidth={1.5} />
            </button>
            <button className="hover:text-slate-700 transition-colors">
              <ImageIcon size={20} strokeWidth={1.5} />
            </button>
            <button className="hover:text-slate-700 transition-colors">
              <Paperclip size={20} strokeWidth={1.5} />
            </button>
            <button className="hover:text-slate-700 transition-colors">
              <Plus size={20} strokeWidth={1.5} />
            </button>

            {/* Category Selector */}
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <select 
              className="bg-transparent text-sm text-slate-500 font-medium outline-none cursor-pointer hover:text-slate-700 border border-slate-200 rounded px-2 py-1"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Chọn chuyên mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-700">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-sm">Đồng thời thông báo qua email</span>
            </label>

            <div className="flex items-center gap-2">
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                <Sidebar size={18} strokeWidth={2} />
              </button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 h-10 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Đang đăng..." : "Đăng"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: ForumComment;
  depth?: number;
  onUserClick: (name: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth = 0,
  onUserClick,
}) => {
  return (
    <div className={`flex gap-3 ${depth > 0 ? "mt-4" : ""}`}>
      <div className="flex flex-col items-center">
        <UserHoverCard
          name={comment.authorName}
          avatar={comment.authorAvatar}
          dept={comment.authorDept}
          onClick={() => onUserClick(comment.authorName)}
        >
          <img
            src={comment.authorAvatar}
            alt=""
            className="w-8 h-8 rounded-full border border-slate-200 flex-shrink-0"
          />
        </UserHoverCard>
        {depth > 0 && <div className="w-px h-full bg-slate-200 my-1"></div>}
      </div>
      <div className="flex-1">
        <div className="bg-slate-50 p-3 rounded-xl rounded-tl-none border border-slate-200 inline-block min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <UserHoverCard
              name={comment.authorName}
              avatar={comment.authorAvatar}
              dept={comment.authorDept}
              onClick={() => onUserClick(comment.authorName)}
            >
              <span className="font-bold text-sm text-slate-900 hover:underline cursor-pointer">
                {comment.authorName}
              </span>
            </UserHoverCard>
            <span className="text-xs text-slate-500">
              • {comment.authorDept}
            </span>
            <span className="text-xs text-slate-400">
              • {comment.timestamp}
            </span>
          </div>
          <p className="text-sm text-slate-700">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-slate-500 font-medium">
          <button className="flex items-center gap-1 hover:text-orange-600">
            <ArrowBigUp size={16} /> {comment.upvotes}
          </button>
          <button className="flex items-center gap-1 hover:text-blue-600">
            <ArrowBigDown size={16} />
          </button>
          <button className="hover:text-brand-600">Trả lời</button>
          <button className="hover:text-red-500 flex items-center gap-1">
            <Flag size={12} /> Báo cáo
          </button>
        </div>

        {/* Recursive Replies */}
        {comment.replies &&
          comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onUserClick={onUserClick}
            />
          ))}
      </div>
    </div>
  );
};

const PostDetail = ({
  post,
  onBack,
  onUserClick,
}: {
  post: ForumPost;
  onBack: () => void;
  onUserClick: (name: string) => void;
}) => {
  const [isSubscribed, setIsSubscribed] = useState(post.isSubscribed || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto flex gap-6">
      {/* Left Vote Column */}
      <div className="hidden md:flex flex-col gap-4 sticky top-6 h-fit">
        <Button
          variant="outline"
          onClick={onBack}
          className="h-10 w-10 p-0 rounded-full border-slate-300"
        >
          <ArrowLeft size={20} />
        </Button>
        <VoteControl
          upvotes={post.upvotes}
          downvotes={post.downvotes}
          userVote={post.userVote}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible mb-6">
          <div className="p-6 md:p-8">
            {/* Meta Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <UserHoverCard
                  name={post.authorName}
                  avatar={post.authorAvatar}
                  dept={post.authorDept}
                  onClick={() => onUserClick(post.authorName)}
                >
                  <img
                    src={post.authorAvatar}
                    alt=""
                    className="w-10 h-10 rounded-full border border-slate-100"
                  />
                </UserHoverCard>
                <div>
                  <UserHoverCard
                    name={post.authorName}
                    avatar={post.authorAvatar}
                    dept={post.authorDept}
                    onClick={() => onUserClick(post.authorName)}
                  >
                    <h3 className="text-sm font-bold text-slate-900 hover:underline cursor-pointer">
                      {post.authorName}
                    </h3>
                  </UserHoverCard>
                  <p className="text-xs text-slate-500">
                    {post.authorDept} • {post.timestamp}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={isSubscribed ? "secondary" : "outline"}
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`text-xs h-8 px-3 ${
                    isSubscribed ? "bg-slate-100 text-slate-700" : ""
                  }`}
                >
                  {isSubscribed ? (
                    <BellRing size={14} className="mr-2 text-brand-600" />
                  ) : (
                    <Bell size={14} className="mr-2" />
                  )}
                  {isSubscribed ? "Đang theo dõi" : "Theo dõi"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsSaved(!isSaved)}
                  className={`h-8 w-8 p-0 ${
                    isSaved ? "text-brand-600" : "text-slate-400"
                  }`}
                >
                  <Bookmark
                    size={18}
                    fill={isSaved ? "currentColor" : "none"}
                  />
                </Button>
                <button className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              {post.title}
            </h1>

            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md mr-2 mb-4"
              >
                #{tag}
              </span>
            ))}

            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-6">
              {post.content}
            </div>

            {post.poll && <PollWidget poll={post.poll} />}

            {/* Footer Actions */}
            <div className="flex items-center gap-6 pt-6 border-t border-slate-100 mt-6 text-slate-500 text-sm font-medium">
              <span className="flex items-center gap-2">
                <MessageSquare size={18} /> {post.commentCount} Bình luận
              </span>
              <span className="flex items-center gap-2 cursor-pointer hover:text-brand-600">
                <Share2 size={18} /> Chia sẻ
              </span>
              <span className="flex items-center gap-2 cursor-pointer hover:text-red-600">
                <Flag size={18} /> Báo cáo
              </span>
              <span className="ml-auto text-xs font-normal">
                <Eye size={16} className="inline mr-1" /> {post.viewCount} lượt
                xem
              </span>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h3 className="font-bold text-slate-900 mb-6">
            Thảo luận ({post.commentCount})
          </h3>

          <div className="flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100"
                alt="Me"
              />
            </div>
            <div className="flex-1 relative">
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none min-h-[100px]"
                placeholder="Viết bình luận của bạn..."
              ></textarea>
              <div className="absolute bottom-3 right-3 flex gap-2">
                <Button className="h-8 px-3 text-xs">Gửi bình luận</Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {post.comments?.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onUserClick={onUserClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ... ForumManager Code (Admin) Omitted for brevity as it's not the target of this change ...
export const ForumManager = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "categories">("posts");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: "",
    color: "",
    order: 0,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const allPosts = await forumService.getPosts();
        setPosts(allPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (activeTab === "categories") {
      const fetchCategories = async () => {
        try {
          setCategoriesLoading(true);
          const allCategories = await forumService.getCategories();
          setCategories(allCategories);
        } catch (err) {
          console.error("Error fetching categories:", err);
        } finally {
          setCategoriesLoading(false);
        }
      };
      fetchCategories();
    }
  }, [activeTab]);

  // Real-time updates
  useRealtimeForum({
    onPostCreated: (post) => {
      setPosts((prev) => [post, ...prev]);
    },
    onPostUpdated: (post) => {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    },
    onPostApproved: (post) => {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    },
    onPostRejected: (post) => {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    },
  });

  const handleApprove = async (id: string) => {
    try {
      await forumService.approvePost(id);
      const updatedPosts = await forumService.getPosts();
      setPosts(updatedPosts);
    } catch (err) {
      console.error("Error approving post:", err);
      alert("Không thể duyệt bài viết. Vui lòng thử lại.");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối bài viết này?")) {
      return;
    }
    try {
      await forumService.rejectPost(id);
      const updatedPosts = await forumService.getPosts();
      setPosts(updatedPosts);
    } catch (err) {
      console.error("Error rejecting post:", err);
      alert("Không thể từ chối bài viết. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      return;
    }
    try {
      await forumService.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Không thể xóa bài viết. Vui lòng thử lại.");
    }
  };

  // Category management handlers
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "", icon: "", color: "", order: 0 });
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: ForumCategory & { order?: number }) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "",
      order: (category as any).order || 0,
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert("Vui lòng nhập tên chuyên mục");
      return;
    }

    try {
      if (editingCategory) {
        await forumService.updateCategory(editingCategory.id, categoryForm);
      } else {
        await forumService.createCategory(categoryForm);
      }
      
      // Refresh categories
      const allCategories = await forumService.getCategories();
      setCategories(allCategories);
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      alert(err.message || "Không thể lưu chuyên mục. Vui lòng thử lại.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chuyên mục này? Các bài viết trong chuyên mục sẽ bị ảnh hưởng.")) {
      return;
    }
    try {
      await forumService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || "Không thể xóa chuyên mục. Vui lòng thử lại.");
    }
  };

  const filteredPosts = posts.filter((item) => {
    const matchesStatus =
      filterStatus === "All" || item.status === filterStatus;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="animate-fadeIn h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
          <p className="text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Diễn đàn</h2>
          <p className="text-slate-500 mt-1">
            Kiểm duyệt và quản lý bài viết, chuyên mục trong diễn đàn nội bộ.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "posts"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Bài viết
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "categories"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Chuyên mục
        </button>
      </div>

      {/* Category Management */}
      {activeTab === "categories" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Danh sách chuyên mục</h3>
              <p className="text-sm text-slate-500 mt-1">
                Quản lý các chuyên mục trong diễn đàn nội bộ
              </p>
            </div>
            <button
              onClick={handleCreateCategory}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
            >
              <Plus size={18} />
              Tạo chuyên mục mới
            </button>
          </div>

          {categoriesLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-4"></div>
              <p className="text-slate-500">Đang tải chuyên mục...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có chuyên mục nào</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Tạo chuyên mục đầu tiên để tổ chức và phân loại các bài viết trong diễn đàn.
              </p>
              <button
                onClick={handleCreateCategory}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium shadow-sm hover:shadow-md"
              >
                <Plus size={20} />
                Tạo chuyên mục đầu tiên
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tên chuyên mục
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Icon & Màu
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
                        <div className="font-bold text-slate-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 max-w-md">
                          {category.description || <span className="text-slate-400">Không có mô tả</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {category.icon && (
                            <span className="text-lg">{category.icon}</span>
                          )}
                          {category.color && (
                            <span className={`px-2 py-1 rounded text-xs ${category.color}`}>
                              Màu
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{(category as any).order ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
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
          )}

          {/* Category Modal */}
          {isCategoryModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingCategory ? "Chỉnh sửa chuyên mục" : "Tạo chuyên mục mới"}
                  </h3>
                  <button
                    onClick={() => {
                      setIsCategoryModalOpen(false);
                      setEditingCategory(null);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên chuyên mục <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="Ví dụ: Công nghệ, Thông báo..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Mô tả ngắn về chuyên mục..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Icon
                      </label>
                      <Input
                        value={categoryForm.icon}
                        onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                        placeholder="Ví dụ: Cpu, Bell..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Màu (CSS class)
                      </label>
                      <Input
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        placeholder="Ví dụ: text-blue-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Thứ tự hiển thị
                    </label>
                    <Input
                      type="number"
                      value={categoryForm.order}
                      onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setIsCategoryModalOpen(false);
                      setEditingCategory(null);
                    }}
                    className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveCategory}
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={16} />
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Posts Management */}
      {activeTab === "posts" && (
        <>
          {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full md:w-auto">
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
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {posts.length === 0 ? "Chưa có bài viết nào" : "Không tìm thấy bài viết"}
            </h3>
            <p className="text-slate-500">
              {posts.length === 0 
                ? "Chưa có bài viết nào trong hệ thống."
                : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."}
            </p>
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
                  Tương tác
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredPosts.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 w-[40%]">
                    <div>
                      <div className="font-bold text-slate-900 line-clamp-2 mb-1">
                        {item.isPinned && <Pin size={14} className="inline mr-1 text-orange-500" />}
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock size={12} /> {new Date(item.timestamp).toLocaleDateString("vi-VN")}
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
                        item.status === "Approved"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : item.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.status === "Approved"
                            ? "bg-green-500"
                            : item.status === "Pending"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>👍 {item.upvotes}</span>
                      <span>💬 {item.commentCount}</span>
                      <span>👁️ {item.viewCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {item.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200"
                            title="Duyệt"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                            title="Từ chối"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
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
        </>
      )}
    </div>
  );
};

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
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allPosts, allCategories] = await Promise.all([
          forumService.getPosts(),
          forumService.getCategories(),
        ]);
        setPosts(allPosts);
        setCategories(allCategories);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Real-time updates
  useRealtimeForum({
    onPostCreated: (post) => {
      if (post.status === "Approved") {
        setPosts((prev) => [post, ...prev]);
      }
    },
    onPostUpdated: (post) => {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    },
    onPostApproved: (post) => {
      setPosts((prev) => {
        const exists = prev.find((p) => p.id === post.id);
        if (exists) {
          return prev.map((p) => (p.id === post.id ? post : p));
        } else {
          return [post, ...prev];
        }
      });
    },
    onPostRejected: (post) => {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    },
  });

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

  const handlePostCreated = async () => {
    try {
      const allPosts = await forumService.getPosts();
      setPosts(allPosts);
    } catch (err) {
      console.error("Error refreshing posts:", err);
    }
  };

  // Filter Logic
  let filteredPosts: ForumPost[] = posts.filter((p) => p.status === "Approved");
  if (activeCategory !== "all") {
    filteredPosts = filteredPosts.filter(
      (p) => p.categoryId === activeCategory
    );
  }
  if (feedSort === "saved") {
    filteredPosts = filteredPosts.filter((p) => p.isSaved);
  } else if (feedSort === "hot") {
    filteredPosts = [...filteredPosts].sort(
      (a, b) => b.upvotes + b.commentCount - (a.upvotes + a.commentCount)
    );
  } else if (feedSort === "new") {
    filteredPosts = [...filteredPosts].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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

  if (loading) {
    return (
      <div className="animate-fadeIn h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
          <p className="text-slate-500">Đang tải diễn đàn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn h-full">
      {showCreateModal && (
        <CreatePostModal 
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
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
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    feedSort === "new"
                      ? "bg-slate-100 text-brand-600 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Clock size={18} className="mr-3" /> Mới nhất
                </button>
                <button
                  onClick={() => setFeedSort("hot")}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    feedSort === "hot"
                      ? "bg-slate-100 text-orange-600 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Flame size={18} className="mr-3" /> Nổi bật (Trending)
                </button>
                <button
                  onClick={() => setFeedSort("saved")}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    feedSort === "saved"
                      ? "bg-slate-100 text-blue-600 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Bookmark size={18} className="mr-3" /> Đã lưu
                </button>
              </div>

              <div className="border-t border-slate-100 my-4"></div>

              <h3 className="font-bold text-slate-900 mb-3 px-2">Chuyên mục</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === "all"
                      ? "bg-slate-100 text-brand-600 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center">
                    <MessageSquare size={18} className="mr-3" /> Tất cả
                  </span>
                </button>
                {[].map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === cat.id
                        ? "bg-slate-100 text-brand-600 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center">
                      <span className={`mr-3 ${cat.color.split(" ")[1]}`}>
                        {getIcon(cat.icon, 18)}
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

            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
                <MessageSquare className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {posts.length === 0 ? "Chưa có bài viết nào" : "Không tìm thấy bài viết"}
                </h3>
                <p className="text-slate-500 mb-4">
                  {posts.length === 0 
                    ? "Hãy là người đầu tiên chia sẻ trong diễn đàn!"
                    : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."}
                </p>
                {posts.length === 0 && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} className="mr-2" /> Tạo bài viết đầu tiên
                  </Button>
                )}
              </div>
            ) : (
              filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group flex"
              >
                {/* Vote Sidebar */}
                <div className="bg-slate-50 w-12 flex flex-col items-center pt-4 border-r border-slate-100">
                  <VoteControl
                    upvotes={post.upvotes}
                    downvotes={post.downvotes}
                    userVote={post.userVote}
                  />
                </div>

                {/* Content */}
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
                        r/{post.categoryId}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        • Đăng bởi
                        <UserHoverCard
                          name={post.authorName}
                          avatar={post.authorAvatar}
                          dept={post.authorDept}
                          onClick={() => handleUserClick(post.authorName)}
                        >
                          <span className="font-medium text-slate-600 hover:text-brand-600 hover:underline">
                            {post.authorName}
                          </span>
                        </UserHoverCard>
                        • {post.timestamp}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-brand-600 transition-colors">
                    {post.title}
                  </h2>

                  <div className="flex gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Preview Content (truncated) */}
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {post.poll && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-center gap-3">
                      <BarChart2 size={20} className="text-blue-600" />
                      <div>
                        <p className="text-sm font-bold text-blue-900">
                          Khảo sát đang diễn ra
                        </p>
                        <p className="text-xs text-blue-700">
                          {post.poll.totalVotes} lượt bình chọn
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center text-slate-500 text-xs font-bold bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors">
                      <MessageSquare size={16} className="mr-1.5" />{" "}
                      {post.commentCount} Bình luận
                    </div>
                    <div className="flex items-center text-slate-500 text-xs font-bold hover:bg-slate-100 px-2 py-1 rounded transition-colors">
                      <Share2 size={16} className="mr-1.5" /> Chia sẻ
                    </div>
                    {post.isSaved && (
                      <div className="flex items-center text-brand-600 text-xs font-bold px-2 py-1">
                        <Bookmark
                          size={16}
                          className="mr-1.5"
                          fill="currentColor"
                        />{" "}
                        Đã lưu
                      </div>
                    )}
                  </div>
                </div>
              </div>
              ))
            )}
          </div>

          {/* Right Sidebar: Profile & Trending */}
          <div className="lg:col-span-3 space-y-6">
            {/* User Karma Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="h-16 bg-brand-600"></div>
              <div className="px-4 pb-4 -mt-8">
                <img
                  src="/avatar-placeholder.png"
                  alt=""
                  className="w-16 h-16 rounded-full border-4 border-white mb-2"
                />
                <h3 className="font-bold text-slate-900">User</h3>
                <p className="text-xs text-slate-500 mb-4">Employee</p>

                <div className="grid grid-cols-2 gap-2 text-center border-t border-slate-100 pt-3">
                  <div>
                    <div className="font-bold text-lg text-slate-900">3.4k</div>
                    <div className="text-xs text-slate-500">Karma</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-slate-900">
                      20/11
                    </div>
                    <div className="text-xs text-slate-500">Cake Day</div>
                  </div>
                </div>
                <Button
                  fullWidth
                  className="mt-4 text-xs h-8"
                  onClick={() => {
                    setProfileTargetId("me");
                    setView("profile");
                  }}
                >
                  Xem hồ sơ
                </Button>
              </div>
            </div>

            {/* Rules / Trending */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center">
                <Flame
                  size={16}
                  className="text-orange-500 mr-2"
                  fill="currentColor"
                />{" "}
                Chủ đề nóng 24h
              </h3>
              <ul className="space-y-4">
                {[].map((p: any, idx: number) => (
                  <li
                    key={p.id}
                    className="text-sm border-b border-slate-50 last:border-0 pb-2 last:pb-0"
                  >
                    <a
                      href="#"
                      className="font-bold text-slate-700 hover:text-brand-600 block line-clamp-2 mb-1"
                    >
                      {p.title}
                    </a>
                    <span className="text-xs text-slate-400">
                      {p.upvotes} upvotes • {p.commentCount} comments
                    </span>
                  </li>
                ))}
              </ul>
            </div>

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
      ) : selectedPost ? (
        <PostDetail
          post={selectedPost}
          onBack={() => setView("feed")}
          onUserClick={handleUserClick}
        />
      ) : null}
    </div>
  );
};
