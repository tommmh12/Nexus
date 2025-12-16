import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import { taskService, TaskDetail } from '../services/taskService';

export interface ProjectMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

export interface MyProject {
  id: string;
  name: string;
  code: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  progress: number;
  members: ProjectMember[];
  taskCount: number;
  completedTaskCount: number;
}

interface UseMyProjectsReturn {
  projects: MyProject[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  getProjectTasks: (projectId: string) => Promise<TaskDetail[]>;
}

export const useMyProjects = (): UseMyProjectsReturn => {
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await projectService.getProjects();
      const mappedProjects: MyProject[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name || p.title,
        code: p.code || '',
        description: p.description || '',
        status: p.status || 'Active',
        startDate: p.startDate || '',
        endDate: p.endDate || '',
        progress: p.progress || 0,
        members: (p.members || []).map((m: any) => ({
          id: m.id || m.userId,
          name: m.name || m.fullName || 'Unknown',
          avatarUrl: m.avatarUrl,
          role: m.role || 'Member',
        })),
        taskCount: p.taskCount || p.tasks?.length || 0,
        completedTaskCount: p.completedTaskCount || 0,
      }));

      setProjects(mappedProjects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectTasks = useCallback(async (projectId: string): Promise<TaskDetail[]> => {
    try {
      const tasks = await taskService.getTasksByProject(projectId);
      return tasks || [];
    } catch (err) {
      console.error('Error fetching project tasks:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    getProjectTasks,
  };
};
