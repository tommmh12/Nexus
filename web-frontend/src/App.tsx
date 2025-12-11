import React, { useState, useEffect, useCallback } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { AppRouter } from "./routes/AppRouter";
import { AuthState, AuthStatus, User, UserRole } from "./types";
import { authService } from "./services/authService";

const App: React.FC = () => {
  console.log("App component rendering");
  const [auth, setAuth] = useState<AuthState>({
    status: AuthStatus.IDLE,
    user: null,
    errorMessage: null,
  });
  const [authCheckDone, setAuthCheckDone] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    if (authCheckDone) return; // Prevent re-running

    console.log("App.tsx useEffect - checking auth");
    const checkAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        console.log("Stored user:", storedUser);

        if (storedUser) {
          // Verify token is still valid
          const currentUser = await authService.getCurrentUser();
          console.log("Current user from API:", currentUser);

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
        } else {
          // No stored user, ensure clean state
          console.log("No stored user, skipping auth check");
          // Don't call logout here as it may trigger unwanted side effects
          // Just ensure state is clean
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Clear any bad auth state
        authService.logout();
        setAuth({
          status: AuthStatus.IDLE,
          user: null,
          errorMessage: null,
        });
      }
    };

    checkAuth().finally(() => setAuthCheckDone(true));
  }, [authCheckDone]);

  const handleLogin = useCallback(async (email: string, password: string) => {
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
  }, []);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setAuth({
      status: AuthStatus.IDLE,
      user: null,
      errorMessage: null,
    });
    // Clear URL to prevent role mismatch when switching accounts
    if (window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
    }
  }, []);

  // Simple conditional rendering based on auth status
  console.log(
    "App render check - auth.status:",
    auth.status,
    "auth.user:",
    auth.user
  );

  if (auth.status === AuthStatus.SUCCESS && auth.user) {
    console.log("Rendering AppRouter with user:", auth.user.email);
    return <AppRouter user={auth.user} onLogout={handleLogout} />;
  }

  console.log("Rendering LoginScreen");
  return (
    <LoginScreen
      onLogin={handleLogin}
      status={auth.status}
      errorMessage={auth.errorMessage}
    />
  );
};

export default App;
