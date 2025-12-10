import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export interface TaskDetail {
  id: string;
  projectId: string; // Changed from number to string (UUID)
  title: string;
  description: string;
  status: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  assigneeDepartment: string;
  assigneeIds?: string[];
  assignees?: { id: string; name: string; avatarUrl: string }[];
  startDate: string;
  dueDate: string;
  checklist: { id: string; text: string; isCompleted: boolean }[];
  comments: {
    id: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: string;
  }[];
  tags: string[];
  attachments: {
    name: string;
    url: string;
    date: string;
    type: "file" | "image";
    source: string;
    uploader: string;
  }[];
}

export const taskService = {
  getTasksByProject: async (projectId: string): Promise<TaskDetail[]> => {
    const response = await axios.get(`${API_URL}/tasks/project/${projectId}`, {
      headers: getAuthHeader(),
    });
    const tasks = response.data.data || response.data;

    // Fetch checklist for each task (Note: This is N+1, optimize later if needed)
    const tasksWithChecklist = await Promise.all(tasks.map(async (task: any) => {
      try {
        const checklistRes = await axios.get(`${API_URL}/tasks/${task.id}`, { headers: getAuthHeader() });
        return checklistRes.data.data; // Task detail includes checklist
      } catch (e) {
        return task;
      }
    }));

    return tasksWithChecklist;
  },

  getTaskById: async (taskId: string): Promise<TaskDetail> => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`, {
      headers: getAuthHeader(),
    });
    return response.data.data || response.data;
  },

  createTask: async (taskData: Partial<TaskDetail>): Promise<TaskDetail> => {
    const response = await axios.post(`${API_URL}/tasks`, taskData, {
      headers: getAuthHeader(),
    });
    return response.data.data || response.data;
  },

  updateTask: async (
    taskId: string,
    taskData: Partial<TaskDetail>
  ): Promise<TaskDetail> => {
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData, {
      headers: getAuthHeader(),
    });
    return response.data.data || response.data;
  },



  // --- Checklist ---
  addChecklistItem: async (taskId: string, text: string) => {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/checklist`, { text }, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateChecklistItem: async (itemId: string, updates: { text?: string; isCompleted?: boolean }) => {
    const response = await axios.put(`${API_URL}/tasks/checklist/${itemId}`, updates, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  deleteChecklistItem: async (itemId: string) => {
    await axios.delete(`${API_URL}/tasks/checklist/${itemId}`, {
      headers: getAuthHeader(),
    });
  },

  deleteTask: async (taskId: string) => {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
