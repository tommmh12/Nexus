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

    return {
      ...project,
      departments,
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
        await this.projectRepo.assignDepartment(
          projectId,
          dept.departmentId,
          dept.role
        );
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
      const newDeptIds = projectData.departments.map(
        (d: any) => d.departmentId
      );

      // Remove departments not in new list
      for (const deptId of currentDeptIds) {
        if (!newDeptIds.includes(deptId)) {
          await this.projectRepo.removeDepartment(id, deptId);
        }
      }

      // Add/update new departments
      for (const dept of projectData.departments) {
        await this.projectRepo.assignDepartment(
          id,
          dept.departmentId,
          dept.role
        );
      }
    }

    return await this.getProjectWithDetails(id);
  }

  async deleteProject(id: string) {
    await this.projectRepo.deleteProject(id);
  }
}
