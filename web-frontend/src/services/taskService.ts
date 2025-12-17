import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

    // Return tasks directly - individual task detail will be fetched when needed
    // Removed N+1 pattern that was causing 403 errors due to permission checks
    return tasks;
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

  /**
   * Update task status using workflow status_id
   * Used for drag-drop in task board
   */
  updateTaskStatus: async (taskId: string, statusId: string) => {
    const response = await axios.patch(
      `${API_URL}/tasks/${taskId}/status`,
      { statusId },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};
