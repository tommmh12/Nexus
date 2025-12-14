import { ReactNode } from 'react';

export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  STAFF = 'Staff'
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastActive: string;
  avatar: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  category?: string;
  badge?: number;
}

export interface DashboardStat {
  label: string;
  value: string;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
  icon: ReactNode;
  color: string; // Tailwind color class base (e.g., 'blue', 'green')
}

export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'warning' | 'info';
}

export interface ForumCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  userVoted?: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  upvotes: number;
  replies?: ForumComment[];
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  categoryId: string;
  categoryName?: string;
  createdAt: string;
  viewCount: number;
  upvoteCount: number;
  commentCount: number;
  isPinned?: boolean;
  isLocked?: boolean;
  tags?: string[];
  poll?: Poll;
  // Computed for UI
  isUpvoted?: boolean;
  isSaved?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  authorName: string;
  authorAvatar: string;
  publishDate: string;
  readTime: string;
  isFeatured?: boolean;
  status: 'Draft' | 'Published' | 'Archived';
  tags?: string[];
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  coverUrl?: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  bio?: string;
  joinDate: string;
  birthDate?: string;
  socials?: {
    github?: string;
    linkedin?: string;
    facebook?: string;
  };
  stats: {
    posts: number;
    comments: number;
    upvotes: number;
    karma: number;
  };
  badges?: string[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'post' | 'comment' | 'upvote' | 'badge';
  content: string;
  target?: string; // Post title or similar
  timestamp: string;
}
