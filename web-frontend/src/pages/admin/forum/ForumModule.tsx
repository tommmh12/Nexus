import React, { useState, useRef, useEffect } from "react";
import { ForumCategory, Poll, ForumComment } from "../../../types";
import { forumService, ForumPost } from "../../../services/forumService";
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
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
  Heart,
  Meh,
  Frown,
  Cake,
} from "lucide-react";
import { UserProfile } from "./UserProfile";
import { authService } from "../../../services/authService";
import { CommentThread } from "../../../components/comments/CommentThread";

// Reaction types
type ReactionType = "like" | "love" | "laugh" | "wow" | "sad" | "angry";

const reactionConfig: { type: ReactionType; icon: React.ReactNode; emoji: string; label: string; color: string }[] = [
  { type: "like", icon: <ThumbsUp size={16} />, emoji: "👍", label: "Thích", color: "text-blue-500" },
  { type: "love", icon: <Heart size={16} />, emoji: "❤️", label: "Yêu thích", color: "text-red-500" },
  { type: "laugh", icon: <Smile size={16} />, emoji: "😂", label: "Haha", color: "text-yellow-500" },
  { type: "wow", icon: <AlertTriangle size={16} />, emoji: "😮", label: "Wow", color: "text-orange-500" },
  { type: "sad", icon: <Frown size={16} />, emoji: "😢", label: "Buồn", color: "text-purple-500" },
  { type: "angry", icon: <Meh size={16} />, emoji: "😠", label: "Phẫn nộ", color: "text-red-700" },
];

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
  onReactionChange?: (reactions: Record<string, number>, userReaction: string | null) => void;
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [localReactions, setLocalReactions] = useState<Record<string, number>>(reactions);
  const [localUserReaction, setLocalUserReaction] = useState<string | null>(userReaction);
  const pickerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalReactions(reactions);
    setLocalUserReaction(userReaction);
  }, [reactions, userReaction]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowReactionPicker(false);
      }
    };

    if (showReactionPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReactionPicker]);

  const handleReact = async (e: React.MouseEvent, reactionType: ReactionType) => {
    e.stopPropagation();
    setShowReactionPicker(false);

    try {
      const result = await forumService.toggleReaction("post", postId, reactionType);
      setLocalReactions(result.reactions);
      setLocalUserReaction(result.reacted ? reactionType : null);
      onReactionChange?.(result.reactions, result.reacted ? reactionType : null);
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  };

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const totalReactions = Object.values(localReactions).reduce((sum, count) => sum + count, 0);
  
  // Get top 3 reactions for display
  const topReactions = reactionConfig
    .filter((r) => localReactions[r.type] > 0)
    .sort((a, b) => localReactions[b.type] - localReactions[a.type])
    .slice(0, 3);

  const currentReactionConfig = localUserReaction 
    ? reactionConfig.find((r) => r.type === localUserReaction) 
    : null;

  return (
    <div className="border-t border-slate-100 pt-3 mt-3">
      {/* Reaction summary */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
          <div className="flex -space-x-1">
            {topReactions.map((r) => (
              <span key={r.type} className="text-base">{r.emoji}</span>
            ))}
          </div>
          <span>{totalReactions} người đã bày tỏ cảm xúc</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <div className="relative flex-1" ref={pickerRef}>
          <button
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
                ? `${currentReactionConfig?.color} bg-blue-50`
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

          {/* Reaction picker popup */}
          {showReactionPicker && (
            <div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white rounded-full shadow-xl border border-slate-200 flex items-center gap-1 z-50 animate-fadeIn"
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current);
                }
              }}
            >
              {reactionConfig.map((config) => (
                <button
                  key={config.type}
                  onClick={(e) => handleReact(e, config.type)}
                  className={`p-2 rounded-full hover:bg-slate-100 hover:scale-125 transition-all ${
                    localUserReaction === config.type ? "bg-slate-100 scale-110" : ""
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
              className={`relative border rounded-lg overflow-hidden h-10 flex items-center px-4 cursor-pointer transition-all ${votedOption === opt.id
                ? "border-brand-500 ring-1 ring-brand-500"
                : "border-slate-300 hover:border-brand-400"
                }`}
            >
              {/* Progress Bar Background */}
              <div
                className={`absolute top-0 left-0 h-full transition-all duration-1000 ${votedOption === opt.id ? "bg-brand-100" : "bg-slate-200"
                  }`}
                style={{ width: votedOption ? `${percent}%` : "0%" }}
              ></div>

              {/* Text Content */}
              <div className="relative z-10 flex justify-between w-full text-sm">
                <span
                  className={`font-medium ${votedOption === opt.id ? "text-brand-800" : "text-slate-700"
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

// --- REDESIGNED: Create Post Modal (Unified Editor) ---
const CreatePostModal = ({ onClose }: { onClose: () => void }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [flairs, setFlairs] = useState({
    oc: false,
    spoiler: false,
    nsfw: false,
  });
  const [activeAttachment, setActiveAttachment] = useState<null | "image" | "poll">(null);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isDraft, setIsDraft] = useState(false);

  // Poll state
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDuration, setPollDuration] = useState(7);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await forumService.getCategories();
        setCategories(cats);
        // Auto-select first category if available and no category selected
        if (cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
          setSelectedCategory(cats[0]);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update selected category when categoryId changes
  useEffect(() => {
    if (categoryId) {
      const cat = categories.find((c) => c.id === categoryId);
      setSelectedCategory(cat || null);
    }
  }, [categoryId, categories]);

  // Rich text editor functions
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (contentEditableRef.current) {
      setContent(contentEditableRef.current.innerHTML);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (event: ProgressEvent<FileReader>) => {
            const imageUrl = event.target?.result as string;
            if (imageUrl) {
              setAttachedImages((prev) => [...prev, imageUrl]);
              // Insert image into editor
              if (contentEditableRef.current) {
                const img = document.createElement("img");
                img.src = imageUrl;
                img.className = "max-w-full h-auto rounded-lg my-2";
                contentEditableRef.current.appendChild(img);
                setContent(contentEditableRef.current.innerHTML);
              }
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const handleInsertLink = () => {
    const linkText = prompt("Nhập text cho liên kết:");
    if (!linkText) return;

    const linkUrl = prompt("Nhập URL:");
    if (!linkUrl) return;

    const markdownLink = `[${linkText}](${linkUrl})`;

    if (contentEditableRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(markdownLink);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        document.execCommand("insertText", false, markdownLink);
      }
      setContent(contentEditableRef.current.innerHTML);
    }
  };

  const handleToggleImageAttachment = () => {
    setActiveAttachment(activeAttachment === "image" ? null : "image");
  };

  const handleTogglePollAttachment = () => {
    setActiveAttachment(activeAttachment === "poll" ? null : "poll");
  };

  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSaveDraft = async () => {
    // TODO: Implement save draft functionality
    setIsDraft(true);
    alert("Đã lưu bản nháp!");
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết!");
      return;
    }

    if (!content.trim() && attachedImages.length === 0 && !pollQuestion) {
      alert("Vui lòng nhập nội dung, thêm ảnh hoặc tạo thăm dò!");
      return;
    }

    if (!categoryId) {
      alert("Vui lòng chọn chuyên mục!");
      return;
    }

    if (activeAttachment === "poll" && (!pollQuestion || pollOptions.filter(o => o.trim()).length < 2)) {
      alert("Vui lòng nhập câu hỏi và ít nhất 2 lựa chọn cho thăm dò!");
      return;
    }

    try {
      // Get plain text from contentEditable
      let postContent = contentEditableRef.current?.innerText || content;

      // Add images to content if any
      if (attachedImages.length > 0) {
        const imageMarkdown = attachedImages.map((img) => `![Image](${img})`).join("\n");
        postContent = postContent ? `${postContent}\n\n${imageMarkdown}` : imageMarkdown;
      }

      // Add poll to content if exists
      if (activeAttachment === "poll" && pollQuestion) {
        const pollMarkdown = `\n\n**Thăm dò: ${pollQuestion}**\n${pollOptions.filter(o => o.trim()).map((opt, idx) => `${idx + 1}. ${opt}`).join("\n")}`;
        postContent = postContent ? `${postContent}${pollMarkdown}` : pollMarkdown;
      }

      await forumService.createPost({
        title: title.trim(),
        content: postContent,
        categoryId: categoryId,
        tags: Object.entries(flairs)
          .filter(([_, value]) => value)
          .map(([key]) => key.toUpperCase()),
      });

      alert("Đăng bài thành công!");
      onClose();
    } catch (error: any) {
      console.error("Error creating post:", error);
      alert(error.response?.data?.error || "Không thể đăng bài. Vui lòng thử lại.");
    }
  };

  const emojis = ["😀", "😂", "😍", "🤔", "👍", "❤️", "🔥", "💯", "🎉", "✨", "👏", "🙌"];

  // Close emoji picker and font size menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker || showFontSizeMenu) {
        setShowEmojiPicker(false);
        setShowFontSizeMenu(false);
      }
    };
    if (showEmojiPicker || showFontSizeMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showEmojiPicker, showFontSizeMenu]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
        {/* Header - Reddit Style */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">r</span>
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
        <div className="flex-1 p-8 flex flex-col overflow-y-auto">
          {/* Title Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                placeholder="Tiêu đề bài viết..."
                className="flex-1 text-2xl font-bold text-slate-800 placeholder:text-slate-400 border-none focus:ring-0 px-0 outline-none pr-4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={300}
                autoFocus
              />
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${title.length > 250 ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-500"
                }`}>
                {title.length}/300
              </span>
            </div>
          </div>

          {/* Unified Toolbar - Moved above editor */}
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-3 text-slate-500 flex-wrap">
            <button
              onClick={() => execCommand("bold")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="In đậm"
            >
              <Bold size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("italic")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="In nghiêng"
            >
              <Italic size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("underline")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Gạch chân"
            >
              <Underline size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("strikeThrough")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Gạch ngang"
            >
              <Strikethrough size={18} strokeWidth={2.5} />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button
              onClick={() => execCommand("insertUnorderedList")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Danh sách"
            >
              <List size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("insertOrderedList")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Danh sách đánh số"
            >
              <ListOrdered size={18} strokeWidth={2.5} />
            </button>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <button
              onClick={() => execCommand("justifyLeft")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Căn trái"
            >
              <AlignLeft size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("justifyCenter")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Căn giữa"
            >
              <AlignCenter size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("justifyRight")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Căn phải"
            >
              <AlignRight size={18} strokeWidth={2.5} />
            </button>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <button
              onClick={() => execCommand("outdent")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Thụt ra"
            >
              <Outdent size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("indent")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Thụt vào"
            >
              <Indent size={18} strokeWidth={2.5} />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <div className="relative">
              <button
                onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors flex items-center"
                title="Kích cỡ chữ"
              >
                <span className="text-sm font-bold">Aa</span>
              </button>
              {showFontSizeMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 p-2">
                  {["12px", "14px", "16px", "18px", "20px", "24px"].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        execCommand("fontSize", "7");
                        document.execCommand("fontSize", false, size);
                        setShowFontSizeMenu(false);
                      }}
                      className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 rounded"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const color = prompt("Nhập mã màu (ví dụ: #FF0000):");
                if (color) execCommand("foreColor", color);
              }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Màu chữ"
            >
              <Type
                size={18}
                strokeWidth={2.5}
                className="text-slate-800 underline decoration-slate-400"
              />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button
              onClick={handleInsertLink}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Chèn liên kết"
            >
              <Link size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => execCommand("formatBlock", "pre")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Code"
            >
              <Code size={18} strokeWidth={2.5} />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            {/* Image Button */}
            <button
              onClick={handleToggleImageAttachment}
              className={`p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors ${activeAttachment === "image" ? "bg-slate-200" : ""
                }`}
              title="Thêm hình ảnh"
            >
              <FileImage size={18} strokeWidth={2.5} />
            </button>

            {/* Video Button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Thêm video"
            >
              <ImageIcon size={18} strokeWidth={2.5} />
            </button>

            {/* Poll Button */}
            <button
              onClick={handleTogglePollAttachment}
              className={`p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors ${activeAttachment === "poll" ? "bg-slate-200" : ""
                }`}
              title="Tạo thăm dò"
            >
              <BarChart2 size={18} strokeWidth={2.5} />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors">
              <MoreHorizontal size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Content Input - Rich Text Editor */}
          <div className="flex-1 min-h-[200px]">
            <div
              ref={contentEditableRef}
              contentEditable
              className="w-full flex-1 border-none focus:ring-0 resize-none px-0 text-slate-700 text-base leading-relaxed min-h-[200px] outline-none"
              style={{ minHeight: "200px" }}
              onInput={(e) => {
                if (contentEditableRef.current) {
                  setContent(contentEditableRef.current.innerHTML);
                }
              }}
              data-placeholder="Nhập tin nhắn"
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

          {/* Dynamic Attachment Sections */}

          {/* Image Attachment Section */}
          {activeAttachment === "image" && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Thêm hình ảnh</h3>
                <button
                  onClick={() => setActiveAttachment(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-brand-500 transition-colors">
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 w-full"
                >
                  <FileImage size={48} className="text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Kéo thả hình ảnh vào đây</p>
                    <p className="text-xs text-slate-500 mt-1">hoặc click để chọn tệp</p>
                  </div>
                </button>
              </div>
              {attachedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {attachedImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                      <button
                        onClick={() => setAttachedImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Poll Attachment Section */}
          {activeAttachment === "poll" && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Tạo thăm dò</h3>
                <button
                  onClick={() => setActiveAttachment(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Câu hỏi thăm dò <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Nhập câu hỏi..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Các lựa chọn <span className="text-red-500">*</span> (tối thiểu 2)
                  </label>
                  <div className="space-y-2">
                    {pollOptions.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                          placeholder={`Lựa chọn ${idx + 1}`}
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            onClick={() => handleRemovePollOption(idx)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa lựa chọn"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={handleAddPollOption}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Thêm lựa chọn
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Thời gian kết thúc (ngày)
                  </label>
                  <input
                    type="number"
                    value={pollDuration}
                    onChange={(e) => setPollDuration(parseInt(e.target.value) || 7)}
                    min={1}
                    max={30}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Attached Files Preview (for videos) */}
          {attachedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <Paperclip size={16} className="text-slate-500" />
                  <span className="text-sm text-slate-700 flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                  <button
                    onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Xóa"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Flair Options */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-2">
            <button
              onClick={() => setFlairs({ ...flairs, oc: !flairs.oc })}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${flairs.oc
                ? "bg-orange-100 border-orange-300 text-orange-700"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
            >
              + OC
            </button>
            <button
              onClick={() => setFlairs({ ...flairs, spoiler: !flairs.spoiler })}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${flairs.spoiler
                ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
            >
              + Spoiler
            </button>
            <button
              onClick={() => setFlairs({ ...flairs, nsfw: !flairs.nsfw })}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${flairs.nsfw
                ? "bg-red-100 border-red-300 text-red-700"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
            >
              + NSFW
            </button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-full border bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 transition-colors">
              <Sparkles size={12} className="inline mr-1" />
              Flair
            </button>
          </div>
        </div>

        {/* Footer - Reddit Style */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Save size={16} className="mr-2" />
            Lưu bản nháp
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 h-9 rounded-full font-medium shadow-sm transition-all"
            onClick={handleSubmit}
            disabled={!title.trim() || !categoryId}
          >
            Đăng tin
          </Button>
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const currentUser = authService.getStoredUser();

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      {/* Main Content Only - Centered Reading Experience */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible mb-6">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="h-9 px-3 mr-4 border-slate-300 text-slate-600"
            >
              <ArrowLeft size={16} className="mr-2" /> Quay lại
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant={isSubscribed ? "secondary" : "outline"}
                onClick={() => setIsSubscribed(!isSubscribed)}
                className={`text-xs h-8 px-3 ${isSubscribed ? "bg-slate-100 text-slate-700" : ""
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
                className={`h-8 w-8 p-0 ${isSaved ? "text-brand-600" : "text-slate-400"
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

          {/* Author Header */}
          <div className="flex items-center gap-3 mb-6">
            <UserHoverCard
              name={post.authorName}
              avatar={post.authorAvatar}
              dept={undefined}
              onClick={() => onUserClick(post.authorName)}
            >
              <img
                src={post.authorAvatar}
                alt=""
                className="w-12 h-12 rounded-full border border-slate-100"
              />
            </UserHoverCard>
            <div>
              <UserHoverCard
                name={post.authorName}
                avatar={post.authorAvatar}
                dept={undefined}
                onClick={() => onUserClick(post.authorName)}
              >
                <h3 className="text-base font-bold text-slate-900 hover:underline cursor-pointer">
                  {post.authorName}
                </h3>
              </UserHoverCard>
              <p className="text-sm text-slate-500">
                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md mr-2 mb-6"
            >
              #{tag}
            </span>
          ))}

          <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed mb-8">
            {post.content}
          </div>

          {/* TODO: Implement poll display */}

          {/* Footer Actions */}
          <PostActions
            upvotes={post.upvoteCount || 0}
            commentCount={post.commentCount}
            isLiked={false}
            onLike={() => { }}
            onComment={() => { }}
            onShare={() => { }}
          />
        </div>
      </div>

      {/* Comment Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <MessageSquare size={20} /> Thảo luận ({post.commentCount})
        </h3>

        <CommentThread
          type="forum_post"
          id={post.id}
          currentUserId={currentUser?.id}
          canComment={true}
        />
      </div>
    </div>
  );
};

// ... ForumManager Code (Admin) Omitted for brevity as it's not the target of this change ...
// ForumManager exported from separate file

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
  const [hotTopics, setHotTopics] = useState<ForumPost[]>([]);
  const [userStats, setUserStats] = useState<{
    postCount: number;
    commentCount: number;
    karmaPoints: number;
    joinDate: Date | null;
  } | null>(null);
  const [postReactions, setPostReactions] = useState<Record<string, { reactions: Record<string, number>; userReaction: string | null }>>({});

  const currentUser = authService.getStoredUser();

  // Load approved posts, categories, hot topics, and user stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [postsData, categoriesData] = await Promise.all([
          forumService.getAllPosts({ status: "Approved" }),
          forumService.getCategories(),
        ]);
        setPosts(postsData);
        setCategories(categoriesData);

        // Load hot topics
        try {
          const hotData = await forumService.getHotTopics(5);
          setHotTopics(hotData);
        } catch (e) {
          console.log("Hot topics not available yet");
        }

        // Load user stats
        if (currentUser?.id) {
          try {
            const stats = await forumService.getUserForumStats(currentUser.id);
            setUserStats(stats);
          } catch (e) {
            console.log("User stats not available yet");
          }
        }

        // Load reactions for each post
        const reactionsMap: Record<string, { reactions: Record<string, number>; userReaction: string | null }> = {};
        for (const post of postsData.slice(0, 20)) {
          try {
            const reactionData = await forumService.getReactions("post", post.id);
            reactionsMap[post.id] = reactionData;
          } catch (e) {
            reactionsMap[post.id] = { 
              reactions: { like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0 },
              userReaction: null 
            };
          }
        }
        setPostReactions(reactionsMap);
      } catch (error) {
        console.error("Error loading forum data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentUser?.id]);

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
                <button
                  onClick={() => setFeedSort("saved")}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${feedSort === "saved"
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === "all"
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat.id
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
                          {post.categoryName || "Chưa phân loại"}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          • Đăng bởi
                          <UserHoverCard
                            name={post.authorName}
                            avatar={post.authorAvatar}
                            dept={undefined}
                            onClick={() => handleUserClick(post.authorName)}
                          >
                            <span className="font-medium text-slate-600 hover:text-brand-600 hover:underline">
                              {post.authorName}
                            </span>
                          </UserHoverCard>
                          • {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-brand-600 transition-colors">
                      {post.title}
                    </h2>

                    {post.tags && post.tags.length > 0 && (
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
                    )}

                    {/* Preview Content (truncated) */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {post.content}
                    </p>

                    {/* TODO: Implement poll display */}

                    <PostActions
                      postId={post.id}
                      reactions={postReactions[post.id]?.reactions || { like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0 }}
                      userReaction={postReactions[post.id]?.userReaction || null}
                      commentCount={post.commentCount}
                      onComment={(e) => { e.stopPropagation(); }}
                      onShare={(e) => { e.stopPropagation(); }}
                      onReactionChange={(reactions, userReaction) => {
                        setPostReactions(prev => ({
                          ...prev,
                          [post.id]: { reactions, userReaction }
                        }));
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Sidebar: Profile & Trending */}
          <div className="lg:col-span-3 space-y-6">
            {/* User Karma Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-brand-600 to-brand-500"></div>
              <div className="px-4 pb-4 -mt-8">
                <img
                  src={currentUser?.avatar_url || "/avatar-placeholder.png"}
                  alt={currentUser?.full_name || "User"}
                  className="w-16 h-16 rounded-full border-4 border-white mb-2 object-cover bg-white"
                />
                <h3 className="font-bold text-slate-900">{currentUser?.full_name || "Người dùng"}</h3>
                <p className="text-xs text-slate-500 mb-4">{currentUser?.position || "Nhân viên"}</p>

                <div className="grid grid-cols-2 gap-2 text-center border-t border-slate-100 pt-3">
                  <div>
                    <div className="font-bold text-lg text-brand-600">
                      {userStats?.karmaPoints 
                        ? userStats.karmaPoints >= 1000 
                          ? `${(userStats.karmaPoints / 1000).toFixed(1)}k`
                          : userStats.karmaPoints
                        : "0"}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                      <Sparkles size={12} className="text-amber-500" />
                      Karma
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-slate-900">
                      {userStats?.joinDate 
                        ? new Date(userStats.joinDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
                        : "--/--"}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                      <Cake size={12} className="text-pink-500" />
                      Cake Day
                    </div>
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
                  <span>{userStats?.postCount || 0} bài viết</span>
                  <span>•</span>
                  <span>{userStats?.commentCount || 0} bình luận</span>
                </div>

                <Button
                  fullWidth
                  className="mt-4 text-xs h-8"
                  onClick={() => {
                    setProfileTargetId("me");
                    setView("profile");
                  }}
                >
                  <User size={14} className="mr-1" />
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
              {hotTopics.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Chưa có chủ đề nóng</p>
              ) : (
                <ul className="space-y-4">
                  {hotTopics.map((p, idx) => (
                    <li
                      key={p.id}
                      onClick={() => handlePostClick(p)}
                      className="text-sm border-b border-slate-50 last:border-0 pb-2 last:pb-0 cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-orange-500 bg-orange-50 rounded px-1.5 py-0.5">
                          #{idx + 1}
                        </span>
                        <div className="flex-1">
                          <span className="font-bold text-slate-700 hover:text-brand-600 block line-clamp-2 mb-1">
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
