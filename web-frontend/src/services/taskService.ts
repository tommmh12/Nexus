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
    return response.data;
  },

  createTask: async (taskData: Partial<TaskDetail>): Promise<TaskDetail> => {
    const response = await axios.post(`${API_URL}/tasks`, taskData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateTask: async (
    taskId: string,
    taskData: Partial<TaskDetail>
  ): Promise<TaskDetail> => {
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await axios.delete(`${API_URL}/tasks/${taskId}`, {
      headers: getAuthHeader(),
    });
  },
};
