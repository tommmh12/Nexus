const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      employee_id: string;
      email: string;
      full_name: string;
      avatar_url: string | null;
      phone: string | null;
      department_id: string | null;
      department_name?: string;
      position: string | null;
      role: "Admin" | "Manager" | "Employee";
      status: "Active" | "Blocked" | "Pending";
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
}

class AuthService {
  private baseURL = `${API_URL}/auth`;

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Đăng nhập thất bại");
    }

    // Save tokens to localStorage
    if (data.data.tokens) {
      localStorage.setItem("accessToken", data.data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.data.tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));
    }

    return data;
  }

  async logout(): Promise<void> {
    const token = this.getAccessToken();

    if (token) {
      try {
        await fetch(`${this.baseURL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    // Clear local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  async getCurrentUser(): Promise<LoginResponse["data"]["user"] | null> {
    const token = this.getAccessToken();

    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  getStoredUser(): LoginResponse["data"]["user"] | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
