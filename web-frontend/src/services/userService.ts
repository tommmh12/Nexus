import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAccessToken = () => localStorage.getItem("accessToken");

export interface UserData {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  position: string;
  role: "Admin" | "Manager" | "Employee";
  status: "Active" | "Blocked" | "Pending";
  department: string;
  departmentId?: string;
  joinDate: string;
  karmaPoints: number;
  lastLoginAt: string;
  resignedDate?: string;
}

export interface CreateUserData {
  fullName: string;
  email: string;
  phone?: string;
  position?: string;
  departmentId: string;
  role: "Admin" | "Manager" | "Employee";
  status?: "Active" | "Blocked" | "Pending";
}

export const userService = {
  // Lấy danh sách nhân sự đang làm việc
  async getAll(): Promise<UserData[]> {
    const token = getAccessToken();
    const response = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  // Lấy danh sách nhân sự đã nghỉ việc
  async getResigned(): Promise<UserData[]> {
    const token = getAccessToken();
    const response = await axios.get(`${API_URL}/users/resigned`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  // Lấy chi tiết nhân sự
  async getById(id: string): Promise<UserData> {
    const token = getAccessToken();
    const response = await axios.get(`${API_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  // Tạo nhân sự mới
  async create(data: CreateUserData): Promise<{ id: string; employeeId: string; temporaryPassword: string }> {
    const token = getAccessToken();
    const response = await axios.post(`${API_URL}/users`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  // Cập nhật nhân sự
  async update(id: string, data: Partial<CreateUserData>): Promise<void> {
    const token = getAccessToken();
    await axios.put(`${API_URL}/users/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Xóa mềm (chuyển sang nghỉ việc)
  async softDelete(id: string): Promise<void> {
    const token = getAccessToken();
    await axios.delete(`${API_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Khôi phục nhân sự đã nghỉ
  async restore(id: string): Promise<void> {
    const token = getAccessToken();
    await axios.post(`${API_URL}/users/${id}/restore`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Preview mã nhân viên
  async previewEmployeeId(departmentId: string): Promise<string> {
    const token = getAccessToken();
    const response = await axios.get(`${API_URL}/users/generate-employee-id/${departmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data.employeeId;
  },

  // Đổi mật khẩu (user tự đổi)
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const token = getAccessToken();
    await axios.post(
      `${API_URL}/users/${id}/change-password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Cấp lại mật khẩu (admin cấp lại)
  async resetPassword(id: string): Promise<{ temporaryPassword: string; employeeId: string; fullName: string }> {
    const token = getAccessToken();
    const response = await axios.post(
      `${API_URL}/users/${id}/reset-password`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data;
  },
};
