import React, { useState, useEffect } from "react";
import {
  EmployeeProfile,
  ForumPost,
  ForumComment,
  ActivityLog,
} from "../../types";
// TODO: Replace with API call
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
import {
  User,
  Gift,
  Award,
  MessageSquare,
  Edit2,
  Save,
  Camera,
  Github,
  Linkedin,
  Facebook,
  Clock,
  FileText,
  ArrowRight,
  Activity,
  Shield,
  Mail,
  Lock,
  MoreHorizontal,
} from "lucide-react";

interface UserProfileProps {
  userId: string; // 'me' or specific user ID
  onBack: () => void;
}

// --- Mock Profile Stats Helper ---
const getProfileStats = (userId: string) => {
  // In a real app, calculate from DB. Here we mock based on userId seed
  const isMe = userId === "me";
  return {
    posts: isMe ? 12 : 45,
    comments: isMe ? 156 : 320,
    upvotes: isMe ? 1204 : 5600,
    featured: isMe ? 2 : 5,
    cakeDay: "20/11/2023",
    karma: isMe ? 1250 : 3400,
  };
};

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onBack }) => {
  // Determine if we are viewing "My Profile" or someone else's
  // For demo purposes, we assume 'u001' is the logged in user if userId is 'me'
  const targetId = userId === "me" ? "u001" : userId;
  const isMe = userId === "me" || targetId === "u001";

  const userProfile: any = {
    // TODO: Fetch from API
    id: targetId,
    fullName: "User",
    email: "user@nexus.com",
    avatarUrl: "/avatar-placeholder.png",
    department: "N/A",
    position: "Employee",
    status: "Active",
  };
  const stats = getProfileStats(userId);

  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "activity">(
    "posts"
  );
  const [isEditing, setIsEditing] = useState(false);

  // --- Data Filtering ---
  const userPosts: any[] = []; // TODO: Fetch from API
  const userActivities: any[] = []; // TODO: Fetch from API

  // Mock comments since they are nested in posts in the data structure
  const mockUserComments = [
    {
      id: "c1",
      content: "Bài viết rất hữu ích, cảm ơn bạn đã chia sẻ!",
      postTitle: "Quy trình Onboarding mới",
      time: "2 giờ trước",
      upvotes: 5,
    },
    {
      id: "c2",
      content: "Mình nghĩ nên bổ sung thêm phần Unit Test.",
      postTitle: "Thảo luận Tech Stack",
      time: "1 ngày trước",
      upvotes: 12,
    },
    {
      id: "c3",
      content: "Đồng ý với quan điểm của anh Nam.",
      postTitle: "Kế hoạch Year End Party",
      time: "3 ngày trước",
      upvotes: 2,
    },
  ];

  // --- Edit Mode State ---
  const [editForm, setEditForm] = useState({
    fullName: userProfile.fullName,
    position: userProfile.position,
    department: userProfile.department,
    bio: "Yêu công nghệ, thích leo núi và code dạo.",
    email: userProfile.email,
    phone: userProfile.phone,
    github: "github.com/user",
    linkedin: "linkedin.com/in/user",
  });

  // Update form when profile changes (crucial for viewing different users)
  useEffect(() => {
    setEditForm({
      fullName: userProfile.fullName,
      position: userProfile.position,
      department: userProfile.department,
      bio: "Yêu công nghệ, thích leo núi và code dạo.", // Reset to mock default for new user
      email: userProfile.email,
      phone: userProfile.phone,
      github: "github.com/user",
      linkedin: "linkedin.com/in/user",
    });
    setIsEditing(false);
    setActiveTab("posts");
  }, [userProfile.id]);

  const handleSaveProfile = () => {
    // API call to save profile
    alert("Cập nhật hồ sơ thành công!");
    setIsEditing(false);
  };

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto pb-10">
      {/* Top Navigation */}
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="text-xs h-9">
          <ArrowRight size={16} className="mr-2 rotate-180" /> Quay lại
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: MAIN CONTENT (Feed) */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "posts"
                    ? "border-brand-600 text-brand-600 bg-slate-50"
                    : "border-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                <FileText size={18} /> Bài viết{" "}
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-1">
                  {userPosts.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "comments"
                    ? "border-brand-600 text-brand-600 bg-slate-50"
                    : "border-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                <MessageSquare size={18} /> Bình luận{" "}
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-1">
                  {stats.comments}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "activity"
                    ? "border-brand-600 text-brand-600 bg-slate-50"
                    : "border-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Activity size={18} /> Hoạt động
              </button>
            </div>

            <div className="p-6">
              {/* POSTS TAB */}
              {activeTab === "posts" && (
                <div className="space-y-4">
                  {userPosts.length > 0 ? (
                    userPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 border border-slate-200 rounded-lg hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer bg-white group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded">
                            {post.categoryId}
                          </span>
                          <span className="text-xs text-slate-400">
                            {post.timestamp}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <ArrowRight
                              size={16}
                              className="-rotate-90 text-orange-500"
                            />{" "}
                            {post.upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={16} /> {post.commentCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} /> {post.viewCount} views
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400">
                      <FileText size={48} className="mx-auto mb-3 opacity-20" />
                      <p>Chưa có bài viết nào.</p>
                    </div>
                  )}
                </div>
              )}

              {/* COMMENTS TAB */}
              {activeTab === "comments" && (
                <div className="space-y-4">
                  {mockUserComments.map((comment, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div className="mb-2 text-sm text-slate-500">
                        Đã bình luận trong bài{" "}
                        <span className="font-semibold text-brand-600 cursor-pointer hover:underline">
                          {comment.postTitle}
                        </span>
                      </div>
                      <p className="text-slate-800 text-sm italic mb-2">
                        "{comment.content}"
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{comment.time}</span>
                        <span>•</span>
                        <span className="text-orange-600 font-medium">
                          {comment.upvotes} upvotes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ACTIVITY TAB */}
              {activeTab === "activity" && (
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
                  {userActivities.length > 0 ? (
                    userActivities.map((act) => (
                      <div key={act.id} className="relative">
                        <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-white border-2 border-brand-200 flex items-center justify-center">
                          <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-900">
                            <span className="font-semibold">{act.content}</span>
                            {act.target && (
                              <span className="text-slate-500">
                                {" "}
                                - "{act.target}"
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {act.timestamp}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      Chưa có hoạt động nào được ghi nhận gần đây.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROFILE CARD (Sidebar) */}
        <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
          {/* User Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
            {/* Cover Image */}
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
              {isMe && isEditing && (
                <button className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
                  <Camera size={16} />
                </button>
              )}
            </div>

            <div className="px-6 pb-6 relative">
              {/* Avatar */}
              <div className="absolute -top-12 left-6">
                <div className="relative">
                  <img
                    src={userProfile.avatarUrl}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white object-cover"
                    alt=""
                  />
                  {isMe && isEditing && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                      <Camera size={24} />
                    </div>
                  )}
                  <span
                    className={`absolute bottom-1 right-1 w-4 h-4 border-2 border-white rounded-full ${
                      userProfile.status === "Active"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></span>
                </div>
              </div>

              {/* Actions (Top Right) */}
              <div className="flex justify-end pt-3 mb-4">
                {isMe ? (
                  isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                        className="h-8 text-xs text-red-600 hover:bg-red-50"
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        className="h-8 text-xs"
                      >
                        <Save size={14} className="mr-1" /> Lưu
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-8 text-xs"
                    >
                      <Edit2 size={14} className="mr-1" /> Chỉnh sửa
                    </Button>
                  )
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 text-xs bg-brand-100 text-brand-700 hover:bg-brand-200"
                    >
                      <MessageSquare size={14} className="mr-1" /> Nhắn tin
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Info Fields */}
              <div className="mt-6 space-y-4">
                <div>
                  {isEditing ? (
                    <Input
                      label="Họ tên"
                      value={editForm.fullName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, fullName: e.target.value })
                      }
                      className="font-bold text-lg"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-slate-900">
                      {userProfile.fullName}
                    </h2>
                  )}

                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2 w-full mt-2">
                        <Input
                          label="Chức danh"
                          value={editForm.position}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              position: e.target.value,
                            })
                          }
                        />
                        <Input
                          label="Phòng ban"
                          value={editForm.department}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              department: e.target.value,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <>
                        <span>{userProfile.position}</span>
                        <span>•</span>
                        <span className="text-brand-600 font-medium">
                          {userProfile.department}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Karma & Role Badges */}
                {!isEditing && (
                  <div className="flex gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                      <Award size={14} /> {stats.karma} Karma
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                      <User size={14} /> {userProfile.role}
                    </span>
                    {userProfile.role === "Admin" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                        <Shield size={14} /> Mod
                      </span>
                    )}
                  </div>
                )}

                {/* Bio */}
                <div className="text-sm text-slate-600">
                  {isEditing ? (
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">
                        Giới thiệu (Bio)
                      </label>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        value={editForm.bio}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bio: e.target.value })
                        }
                      />
                    </div>
                  ) : (
                    <p className="italic">"{editForm.bio}"</p>
                  )}
                </div>

                {/* Contact & Socials */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Gift size={16} className="text-pink-500" />
                    <span>
                      Cake Day:{" "}
                      <span className="font-medium text-slate-900">
                        {stats.cakeDay}
                      </span>
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <Input
                        icon={<Mail size={14} />}
                        label="Email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                      />
                      <Input
                        icon={<Github size={14} />}
                        label="GitHub"
                        value={editForm.github}
                        onChange={(e) =>
                          setEditForm({ ...editForm, github: e.target.value })
                        }
                      />
                      <Input
                        icon={<Linkedin size={14} />}
                        label="LinkedIn"
                        value={editForm.linkedin}
                        onChange={(e) =>
                          setEditForm({ ...editForm, linkedin: e.target.value })
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Mail size={16} className="text-slate-400" />
                        <a
                          href={`mailto:${userProfile.email}`}
                          className="hover:text-brand-600 hover:underline"
                        >
                          {userProfile.email}
                        </a>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <a
                          href="#"
                          className="text-slate-400 hover:text-slate-800"
                        >
                          <Github size={18} />
                        </a>
                        <a
                          href="#"
                          className="text-slate-400 hover:text-blue-700"
                        >
                          <Linkedin size={18} />
                        </a>
                        <a
                          href="#"
                          className="text-slate-400 hover:text-blue-600"
                        >
                          <Facebook size={18} />
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="block text-2xl font-bold text-slate-900">
                {stats.posts}
              </span>
              <span className="text-xs text-slate-500 uppercase font-bold">
                Bài viết
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="block text-2xl font-bold text-slate-900">
                {stats.upvotes}
              </span>
              <span className="text-xs text-slate-500 uppercase font-bold">
                Upvotes
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="block text-2xl font-bold text-brand-600">
                {stats.featured}
              </span>
              <span className="text-xs text-slate-500 uppercase font-bold">
                Bài nổi bật
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="block text-2xl font-bold text-slate-900">
                {stats.comments}
              </span>
              <span className="text-xs text-slate-500 uppercase font-bold">
                Bình luận
              </span>
            </div>
          </div>

          {/* Settings (Only for Me) */}
          {isMe && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold text-slate-900 text-sm">
                Cài đặt cá nhân
              </div>
              <div className="p-2">
                <button className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-3 transition-colors">
                  <Lock size={16} /> Đổi mật khẩu
                </button>
                <button className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-3 transition-colors">
                  <Activity size={16} /> Thiết lập thông báo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
