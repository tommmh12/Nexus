import { dbPool } from "../database/connection.js";
import { Department } from "../../domain/entities/Department.js";

export class DepartmentRepository {
  private db = dbPool;

  async findAll(): Promise<Department[]> {
    const [rows] = await this.db.query(`
      SELECT 
        d.id,
        d.name,
        d.code,
        d.description,
        d.budget,
        d.kpi_status as kpiStatus,
        d.manager_id as managerId,
        u.full_name as managerName,
        u.avatar_url as managerAvatar,
        d.parent_department_id as parentDepartmentId,
        pd.name as parentDepartmentName,
        (SELECT COUNT(*) FROM users WHERE department_id = d.id) as memberCount,
        d.created_at as createdAt,
        d.updated_at as updatedAt
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      LEFT JOIN departments pd ON d.parent_department_id = pd.id
      ORDER BY d.name ASC
    `);
    return rows as Department[];
  }

  async findById(id: string): Promise<Department | null> {
    const [rows] = await this.db.query(
      `
      SELECT 
        d.id,
        d.name,
        d.code,
        d.description,
        d.budget,
        d.kpi_status as kpiStatus,
        d.manager_id as managerId,
        u.full_name as managerName,
        u.avatar_url as managerAvatar,
        d.parent_department_id as parentDepartmentId,
        pd.name as parentDepartmentName,
        (SELECT COUNT(*) FROM users WHERE department_id = d.id) as memberCount,
        d.created_at as createdAt,
        d.updated_at as updatedAt
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      LEFT JOIN departments pd ON d.parent_department_id = pd.id
      WHERE d.id = ?
    `,
      [id]
    );
    const departments = rows as Department[];
    return departments.length > 0 ? departments[0] : null;
  }

  async create(department: Partial<Department>): Promise<Department> {
    const deptId = crypto.randomUUID();
    await this.db.query(
      "INSERT INTO departments (id, name, code, description, budget, kpi_status, manager_id, parent_department_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        deptId,
        department.name,
        department.code || null,
        department.description || null,
        department.budget || null,
        department.kpiStatus || null,
        department.managerId || null,
        department.parentDepartmentId || null,
      ]
    );
    const created = await this.findById(deptId);
    if (!created) throw new Error("Failed to create department");
    return created;
  }

  async update(id: string, department: Partial<Department>): Promise<void> {
    await this.db.query(
      "UPDATE departments SET name = ?, code = ?, description = ?, budget = ?, kpi_status = ?, manager_id = ?, parent_department_id = ? WHERE id = ?",
      [
        department.name,
        department.code || null,
        department.description || null,
        department.budget || null,
        department.kpiStatus || null,
        department.managerId || null,
        department.parentDepartmentId || null,
        id,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.query("DELETE FROM departments WHERE id = ?", [id]);
  }

  // --- Manager Handling ---

  /**
   * Update user's department_id to the specified department
   * This ensures the manager is also a member of the department
   */
  async updateUserDepartment(
    userId: string,
    departmentId: string
  ): Promise<void> {
    await this.db.query("UPDATE users SET department_id = ? WHERE id = ?", [
      departmentId,
      userId,
    ]);
  }

  /**
   * Check if a user is a manager of any department (excluding a specific dept)
   * Returns the department info if user is a manager elsewhere, null otherwise
   */
  async checkUserIsManagerElsewhere(
    userId: string,
    excludeDeptId?: string
  ): Promise<{ id: string; name: string } | null> {
    let query = `
      SELECT id, name FROM departments 
      WHERE manager_id = ?
    `;
    const params: any[] = [userId];

    if (excludeDeptId) {
      query += ` AND id != ?`;
      params.push(excludeDeptId);
    }

    const [rows] = await this.db.query<any[]>(query, params);
    return rows.length > 0 ? { id: rows[0].id, name: rows[0].name } : null;
  }

  /**
   * Clear the manager of a department (set manager_id to null)
   */
  async clearDepartmentManager(departmentId: string): Promise<void> {
    await this.db.query(
      "UPDATE departments SET manager_id = NULL WHERE id = ?",
      [departmentId]
    );
  }
}
