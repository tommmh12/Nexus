import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export interface CreateUserRequest {
  employee_id: string;
  email: string;
  full_name: string;
  phone?: string;
  position?: string;
  department_id?: string;
  role: "Admin" | "Manager" | "Employee";
  status: "Active" | "Blocked" | "Pending";
  join_date?: string;
}

export interface User {
  id: string;
  employee_id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  position?: string;
  department_id?: string;
  department_name?: string;
  role: "Admin" | "Manager" | "Employee";
  status: "Active" | "Blocked" | "Pending";
  join_date?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export type UpdateUserRequest = Partial<CreateUserRequest> & {
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  avatar_url?: string;
};

export const userService = {
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await axios.post(`${API_URL}/users`, userData, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await axios.get(`${API_URL}/users`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateUser: async (
    userId: string,
    userData: UpdateUserRequest
  ): Promise<void> => {
    await axios.put(`${API_URL}/users/${userId}`, userData, {
      headers: getAuthHeader(),
    });
  },

  deleteUser: async (userId: string): Promise<void> => {
    await axios.delete(`${API_URL}/users/${userId}`, {
      headers: getAuthHeader(),
    });
  },
};
