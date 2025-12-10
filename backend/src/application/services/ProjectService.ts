import { ProjectRepository } from "../../infrastructure/repositories/ProjectRepository.js";

export class ProjectService {
  private projectRepo = new ProjectRepository();

  async getAllProjects() {
    return await this.projectRepo.getAllProjects();
  }

  async getProjectWithDetails(id: string) {
    const project = await this.projectRepo.getProjectById(id);
    if (!project) {
      throw new Error("Không tìm thấy dự án");
    }

    const departments = await this.projectRepo.getProjectDepartments(id);
    const members = await this.projectRepo.getProjectMembers(id);

    return {
      ...project,
      departments,
      members,
    };
  }

  async createProject(projectData: any, userId?: string) {
    // Validate required fields
    if (!projectData.code || !projectData.name) {
      throw new Error("Thiếu thông tin bắt buộc");
    }

    const projectId = await this.projectRepo.createProject(projectData);

    // Assign departments if provided
    if (projectData.departments && projectData.departments.length > 0) {
      for (const dept of projectData.departments) {
        // Skip null/undefined entries
        if (!dept) continue;

        // Support both formats: string[] (UUID) or {departmentId, role}[]
        const deptId =
          typeof dept === "string"
            ? dept
            : dept.departmentId || dept.department_id;
        const role =
          typeof dept === "string" ? "member" : dept.role || "member";

        if (deptId) {
          await this.projectRepo.assignDepartment(projectId, deptId, role);
        }
      }
    }

    return await this.getProjectWithDetails(projectId);
  }

  async updateProject(id: string, projectData: any) {
    await this.projectRepo.updateProject(id, projectData);

    // Update departments if provided
    if (projectData.departments !== undefined) {
      // Get current departments
      const currentDepts = await this.projectRepo.getProjectDepartments(id);
      const currentDeptIds = currentDepts.map((d: any) => d.departmentId);

      // Filter out null/undefined values and handle both string[] (UUID) and object[] formats
      const validDepartments = projectData.departments.filter(
        (d: any) => d != null
      );
      const newDeptIds = validDepartments
        .map((d: any) =>
          typeof d === "string" ? d : d.departmentId || d.department_id
        )
        .filter((id: any) => id != null);

      // Remove departments not in new list
      for (const deptId of currentDeptIds) {
        if (!newDeptIds.includes(deptId)) {
          await this.projectRepo.removeDepartment(id, deptId);
        }
      }

      // Add new departments
      for (const deptId of newDeptIds) {
        if (!currentDeptIds.includes(deptId)) {
          await this.projectRepo.assignDepartment(id, deptId, "member");
        }
      }
    }

    return await this.getProjectWithDetails(id);
  }

  async deleteProject(id: string) {
    await this.projectRepo.deleteProject(id);
  }

  // --- Member Management ---

  async getMembers(projectId: string) {
    return await this.projectRepo.getProjectMembers(projectId);
  }

  async addMember(projectId: string, userId: string, role: string = 'Member') {
    await this.projectRepo.addProjectMember(projectId, userId, role);
    return await this.getMembers(projectId);
  }

  async removeMember(projectId: string, userId: string) {
    await this.projectRepo.removeProjectMember(projectId, userId);
    return await this.getMembers(projectId);
  }

  async recalculateProgress(projectId: string) {
    return await this.projectRepo.recalculateProgress(projectId);
  }

  async generateProjectCode(): Promise<string> {
    const lastCode = await this.projectRepo.getLatestProjectCode();
    if (!lastCode) {
      return "WEB-001";
    }

    // Extract number part
    const match = lastCode.match(/-(\d+)$/);
    if (match) {
      const number = parseInt(match[1]);
      return `WEB-${(number + 1).toString().padStart(3, "0")}`;
    }

    return `WEB-${Date.now().toString().slice(-4)}`; // Fallback
  }
}
