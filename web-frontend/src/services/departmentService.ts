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
  description?: string;
  managerName?: string;
  managerId?: string;
  managerAvatar?: string;
  parentDepartmentId?: string | null;
  parentDepartmentName?: string | null;
  memberCount?: number;
  budget?: number;
  kpiStatus?: "On Track" | "At Risk" | "Behind";
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
  level: number;
}

export interface CreateDepartmentRequest {
  name: string;
  code?: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string | null;
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

  createDepartment: async (
    department: CreateDepartmentRequest
  ): Promise<Department> => {
    const response = await axios.post(`${API_URL}/departments`, department, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateDepartment: async (
    id: string,
    department: CreateDepartmentRequest
  ): Promise<Department> => {
    const response = await axios.put(
      `${API_URL}/departments/${id}`,
      department,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  deleteDepartment: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/departments/${id}`, {
      headers: getAuthHeader(),
    });
  },

  /**
   * Check if a user is a manager of any department (excluding a specific dept)
   * Returns { isManager: boolean, department: { id, name } | null }
   */
  checkUserIsManager: async (
    userId: string,
    excludeDeptId?: string
  ): Promise<{
    isManager: boolean;
    department: { id: string; name: string } | null;
  }> => {
    const params = excludeDeptId ? `?excludeDeptId=${excludeDeptId}` : "";
    const response = await axios.get(
      `${API_URL}/departments/check-manager/${userId}${params}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  /**
   * Clear the manager of a specific department
   */
  clearDepartmentManager: async (deptId: string): Promise<void> => {
    await axios.delete(`${API_URL}/departments/${deptId}/manager`, {
      headers: getAuthHeader(),
    });
  },

  /**
   * Build tree structure from flat department list
   */
  buildTree: (departments: Department[]): DepartmentTreeNode[] => {
    const map = new Map<string, DepartmentTreeNode>();
    const roots: DepartmentTreeNode[] = [];

    // First pass: create nodes
    departments.forEach((dept) => {
      map.set(dept.id, { ...dept, children: [], level: 0 });
    });

    // Second pass: build tree
    departments.forEach((dept) => {
      const node = map.get(dept.id)!;
      if (dept.parentDepartmentId && map.has(dept.parentDepartmentId)) {
        const parent = map.get(dept.parentDepartmentId)!;
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort children by name
    const sortChildren = (nodes: DepartmentTreeNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach((node) => sortChildren(node.children));
    };
    sortChildren(roots);

    return roots;
  },

  /**
   * Flatten tree with level info for hierarchy view
   */
  flattenTree: (
    nodes: DepartmentTreeNode[],
    result: DepartmentTreeNode[] = []
  ): DepartmentTreeNode[] => {
    nodes.forEach((node) => {
      result.push(node);
      if (node.children.length > 0) {
        departmentService.flattenTree(node.children, result);
      }
    });
    return result;
  },

  /**
   * Get users by department ID
   */
  getUsersByDepartment: async (departmentId: string): Promise<any[]> => {
    const response = await axios.get(`${API_URL}/users?department_id=${departmentId}`, {
      headers: getAuthHeader(),
    });
    return response.data.users || response.data || [];
  },

  /**
   * Get all users for org chart
   */
  getAllUsersForOrgChart: async (): Promise<any[]> => {
    const response = await axios.get(`${API_URL}/users?limit=1000`, {
      headers: getAuthHeader(),
    });
    return response.data.users || response.data || [];
  },
};
