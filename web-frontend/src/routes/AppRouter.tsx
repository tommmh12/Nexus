import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "../components/Dashboard";
import { UserRole } from "../../../types";

interface AppRouterProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    department: string;
    role: UserRole;
  };
  onLogout: () => void;
}

export const AppRouter: React.FC<AppRouterProps> = ({ user, onLogout }) => {
  console.log("🔄 AppRouter rendering");

  // Determine role prefix (case-insensitive)
  const getRolePrefix = () => {
    const role = user.role?.toLowerCase();
    if (role === "admin") return "/admin";
    if (role === "manager" || role === "department-manager") return "/manager";
    return "/employee";
  };

  const rolePrefix = getRolePrefix();

  // Check role for route rendering (case-insensitive)
  const isAdmin = user.role?.toLowerCase() === "admin";
  const isManager = ["manager", "department-manager"].includes(
    user.role?.toLowerCase() || ""
  );
  const isEmployee = !isAdmin && !isManager;

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        {isAdmin && (
          <>
            <Route
              path="/admin/*"
              element={<Dashboard user={user} onLogout={onLogout} />}
            />
            <Route
              path="/"
              element={<Navigate to="/admin/overview" replace />}
            />
          </>
        )}

        {/* Department Manager Routes */}
        {isManager && (
          <>
            <Route
              path="/manager/*"
              element={<Dashboard user={user} onLogout={onLogout} />}
            />
            <Route
              path="/"
              element={<Navigate to="/manager/overview" replace />}
            />
          </>
        )}

        {/* Employee Routes */}
        {isEmployee && (
          <>
            <Route
              path="/employee/*"
              element={<Dashboard user={user} onLogout={onLogout} />}
            />
            <Route
              path="/"
              element={<Navigate to="/employee/overview" replace />}
            />
          </>
        )}

        {/* Fallback - removed to prevent infinite loop */}
        {/* Redirect handled by useEffect in Dashboard instead */}
      </Routes>
    </BrowserRouter>
  );
};
