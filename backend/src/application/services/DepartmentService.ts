import { DepartmentRepository } from "../../infrastructure/repositories/DepartmentRepository.js";
import { Department } from "../../domain/entities/Department.js";

export class DepartmentService {
  constructor(private departmentRepository: DepartmentRepository) { }

  async getAllDepartments(): Promise<Department[]> {
    return this.departmentRepository.findAll();
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    return this.departmentRepository.findById(id);
  }

  async createDepartment(
    departmentData: Partial<Department>
  ): Promise<Department> {
    // Validate required fields
    if (!departmentData.name) {
      throw new Error("Name is required");
    }

    return this.departmentRepository.create(departmentData);
  }

  async updateDepartment(
    id: string,
    departmentData: Partial<Department>
  ): Promise<void> {
    const existing = await this.departmentRepository.findById(id);
    if (!existing) {
      throw new Error("Department not found");
    }

    // Update department
    await this.departmentRepository.update(id, departmentData);

    // If manager changed, update the new manager's department_id
    if (departmentData.managerId && departmentData.managerId !== existing.managerId) {
      // Clear old manager's department assignment if they were only in this dept as manager
      // (For now, we just update the new manager's department)

      // Update new manager's department_id to this department
      await this.departmentRepository.updateUserDepartment(departmentData.managerId, id);
    }
  }

  async deleteDepartment(id: string): Promise<void> {
    const existing = await this.departmentRepository.findById(id);
    if (!existing) {
      throw new Error("Department not found");
    }

    await this.departmentRepository.delete(id);
  }

  /**
   * Check if user is manager of another department
   * Returns department info if true, null otherwise
   */
  async checkUserIsManagerElsewhere(userId: string, excludeDeptId?: string): Promise<{ id: string; name: string } | null> {
    return this.departmentRepository.checkUserIsManagerElsewhere(userId, excludeDeptId);
  }

  /**
   * Clear the manager of a specific department
   */
  async clearDepartmentManager(deptId: string): Promise<void> {
    await this.departmentRepository.clearDepartmentManager(deptId);
  }
}
