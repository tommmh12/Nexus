import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  progress?: number;
  manager_id?: string;
  managerName?: string;
  department_id?: string;
  departmentName?: string;
  workflow_id?: string;
  workflowName?: string;
  members?: ProjectMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  name: string;
  email?: string;
  role: string;
  avatarUrl?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  stages?: WorkflowStage[];
}

export interface WorkflowStage {
  id: string;
  name: string;
  order: number;
  color?: string;
}

export const projectService = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    const response = await axios.get(`${API_URL}/projects`, {
      headers: getAuthHeader(),
    });
    return response.data.data || response.data || [];
  },

  // Get projects for current user (my projects)
  getMyProjects: async (): Promise<Project[]> => {
    const response = await axios.get(`${API_URL}/projects/my-projects`, {
      headers: getAuthHeader(),
    });
    return response.data.data || response.data || [];
  },

  // Get project by ID
  getProjectById: async (id: string): Promise<Project> => {
    const response = await axios.get(`${API_URL}/projects/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.data || response.data;
  },

  // Generate project code
  generateProjectCode: async (): Promise<string> => {
    const response = await axios.get(`${API_URL}/projects/generate-code`, {
      headers: getAuthHeader(),
    });
    return response.data.data?.code || response.data.code || "PRJ-001";
  },

  // Create new project
  createProject: async (projectData: Partial<Project>): Promise<Project> => {
    const response = await axios.post(`${API_URL}/projects`, projectData, {
      headers: getAuthHeader(),
    });
    return response.data.data || response.data;
  },

  // Update project
  updateProject: async (
    id: string,
    projectData: Partial<Project>
  ): Promise<Project> => {
    const response = await axios.put(`${API_URL}/projects/${id}`, projectData, {
      headers: getAuthHeader(),
    });
    return response.data.data || response.data;
  },

  // Delete project
  deleteProject: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/projects/${id}`, {
      headers: getAuthHeader(),
    });
  },

  // Add member to project
  addMember: async (
    projectId: string,
    userId: string,
    role?: string
  ): Promise<ProjectMember[]> => {
    const response = await axios.post(
      `${API_URL}/projects/${projectId}/members`,
      { userId, role },
      { headers: getAuthHeader() }
    );
    return response.data.data || response.data;
  },

  // Remove member from project
  removeMember: async (projectId: string, userId: string): Promise<void> => {
    await axios.delete(`${API_URL}/projects/${projectId}/members/${userId}`, {
      headers: getAuthHeader(),
    });
  },
};

export const workflowService = {
  // Get all workflows
  getWorkflows: async (): Promise<Workflow[]> => {
    try {
      const response = await axios.get(`${API_URL}/workflows`, {
        headers: getAuthHeader(),
      });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Error fetching workflows:", error);
      return [];
    }
  },

  // Get workflow by ID
  getWorkflowById: async (id: string): Promise<Workflow | null> => {
    try {
      const response = await axios.get(`${API_URL}/workflows/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching workflow:", error);
      return null;
    }
  },
};

export const settingsService = {
  // Get task priorities
  getPriorities: async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/priorities`, {
        headers: getAuthHeader(),
      });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Error fetching priorities:", error);
      return [];
    }
  },

  // Get task tags
  getTags: async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/tags`, {
        headers: getAuthHeader(),
      });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
  },

  // Get task statuses
  getStatuses: async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/statuses`, {
        headers: getAuthHeader(),
      });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Error fetching statuses:", error);
      return [];
    }
  },

  // Update priorities
  updatePriorities: async (priorities: any[]) => {
    const response = await axios.put(
      `${API_URL}/settings/priorities`,
      { priorities },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Update tags
  updateTags: async (tags: any[]) => {
    const response = await axios.put(
      `${API_URL}/settings/tags`,
      { tags },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Update statuses
  updateStatuses: async (statuses: string[]) => {
    const response = await axios.put(
      `${API_URL}/settings/statuses`,
      { statuses },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
};

export default projectService;
