import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { bookingService } from '../services/bookingService';
import { notificationService } from '../services/notificationService';
import { onlineMeetingService } from '../services/onlineMeetingService';

export interface DashboardTask {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
}

export interface DashboardProject {
  id: string;
  name: string;
  code: string;
  status: string;
  progress: number;
  taskCount: number;
  memberCount: number;
}

export interface DashboardMeeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'booking' | 'online';
  location?: string;
  roomName?: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  meetingsToday: number;
  unreadNotifications: number;
}

interface UseEmployeeDashboardReturn {
  stats: DashboardStats;
  tasks: DashboardTask[];
  projects: DashboardProject[];
  meetings: DashboardMeeting[];
  notifications: DashboardNotification[];
  loading: {
    stats: boolean;
    tasks: boolean;
    projects: boolean;
    meetings: boolean;
    notifications: boolean;
  };
  error: string | null;
  refetch: () => void;
}

export const useEmployeeDashboard = (): UseEmployeeDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    meetingsToday: 0,
    unreadNotifications: 0,
  });
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [meetings, setMeetings] = useState<DashboardMeeting[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState({
    stats: true,
    tasks: true,
    projects: true,
    meetings: true,
    notifications: true,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    const today = new Date().toISOString().split('T')[0];

    // Fetch projects
    setLoading(prev => ({ ...prev, projects: true }));
    try {
      const projectsData = await projectService.getProjects();
      const mappedProjects: DashboardProject[] = (projectsData || []).slice(0, 5).map((p: any) => ({
        id: p.id,
        name: p.name || p.title,
        code: p.code || '',
        status: p.status || 'Active',
        progress: p.progress || 0,
        taskCount: p.taskCount || p.tasks?.length || 0,
        memberCount: p.memberCount || p.members?.length || 0,
      }));
      setProjects(mappedProjects);
      setStats(prev => ({ ...prev, totalProjects: projectsData?.length || 0 }));

      // Fetch tasks from first project if available
      if (mappedProjects.length > 0) {
        setLoading(prev => ({ ...prev, tasks: true }));
        try {
          const allTasks: DashboardTask[] = [];
          for (const project of mappedProjects.slice(0, 3)) {
            const projectTasks = await taskService.getTasksByProject(project.id);
            const mapped = (projectTasks || []).slice(0, 3).map((t: any) => ({
              id: t.id,
              title: t.title,
              projectId: project.id,
              projectName: project.name,
              status: t.status || 'Pending',
              priority: t.priority || 'Medium',
              dueDate: t.dueDate || '',
            }));
            allTasks.push(...mapped);
          }
          setTasks(allTasks.slice(0, 5));
          
          const pending = allTasks.filter(t => t.status === 'Pending' || t.status === 'Todo').length;
          const inProgress = allTasks.filter(t => t.status === 'In Progress' || t.status === 'InProgress').length;
          const completed = allTasks.filter(t => t.status === 'Done' || t.status === 'Completed').length;
          
          setStats(prev => ({
            ...prev,
            totalTasks: allTasks.length,
            pendingTasks: pending,
            inProgressTasks: inProgress,
            completedTasks: completed,
          }));
        } catch (err) {
          console.error('Error fetching tasks:', err);
        }
        setLoading(prev => ({ ...prev, tasks: false }));
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
    setLoading(prev => ({ ...prev, projects: false }));

    // Fetch bookings for today
    setLoading(prev => ({ ...prev, meetings: true }));
    try {
      const [bookingsData, onlineMeetingsData] = await Promise.allSettled([
        bookingService.getBookings({ date: today }),
        onlineMeetingService.getMeetings(),
      ]);

      const allMeetings: DashboardMeeting[] = [];

      if (bookingsData.status === 'fulfilled') {
        const todayBookings = (bookingsData.value || [])
          .filter((b: any) => {
            const bookingDate = new Date(b.startTime || b.booking_date).toISOString().split('T')[0];
            return bookingDate === today;
          })
          .map((b: any) => ({
            id: b.id,
            title: b.title || b.meeting_title || b.purpose || 'Cuộc họp',
            startTime: b.startTime || b.start_time,
            endTime: b.endTime || b.end_time,
            type: 'booking' as const,
            roomName: b.roomName || b.room_name,
          }));
        allMeetings.push(...todayBookings);
      }

      if (onlineMeetingsData.status === 'fulfilled') {
        const todayOnline = (onlineMeetingsData.value || [])
          .filter((m: any) => {
            const meetingDate = new Date(m.scheduledAt || m.startTime).toISOString().split('T')[0];
            return meetingDate === today;
          })
          .map((m: any) => ({
            id: m.id,
            title: m.title || m.name,
            startTime: m.scheduledAt || m.startTime,
            endTime: m.endTime,
            type: 'online' as const,
          }));
        allMeetings.push(...todayOnline);
      }

      setMeetings(allMeetings);
      setStats(prev => ({ ...prev, meetingsToday: allMeetings.length }));
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
    setLoading(prev => ({ ...prev, meetings: false }));

    // Fetch notifications
    setLoading(prev => ({ ...prev, notifications: true }));
    try {
      const notifData = await notificationService.getNotifications();
      const mapped: DashboardNotification[] = (notifData || []).slice(0, 5).map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }));
      setNotifications(mapped);
      setStats(prev => ({ ...prev, unreadNotifications: mapped.filter(n => !n.isRead).length }));
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
    setLoading(prev => ({ ...prev, notifications: false }));

    setLoading(prev => ({ ...prev, stats: false }));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    tasks,
    projects,
    meetings,
    notifications,
    loading,
    error,
    refetch: fetchData,
  };
};
