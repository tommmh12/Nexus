import React, { useState, useRef, useEffect } from "react";
import { ForumCategory, Poll, ForumComment } from "../../../types";
import { forumService, ForumPost } from "../../../services/forumService";
import {
  Search,
  Plus,
  Bell,
  Calendar,
  MessageSquare,
  Share2,
  Eye,
  Pin,
  MoreHorizontal,
  ArrowLeft,
  Image as ImageIcon,
  Paperclip,
  BellRing,
  BarChart2,
  Bookmark,
  Flag,
  Filter,
  Flame,
  Clock,
  X,
  Tag,
  User,
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
  Smile,
  Indent,
  Outdent,
  Sparkles,
  FileImage,
  Save,
  ThumbsUp,
  Heart,
  Cake,
} from "lucide-react";
import { authService } from "../../../services/authService";
import { CommentThread } from "../../../components/comments/CommentThread";

// THEME - Teal colors for employee
const THEME = {
  bg: "bg-[#F8FAFC]",
  primary: "teal",
  primaryColor: "text-teal-600",
  primaryBg: "bg-teal-600",
  primaryLight: "bg-teal-50",
  primaryHover: "hover:bg-teal-700",
  buttonPrimary: "bg-slate-900 text-white hover:bg-slate-800",
};

// Helper function to strip HTML tags and markdown syntax for preview
const stripHtmlTags = (html: string): string => {
  let cleaned = html.replace(/!\[.*?\]\([^)]+\)/g, "");
  cleaned = cleaned.replace(/<img[^>]*>/gi, "");
  const doc = new DOMParser().parseFromString(cleaned, "text/html");
  return (doc.body.textContent || "").trim();
};

// Helper to extract first image from HTML/markdown content
const extractFirstImage = (html: string): string | null => {
  const htmlImgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlImgMatch) return htmlImgMatch[1];
  const mdImgMatch = html.match(/!\[.*?\]\(((?!data:)[^)]+)\)/);
  if (mdImgMatch) return mdImgMatch[1];
  const base64Match = html.match(/!\[.*?\]\((data:image\/[^)]+)\)/);
  if (base64Match) return base64Match[1];
  return null;
};

// Reaction types
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

// UserHoverCard component
const UserHoverCard = ({
  name,
  avatar,
  dept,
  children,
  onClick,
}: {
  name: string;
  avatar?: string;
  dept?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const [showCard, setShowCard] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const HOVER_DELAY = 3000;

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => setShowCard(true), HOVER_DELAY);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowCard(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showCard && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-4 bg-white rounded-xl shadow-xl border border-slate-200 z-50 w-64 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-3">
            <img
              src={
                avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  name
                )}&background=0d9488&color=fff`
              }
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="font-bold text-slate-900">{name}</div>
              {dept && <div className="text-xs text-slate-500">{dept}</div>}
            </div>
          </div>
          <button
            onClick={onClick}
            className="w-full px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Xem hồ sơ
          </button>
        </div>
      )}
    </div>
  );
};

// PostActions component - Facebook style with hover reactions
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
  commentCount?: number;
  onComment?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
  onReactionChange?: (
    reactions: Record<string, number>,
    userReaction: string | null
  ) => void;
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [localReactions, setLocalReactions] = useState(reactions);
  const [localUserReaction, setLocalUserReaction] = useState(userReaction);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const HOVER_DELAY = 500;

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

    const newReactions = { ...localReactions };
    let newUserReaction: string | null = null;

    if (localUserReaction === reactionType) {
      newReactions[reactionType] = Math.max(
        0,
        (newReactions[reactionType] || 0) - 1
      );
      newUserReaction = null;
    } else {
      if (localUserReaction) {
        newReactions[localUserReaction] = Math.max(
          0,
          (newReactions[localUserReaction] || 0) - 1
        );
      }
      newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
      newUserReaction = reactionType;
    }

    setLocalReactions(newReactions);
    setLocalUserReaction(newUserReaction);
    onReactionChange?.(newReactions, newUserReaction);

    try {
      if (newUserReaction) {
        await forumService.addReaction("post", postId, newUserReaction);
      } else {
        await forumService.removeReaction("post", postId);
      }
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  const currentReactionConfig = localUserReaction
    ? reactionConfig.find((r) => r.type === localUserReaction)
    : null;

  const totalReactions = Object.values(localReactions).reduce(
    (sum, count) => sum + count,
    0
  );
  const topReactions = reactionConfig
    .filter((r) => localReactions[r.type] > 0)
    .sort((a, b) => localReactions[b.type] - localReactions[a.type])
    .slice(0, 3);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {/* Reaction stats */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1 px-4 py-2 text-sm text-slate-500 border-b border-slate-100">
          <div className="flex -space-x-1">
            {topReactions.map((r) => (
              <span key={r.type} className="text-base">
                {r.emoji}
              </span>
            ))}
          </div>
          <span className="ml-1">{totalReactions} người đã bày tỏ cảm xúc</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center border-t border-slate-100">
        {/* Like button with hover picker */}
        <div
          className="flex-1 relative"
          onMouseEnter={() => {
            hoverTimeoutRef.current = setTimeout(
              () => setShowReactionPicker(true),
              HOVER_DELAY
            );
          }}
          onMouseLeave={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setTimeout(() => setShowReactionPicker(false), 300);
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
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white rounded-full shadow-xl border border-slate-200 flex items-center gap-1 z-50 animate-fadeIn"
              onMouseEnter={() => {
                if (hoverTimeoutRef.current)
                  clearTimeout(hoverTimeoutRef.current);
              }}
            >
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
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          <MessageSquare size={18} />
          <span>
            Bình luận{" "}
            {commentCount && commentCount > 0 ? `(${commentCount})` : ""}
          </span>
        </button>

        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          <Share2 size={18} />
          <span>Chia sẻ</span>
        </button>
      </div>
    </div>
  );
};

// CreatePostModal - Rich text editor like admin
const CreatePostModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [flairs, setFlairs] = useState({
    oc: false,
    spoiler: false,
    nsfw: false,
  });
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const API_BASE =
    (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await forumService.getCategories();
        setCategories(cats);
        if (cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
          setSelectedCategory(cats[0]);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryId) {
      const cat = categories.find((c) => c.id === categoryId);
      setSelectedCategory(cat || null);
    }
  }, [categoryId, categories]);

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
          setAttachedImages((prev) => [...prev, result.data.url]);
          if (contentEditableRef.current) {
            const img = document.createElement("img");
            img.src = result.data.url;
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

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết!");
      return;
    }

    if (!content.trim() && attachedImages.length === 0) {
      alert("Vui lòng nhập nội dung hoặc thêm ảnh!");
      return;
    }

    if (!categoryId) {
      alert("Vui lòng chọn chuyên mục!");
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

      await forumService.createPost({
        title: title.trim(),
        content: postContent,
        categoryId: categoryId,
        tags: Object.entries(flairs)
          .filter(([_, value]) => value)
          .map(([key]) => key.toUpperCase()),
      });

      alert("Đăng bài thành công!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error creating post:", error);
      alert(
        error.response?.data?.error || "Không thể đăng bài. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
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
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-8 flex flex-col overflow-y-auto">
          {/* Title */}
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
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-3 text-slate-500 flex-wrap">
            <button
              onClick={() => execCommand("bold")}
              className="p-1.5 hover:bg-slate-100 rounded"
              title="In đậm"
            >
              <Bold size={18} />
            </button>
            <button
              onClick={() => execCommand("italic")}
              className="p-1.5 hover:bg-slate-100 rounded"
              title="In nghiêng"
            >
              <Italic size={18} />
            </button>
            <button
              onClick={() => execCommand("underline")}
              className="p-1.5 hover:bg-slate-100 rounded"
              title="Gạch chân"
            >
              <Underline size={18} />
            </button>
            <button
              onClick={() => execCommand("strikeThrough")}
              className="p-1.5 hover:bg-slate-100 rounded"
              title="Gạch ngang"
            >
              <Strikethrough size={18} />
            </button>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <button
              onClick={() => execCommand("insertUnorderedList")}
              className="p-1.5 hover:bg-slate-100 rounded"
              title="Danh sách"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => execCommand("insertOrderedList")}
              className="p-1.5 hover:bg-slate-100 rounded"
              title="Danh sách số"
            >
              <ListOrdered size={18} />
            </button>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <button
              onClick={() => execCommand("justifyLeft")}
              className="p-1.5 hover:bg-slate-100 rounded"
              title="Căn trái"
            >
              <AlignLeft size={18} />
            </button>
            <button
              onClick={() => execCommand("justifyCenter")}
              className="p-1.5 hover:bg-slate-100 rounded"
              title="Căn giữa"
            >
              <AlignCenter size={18} />
            </button>
            <button
              onClick={() => execCommand("justifyRight")}
              className="p-1.5 hover:bg-slate-100 rounded"
              title="Căn phải"
            >
              <AlignRight size={18} />
            </button>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-1.5 hover:bg-slate-100 rounded"
              title="Thêm ảnh"
            >
              <FileImage size={18} />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Content Editor */}
          <div className="flex-1 min-h-[200px]">
            <div
              ref={contentEditableRef}
              contentEditable
              className="w-full flex-1 border-none focus:ring-0 resize-none px-0 text-slate-700 text-base leading-relaxed min-h-[200px] outline-none"
              style={{ minHeight: "200px" }}
              onInput={() => {
                if (contentEditableRef.current)
                  setContent(contentEditableRef.current.innerHTML);
              }}
              data-placeholder="Nhập nội dung bài viết..."
              suppressContentEditableWarning
            />
            <style>{`[contenteditable][data-placeholder]:empty:before { content: attr(data-placeholder); color: #94a3b8; pointer-events: none; }`}</style>
          </div>

          {/* Image preview */}
          {attachedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {attachedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    onClick={() =>
                      setAttachedImages((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Flairs */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-2">
            <button
              onClick={() => setFlairs({ ...flairs, oc: !flairs.oc })}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                flairs.oc
                  ? "bg-teal-100 border-teal-300 text-teal-700"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              + OC
            </button>
            <button
              onClick={() => setFlairs({ ...flairs, spoiler: !flairs.spoiler })}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                flairs.spoiler
                  ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              + Spoiler
            </button>
            <button
              onClick={() => setFlairs({ ...flairs, nsfw: !flairs.nsfw })}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                flairs.nsfw
                  ? "bg-red-100 border-red-300 text-red-700"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              + NSFW
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full font-medium shadow-sm transition-all disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!title.trim() || !categoryId || isSubmitting}
          >
            {isSubmitting ? "Đang đăng..." : "Đăng bài"}
          </button>
        </div>
      </div>
    </div>
  );
};

// PostDetail component
const PostDetail = ({
  post,
  onBack,
  reactions,
  userReaction,
  onReactionChange,
}: {
  post: ForumPost;
  onBack: () => void;
  reactions?: Record<string, number>;
  userReaction?: string | null;
  onReactionChange?: (
    reactions: Record<string, number>,
    userReaction: string | null
  ) => void;
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [localReactions, setLocalReactions] = useState<Record<string, number>>(
    reactions || { like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0 }
  );
  const [localUserReaction, setLocalUserReaction] = useState<string | null>(
    userReaction || null
  );
  const currentUser = authService.getStoredUser();

  useEffect(() => {
    if (reactions) setLocalReactions(reactions);
    setLocalUserReaction(userReaction || null);
  }, [reactions, userReaction]);

  const postImage = extractFirstImage(post.content);
  const textContent = stripHtmlTags(post.content);

  const handleReactionChange = (
    newReactions: Record<string, number>,
    newUserReaction: string | null
  ) => {
    setLocalReactions(newReactions);
    setLocalUserReaction(newUserReaction);
    onReactionChange?.(newReactions, newUserReaction);
  };

  return (
    <div className="animate-fadeIn w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md mb-4">
        {/* Header */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
            >
              <ArrowLeft size={18} /> Quay lại
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSubscribed(!isSubscribed)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isSubscribed
                    ? "bg-gray-100 text-gray-700"
                    : "bg-teal-50 text-teal-600 hover:bg-teal-100"
                }`}
              >
                {isSubscribed ? <BellRing size={16} /> : <Bell size={16} />}
                {isSubscribed ? "Đang theo dõi" : "Theo dõi"}
              </button>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2 rounded-md transition-colors ${
                  isSaved ? "text-teal-600" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Author */}
          <div className="flex items-start gap-3">
            <img
              src={
                post.authorAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  post.authorName
                )}&background=0d9488&color=fff`
              }
              alt=""
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-[15px]">
                {post.authorName}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>
                  {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>·</span>
                <Eye size={12} />
                <span>{post.viewCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h1>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-teal-600 text-sm hover:underline cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {textContent && (
            <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap mb-3">
              {textContent}
            </p>
          )}
        </div>

        {/* Image */}
        {postImage && (
          <div className="w-full">
            <img
              src={postImage}
              alt=""
              className="w-full max-h-[600px] object-contain bg-gray-100"
            />
          </div>
        )}

        {/* Actions */}
        <PostActions
          postId={post.id}
          reactions={localReactions}
          userReaction={localUserReaction}
          commentCount={post.commentCount || 0}
          onReactionChange={handleReactionChange}
        />

        {/* Comments */}
        <div className="p-4">
          <CommentThread
            type="forum_post"
            id={post.id}
            currentUserId={currentUser?.id}
            canComment={true}
          />
        </div>
      </div>
    </div>
  );
};

// Main ForumModule - Layout 9/3
export default function ForumModule() {
  const [view, setView] = useState<"feed" | "detail">("feed");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedSort, setFeedSort] = useState<"new" | "hot" | "saved">("new");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
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

  const currentUser = authService.getStoredUser();

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

        try {
          const hotData = await forumService.getHotTopics(5);
          setHotTopics(hotData);
        } catch (e) {
          console.log("Hot topics not available yet");
        }

        if (currentUser?.id) {
          try {
            const stats = await forumService.getUserForumStats(currentUser.id);
            setUserStats(stats);
          } catch (e) {
            console.log("User stats not available yet");
          }
        }

        const reactionsMap: Record<
          string,
          { reactions: Record<string, number>; userReaction: string | null }
        > = {};
        for (const post of postsData.slice(0, 20)) {
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

  const refreshPosts = async () => {
    try {
      const postsData = await forumService.getAllPosts({ status: "Approved" });
      setPosts(postsData);
    } catch (e) {
      console.error("Error refreshing posts:", e);
    }
  };

  let filteredPosts = [...posts];
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

  if (view === "detail" && selectedPost) {
    return (
      <div className={`min-h-screen ${THEME.bg} p-6`}>
        <PostDetail
          post={selectedPost}
          onBack={() => setView("feed")}
          reactions={postReactions[selectedPost.id]?.reactions}
          userReaction={postReactions[selectedPost.id]?.userReaction}
          onReactionChange={(newReactions, newUserReaction) => {
            setPostReactions((prev) => ({
              ...prev,
              [selectedPost.id]: {
                reactions: newReactions,
                userReaction: newUserReaction,
              },
            }));
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${THEME.bg} font-sans text-slate-800`}>
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={refreshPosts}
        />
      )}

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Main Content - 9 cols */}
        <div className="lg:col-span-9 px-6 py-5 space-y-4">
          {/* Search + Create */}
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
              <Search size={20} className="text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, hashtag..."
                className="flex-1 bg-transparent border-none outline-none text-sm py-2"
              />
              <button className="text-slate-500 h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                <Filter size={18} />
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
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
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="text-slate-500">Đang tải bài viết...</div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-slate-500">Chưa có bài viết nào.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post)}
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
                        <span>
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </span>
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
                      {stripHtmlTags(post.content)}
                    </p>
                  )}
                </div>

                {/* Image */}
                {extractFirstImage(post.content) && (
                  <div className="mt-2">
                    <img
                      src={extractFirstImage(post.content)!}
                      alt=""
                      className="w-full max-h-[500px] object-cover"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="px-4 py-2 border-t border-slate-100">
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
                    commentCount={post.commentCount}
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

        {/* Right Sidebar - 3 cols */}
        <div className="lg:col-span-3 pr-0 pl-4 py-5 bg-white/50 space-y-5 border-l border-slate-100">
          {/* User Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-teal-600 to-teal-500"></div>
            <div className="px-4 pb-4 -mt-8">
              <img
                src={
                  currentUser?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    currentUser?.full_name || "U"
                  )}&background=0d9488&color=fff`
                }
                alt={currentUser?.full_name || "User"}
                className="w-16 h-16 rounded-full border-4 border-white mb-2 object-cover bg-white"
              />
              <h3 className="font-bold text-slate-900">
                {currentUser?.full_name || "Người dùng"}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {currentUser?.position || "Nhân viên"}
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
                <MessageSquare size={18} className="mr-3" /> Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.id
                      ? "bg-teal-100 text-teal-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Tag size={18} className="mr-3" /> {cat.name}
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
                    onClick={() => handlePostClick(p)}
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

          {/* Footer */}
          <div className="text-xs text-slate-400 text-center px-4">
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
}
