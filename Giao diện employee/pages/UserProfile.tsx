
import React, { useState, useEffect } from "react";
import {
  EmployeeProfile,
  ForumPost,
  ForumComment,
  ActivityLog,
} from "../types";
import { Button } from "../components/system/ui/Button";
import { Input } from "../components/system/ui/Input";
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
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10 px-4 sm:px-6 lg:px-8 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* --- MAIN COLUMN (Left, 8 cols) --- */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. PROFILE HEADER CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
            {/* Cover Image */}
            <div className={`h-48 relative bg-gradient-to-r from-blue-700 to-cyan-600 ${isEditing ? 'group cursor-pointer' : ''}`}>
              {isMe && isEditing && (
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                  <span className="bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
                    <Camera size={16} /> Cập nhật ảnh bìa
                  </span>
                </div>
              )}
              {/* Back Button (Absolute Top Left) */}
              <button
                onClick={onBack}
                className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10"
              >
                <ArrowRight size={20} className="rotate-180" />
              </button>
            </div>

            {/* Profile Info Area */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-start justify-between relative -mt-16 mb-4">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={userProfile.avatarUrl}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white object-cover"
                    alt=""
                  />
                  {isMe && isEditing && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity rounded-full z-10">
                      <Camera size={24} />
                    </div>
                  )}
                  <span className={`absolute bottom-2 right-2 w-5 h-5 border-2 border-white rounded-full ${userProfile.status === "Active" ? "bg-green-500" : "bg-slate-400"}`}></span>
                </div>

                {/* Actions (Top Right aligned with bottom of cover) */}
                <div className="mt-4 sm:mt-16 sm:mb-0 flex gap-2">
                  {isMe ? (
                    isEditing ? (
                      <>
                        <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setIsEditing(false)}>Hủy</Button>
                        <Button onClick={handleSaveProfile} className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-200">
                          <Save size={16} className="mr-2" /> Lưu hồ sơ
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit2 size={16} className="mr-2" /> Chỉnh sửa hồ sơ
                      </Button>
                    )
                  ) : (
                    <>
                      <Button variant="outline">
                        <MoreHorizontal size={20} />
                      </Button>
                      <Button className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-200">
                        <MessageSquare size={16} className="mr-2" /> Nhắn tin
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Text Info */}
              <div className="space-y-1">
                {isEditing ? (
                  <div className="grid grid-cols-1 gap-4 max-w-lg mb-4">
                    <Input
                      label="Họ tên hiển thị"
                      value={editForm.fullName}
                      onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="text-2xl font-bold"
                    />
                    <Input
                      label="Headline (Mô tả ngắn)"
                      value={editForm.bio}
                      onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      {userProfile.fullName}
                      {stats.karma > 1000 && <Award size={20} className="text-amber-500" fill="currentColor" />}
                    </h1>
                    <p className="text-slate-600 text-base max-w-2xl">{editForm.bio}</p>
                  </>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 mt-2">
                  <div className="flex items-center gap-1">
                    <User size={16} className="text-slate-400" />
                    <span className="font-medium text-slate-700">{userProfile.position}</span>
                    <span>at</span>
                    <span className="font-medium text-brand-600">{userProfile.department}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-slate-400" />
                    <span>Joined {new Date().getFullYear()}</span>
                  </div>
                </div>

                {/* Quick StatsRow (Optional, simple) */}
                <div className="flex gap-6 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex gap-1 items-baseline hover:text-brand-600 cursor-pointer transition-colors">
                    <span className="font-bold text-slate-900">{stats.posts}</span> <span className="text-slate-500 text-sm">bài viết</span>
                  </div>
                  <div className="flex gap-1 items-baseline hover:text-brand-600 cursor-pointer transition-colors">
                    <span className="font-bold text-slate-900">{stats.upvotes}</span> <span className="text-slate-500 text-sm">upvotes</span>
                  </div>
                  <div className="flex gap-1 items-baseline hover:text-brand-600 cursor-pointer transition-colors">
                    <span className="font-bold text-slate-900">1.2k</span> <span className="text-slate-500 text-sm">followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. TABS & CONTENT */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 px-2 overflow-x-auto">
              {[
                { id: "posts", label: "Bài viết", icon: FileText, count: userPosts.length },
                { id: "comments", label: "Bình luận", icon: MessageSquare, count: stats.comments },
                { id: "activity", label: "Hoạt động", icon: Activity, count: 0 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                    ? "border-brand-600 text-brand-600 bg-brand-50/10"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <tab.icon size={18} /> {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "posts" && (
                <div className="space-y-4">
                  {userPosts.length > 0 ? (
                    userPosts.map((post) => (
                      <div key={post.id} className="group p-5 border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-md transition-all cursor-pointer bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{post.categoryId}</span>
                            <span className="text-xs text-slate-400">{post.timestamp}</span>
                          </div>
                          <MoreHorizontal size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-2 line-clamp-2">{post.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-4 pt-4 border-t border-slate-50">
                          <span className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                            <ArrowRight size={16} className="-rotate-90 text-orange-500" /> <span className="font-medium text-slate-700">{post.upvotes}</span>
                          </span>
                          <span className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                            <MessageSquare size={16} /> <span className="font-medium text-slate-700">{post.commentCount}</span>
                          </span>
                          <span className="flex items-center gap-1.5 ml-auto">
                            <Clock size={16} /> {post.viewCount}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FileText size={32} className="text-slate-300" />
                      </div>
                      <p>Chưa có bài viết nào.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-4">
                  {mockUserComments.map((comment, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-sm">
                        <MessageSquare size={14} className="text-slate-400" />
                        <span className="text-slate-500">Bình luận tại bài viết:</span>
                        <a href="#" className="font-bold text-brand-600 hover:underline line-clamp-1 flex-1">{comment.postTitle}</a>
                      </div>
                      <div className="pl-6 border-l-2 border-slate-200 py-1 mb-3">
                        <p className="text-slate-700 text-sm italic">"{comment.content}"</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 pl-6">
                        <span>{comment.time}</span>
                        <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">+{comment.upvotes} Upvotes</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "activity" && (
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 ml-2">
                  {userActivities.length > 0 ? userActivities.map(act => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-white border-4 border-brand-50 flex items-center justify-center">
                        <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-slate-900"><span className="font-semibold">{act.content}</span> {act.target && <span className="text-slate-500">- "{act.target}"</span>}</p>
                      <p className="text-xs text-slate-400 mt-1">{act.timestamp}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-500 italic">Chưa có hoạt động nào gần đây.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDEBAR (Shared Info, 4 cols) --- */}
        <div className="lg:col-span-4 space-y-6">

          {/* About Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4 text-base">Thông tin cá nhân</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center">
                  <Gift size={18} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Ngày sinh (Cake Day)</div>
                  <div className="text-sm font-medium text-slate-900">{stats.cakeDay}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Email liên hệ</div>
                  <a href={`mailto:${userProfile.email}`} className="text-sm font-medium text-slate-900 hover:text-brand-600 truncate block max-w-[200px]">{userProfile.email}</a>
                </div>
              </div>

              {/* Socials */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <a href="#" className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-800 hover:text-white text-slate-500 flex items-center justify-center transition-all"><Github size={18} /></a>
                <a href="#" className="w-9 h-9 rounded-full bg-slate-50 hover:bg-blue-700 hover:text-white text-slate-500 flex items-center justify-center transition-all"><Linkedin size={18} /></a>
                <a href="#" className="w-9 h-9 rounded-full bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-500 flex items-center justify-center transition-all"><Facebook size={18} /></a>
              </div>
            </div>
          </div>

          {/* Skills / Badges (Mock) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-base">Huy hiệu & Kỹ năng</h3>
              <span className="text-xs text-brand-600 font-bold hover:underline cursor-pointer">Xem tất cả</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100 flex items-center gap-1">
                <Award size={12} /> Top Contributor
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 flex items-center gap-1">
                <Shield size={12} /> Moderator
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200">ReactJS</span>
              <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200">UI/UX</span>
              <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200">System Design</span>
            </div>
          </div>

          {/* Similar Profiles */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4 text-base">Nhân sự cùng phòng ban</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 cursor-pointer group">
                  <img src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} className="w-10 h-10 rounded-full border border-slate-100" alt="" />
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-brand-600 group-hover:underline">Nguyễn Văn {String.fromCharCode(64 + i)}</div>
                    <div className="text-xs text-slate-500">Software Engineer</div>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto w-8 h-8 p-0 rounded-full border border-slate-200 text-slate-400 hover:text-brand-600 hover:bg-brand-50">
                    <MessageSquare size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
