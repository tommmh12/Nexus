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
  managerName: string;
  memberCount: number;
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
};
