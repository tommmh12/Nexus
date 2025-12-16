import { useState, useEffect, useCallback } from 'react';
import { taskService, TaskDetail } from '../services/taskService';
import { projectService } from '../services/projectService';

export interface MyTask extends TaskDetail {
  projectName: string;
  projectCode: string;
}

interface UseMyTasksReturn {
  tasks: MyTask[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateTaskStatus: (taskId: string, statusId: string) => Promise<void>;
}

export const useMyTasks = (): UseMyTasksReturn => {
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First get all projects
      const projects = await projectService.getProjects();
      const allTasks: MyTask[] = [];

      // Fetch tasks from each project
      for (const project of projects || []) {
        try {
          const projectTasks = await taskService.getTasksByProject(project.id);
          const mappedTasks = (projectTasks || []).map((task: TaskDetail) => ({
            ...task,
            projectName: project.name || project.title,
            projectCode: project.code || '',
          }));
          allTasks.push(...mappedTasks);
        } catch (err) {
          console.error(`Error fetching tasks for project ${project.id}:`, err);
        }
      }

      // Sort by due date (nearest first), then by priority
      allTasks.sort((a, b) => {
        // Priority order: Critical > High > Medium > Low
        const priorityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        const priorityDiff = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
        
        if (a.dueDate && b.dueDate) {
          const dateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          if (dateDiff !== 0) return dateDiff;
        }
        
        return priorityDiff;
      });

      setTasks(allTasks);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, statusId: string) => {
    try {
      await taskService.updateTaskStatus(taskId, statusId);
      // Refetch to get updated data
      await fetchTasks();
    } catch (err: any) {
      console.error('Error updating task status:', err);
      throw err;
    }
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    updateTaskStatus,
  };
};
