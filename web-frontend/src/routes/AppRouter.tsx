import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Dashboard } from "../components/Dashboard";
import { UserRole } from "../types";

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

// Component to handle role-based redirects
const RoleRedirect: React.FC<{ rolePrefix: string }> = ({ rolePrefix }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // If user is on a path that doesn't match their role, redirect to correct path
  if (!currentPath.startsWith(rolePrefix) && currentPath !== "/") {
    // Extract the page from current path and redirect to correct role prefix
    const pathParts = currentPath.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      const page = pathParts.slice(1).join("/"); // Get everything after role prefix
      return <Navigate to={`${rolePrefix}/${page}`} replace />;
    }
    return <Navigate to={`${rolePrefix}/overview`} replace />;
  }

  return null;
};

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
      {/* Handle role mismatch redirects */}
      <RoleRedirect rolePrefix={rolePrefix} />

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
            {/* Redirect wrong role paths to admin */}
            <Route
              path="/manager/*"
              element={<Navigate to="/admin/overview" replace />}
            />
            <Route
              path="/employee/*"
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
            {/* Redirect wrong role paths to manager */}
            <Route
              path="/admin/*"
              element={<Navigate to="/manager/overview" replace />}
            />
            <Route
              path="/employee/*"
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
            {/* Redirect wrong role paths to employee */}
            <Route
              path="/admin/*"
              element={<Navigate to="/employee/overview" replace />}
            />
            <Route
              path="/manager/*"
              element={<Navigate to="/employee/overview" replace />}
            />
          </>
        )}

        {/* Catch all - redirect to correct role prefix */}
        <Route
          path="*"
          element={<Navigate to={`${rolePrefix}/overview`} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};
