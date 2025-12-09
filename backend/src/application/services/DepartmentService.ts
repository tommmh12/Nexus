import { DepartmentRepository } from "../../infrastructure/repositories/DepartmentRepository.js";
import { Department } from "../../domain/entities/Department.js";

export class DepartmentService {
  constructor(private departmentRepository: DepartmentRepository) {}

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

    await this.departmentRepository.update(id, departmentData);
  }

  async deleteDepartment(id: string): Promise<void> {
    const existing = await this.departmentRepository.findById(id);
    if (!existing) {
      throw new Error("Department not found");
    }

    await this.departmentRepository.delete(id);
  }
}
