import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export interface Department {
  id: string;
  name: string;
  code?: string;
  description: string;
  managerName?: string;
  managerId?: string;
  memberCount: number;
}

export interface CreateDepartmentRequest {
  name: string;
  code?: string;
  description?: string;
  managerId?: string;
}

export const departmentService = {
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await axios.get(`${API_URL}/departments`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getDepartmentById: async (deptId: string): Promise<Department> => {
    const response = await axios.get(`${API_URL}/departments/${deptId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createDepartment: async (department: CreateDepartmentRequest): Promise<Department> => {
    const response = await axios.post(`${API_URL}/departments`, department, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateDepartment: async (id: string, department: CreateDepartmentRequest): Promise<Department> => {
    const response = await axios.put(`${API_URL}/departments/${id}`, department, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  deleteDepartment: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/departments/${id}`, {
      headers: getAuthHeader(),
    });
  },
};
