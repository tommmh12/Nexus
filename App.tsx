import React, { useState, useEffect } from "react";
import { LoginScreen } from "./web-frontend/src/components/LoginScreen";
import { Dashboard } from "./web-frontend/src/components/Dashboard";
import { AuthState, AuthStatus, User, UserRole } from "./types";
import { authService } from "./web-frontend/src/services/authService";

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    status: AuthStatus.IDLE,
    user: null,
    errorMessage: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = authService.getStoredUser();

      if (storedUser) {
        // Verify token is still valid
        const currentUser = await authService.getCurrentUser();

        if (currentUser) {
          setAuth({
            status: AuthStatus.SUCCESS,
            user: {
              id: currentUser.id,
              name: currentUser.full_name,
              email: currentUser.email,
              avatarUrl:
                currentUser.avatar_url ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
              department: currentUser.department_name || "N/A",
              role: currentUser.role as UserRole,
            },
            errorMessage: null,
          });
        }
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setAuth((prev) => ({
      ...prev,
      status: AuthStatus.LOADING,
      errorMessage: null,
    }));

    try {
      const response = await authService.login({ email, password });
      const userData = response.data.user;

      setAuth({
        status: AuthStatus.SUCCESS,
        user: {
          id: userData.id,
          name: userData.full_name,
          email: userData.email,
          avatarUrl:
            userData.avatar_url ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
              userData.employee_id,
          department: userData.department_name || "N/A",
          role: userData.role as UserRole,
        },
        errorMessage: null,
      });
    } catch (error) {
      setAuth({
        status: AuthStatus.ERROR,
        user: null,
        errorMessage:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi không xác định",
      });
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setAuth({
      status: AuthStatus.IDLE,
      user: null,
      errorMessage: null,
    });
  };

  // Simple conditional rendering based on auth status
  if (auth.status === AuthStatus.SUCCESS && auth.user) {
    return <Dashboard user={auth.user} onLogout={handleLogout} />;
  }

  return (
    <LoginScreen
      onLogin={handleLogin}
      status={auth.status}
      errorMessage={auth.errorMessage}
    />
  );
};

export default App;
