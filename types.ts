export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  EMPLOYEE = "Employee",
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  department: string;
  role: UserRole;
}

export enum AuthStatus {
  IDLE = "IDLE",
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  errorMessage: string | null;
}

// --- Notification Types ---
export interface Notification {
  id: string;
  type: "comment" | "upvote" | "mention" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  actorName?: string;
  actorAvatar?: string;
}

// --- Project Types ---

// Unified Document Type
export interface ProjectDocument {
  name: string;
  url: string;
  date: string;
  type?: "image" | "file";
  source?: "Project" | "Task" | "Report"; // Track origin
  uploader?: string; // Department or User name
}

export interface Project {
  id: number;
  name: string;
  code: string;
  // dept: string; // Deprecated
  participatingDepartments: string[]; // List of Dept IDs or Names
  workflowId: string; // Link to WorkflowDesigner
  progress: number;
  status: "Planning" | "In Progress" | "Review" | "Done";
  members: number; // Total headcount count from depts
  startDate: string;
  endDate: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  budget: string;
  manager: string;
  description: string;
  documents?: ProjectDocument[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface TaskDetail {
  id: string;
  projectId: number;
  title: string;
  status: string; // Dynamic based on Workflow
  priority: "Low" | "Medium" | "High" | "Critical";

  // Changed: Assign to Department instead of User
  assigneeDepartment: string;

  startDate: string; // Added
  dueDate: string; // End Date

  description: string;
  tags: string[];
  checklist: ChecklistItem[];
  comments: Comment[];

  // Changed: List of documents instead of number
  attachments: ProjectDocument[];
}

// Project Report Interface
export interface ProjectReport {
  id: string;
  projectId: number;
  department: string;
  title: string;
  content: string;
  submittedBy: string;
  submittedDate: string;
  status: "Pending" | "Approved" | "Rejected";
  feedback?: string;
  attachments: ProjectDocument[]; // Added
}

// --- Organization Types ---
export interface Department {
  id: string;
  name: string;
  code?: string;
  managerName: string;
  managerAvatar: string;
  memberCount: number;
  description: string;
  budget: string;
  kpiStatus: "On Track" | "At Risk" | "Behind";
  parentDeptId?: string;
}

export interface LinkedAccount {
  provider: "google" | "microsoft" | "slack" | "github";
  email: string;
  connected: boolean;
  lastSynced?: string;
}

export type ActivityType =
  | "post_create"
  | "comment"
  | "task_complete"
  | "login"
  | "profile_update"
  | "system"
  | "personnel_change"
  | "data_backup";

export interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  type: ActivityType;
  content: string; // Description of the action
  target?: string; // Target name (e.g. Post Title, Task Name)
  timestamp: string;
  ipAddress?: string;
  meta?: any; // Extra data like oldVal, newVal
}

export interface EmployeeProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  position: string;
  department: string;
  role: "Admin" | "Manager" | "Employee";
  status: "Active" | "Blocked" | "Pending";
  phone: string;
  joinDate: string;
  employeeId: string;
  linkedAccounts: LinkedAccount[];
  karmaPoints?: number; // Reputation points
}

// --- Forum Types ---
export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name placeholder
  color: string;
  postCount: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string; // If user already voted
  endDate?: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar: string;
  authorDept: string;
  content: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  parentId?: string; // For nested comments
  replies?: ForumComment[]; // Nested replies
}

export interface ForumPost {
  id: string;
  categoryId: string;
  authorName: string;
  authorAvatar: string;
  authorDept: string;
  title: string;
  content: string; // HTML or Markdown
  timestamp: string;

  // Engagement
  upvotes: number;
  downvotes: number;
  userVote?: 1 | 0 | -1; // 1: up, -1: down, 0: none
  commentCount: number;
  viewCount: number;

  // Features
  isPinned?: boolean;
  isSaved?: boolean; // User saved this post
  isSubscribed?: boolean; // User following this post
  isReported?: boolean; // Mod flag
  tags: string[];

  // Content types
  poll?: Poll;
  comments?: ForumComment[]; // Optional for list view

  status?: "Pending" | "Approved" | "Rejected";
}

// --- News Types ---
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string; // HTML content
  coverImage: string;
  category: "Strategy" | "Event" | "Culture" | "Announcement";
  authorName: string;
  authorAvatar: string;
  publishDate: string;
  readTime: string; // e.g., "5 min read"
  isFeatured?: boolean;
  status: "Published" | "Draft" | "Archived";
  tags?: string[];
}

// --- System Types ---
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  threshold: number;
  unit: "days" | "percent" | "count";
  notifyTo: ("Admin" | "Manager" | "Employee")[];
  category: "HR" | "System" | "Security";
}

export interface BackupFile {
  id: string;
  fileName: string;
  size: string;
  createdAt: string;
  type: "Full" | "Incremental";
  status: "Success" | "Failed" | "Pending";
}

export interface SystemConfig {
  maintenanceMode: boolean;
  language: "vi" | "en";
  theme: "light" | "dark";
  emailService: {
    provider: "smtp" | "sendgrid";
    host: string;
    port: string;
    user: string;
    isEnabled: boolean;
  };
  smsService: {
    provider: "twilio" | "viettel";
    apiKey: string;
    isEnabled: boolean;
  };
}
