import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export interface Department {
  id: number;
  name: string;
  code?: string;
  description: string;
  managerName?: string;
  managerId?: number;
  memberCount: number;
}

export interface CreateDepartmentRequest {
  name: string;
  code?: string;
  description?: string;
  managerId?: number;
}

export const departmentService = {
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await axios.get(`${API_URL}/departments`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getDepartmentById: async (deptId: number): Promise<Department> => {
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

  updateDepartment: async (id: number, department: CreateDepartmentRequest): Promise<Department> => {
    const response = await axios.put(`${API_URL}/departments/${id}`, department, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  deleteDepartment: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/departments/${id}`, {
      headers: getAuthHeader(),
    });
  },
};
