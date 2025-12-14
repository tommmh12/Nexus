
export const projectService = {
  getProjects: async () => [],
  generateProjectCode: async () => "PRJ-001",
  createProject: async (data: any) => ({ success: true, id: "mock-id" }),
  updateProject: async (id: string, data: any) => ({ success: true, id: "mock-id" }),
  deleteProject: async (id: string) => ({ success: true }),
};
export const workflowService = {
  getWorkflows: async () => []
};
