import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAccessToken = () => localStorage.getItem("accessToken");

export const projectService = {
  async getProjects() {
    const response = await axios.get(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response.data.data || response.data;
  },

  async getProjectById(id: string) {
    const response = await axios.get(`${API_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response.data.data || response.data;
  },

  async createProject(projectData: any) {
    const response = await axios.post(`${API_URL}/projects`, projectData, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response.data.data || response.data;
  },

  async updateProject(id: string, projectData: any) {
    const response = await axios.put(`${API_URL}/projects/${id}`, projectData, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response.data.data || response.data;
  },

  async deleteProject(id: string) {
    const response = await axios.delete(`${API_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response.data;
  },

  // --- Members ---
  async addMember(projectId: string, userId: string, role: string = 'Member') {
    const response = await axios.post(`${API_URL}/projects/${projectId}/members`, { userId, role }, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response.data.data || response.data;
  },


  async removeMember(projectId: string, userId: string) {
    await axios.delete(`${API_URL}/projects/${projectId}/members/${userId}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return this.getProjectById(projectId).then(p => p.members || []);
  },

  async generateProjectCode() {
    const response = await axios.get(`${API_URL}/projects/generate-code`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response.data.code;
  },
};

export const workflowService = {
  async getWorkflows() {
    const response = await axios.get(`${API_URL}/workflows`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response.data.data || response.data;
  },

  async getWorkflowById(id: string) {
    const response = await axios.get(`${API_URL}/workflows/${id}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response.data.data || response.data;
  },

  async createWorkflow(workflowData: any) {
    const response = await axios.post(`${API_URL}/workflows`, workflowData, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response.data;
  },

  async updateWorkflow(id: string, workflowData: any) {
    const response = await axios.put(
      `${API_URL}/workflows/${id}`,
      workflowData,
      {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      }
    );
    return response.data;
  },

  async deleteWorkflow(id: string) {
    const response = await axios.delete(`${API_URL}/workflows/${id}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response.data;
  },
};

export const settingsService = {
  async getTaskSettings() {
    const response = await axios.get(`${API_URL}/settings/task`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response.data;
  },
};
