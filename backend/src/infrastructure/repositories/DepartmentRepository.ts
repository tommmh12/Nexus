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
        d.manager_id as managerId,
        u.full_name as managerName,
        (SELECT COUNT(*) FROM users WHERE department_id = d.id) as memberCount,
        d.created_at as createdAt,
        d.updated_at as updatedAt
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      ORDER BY d.name ASC
    `);
    return rows as Department[];
  }

  async findById(id: number): Promise<Department | null> {
    const [rows] = await this.db.query(
      `
      SELECT 
        d.id,
        d.name,
        d.code,
        d.description,
        d.manager_id as managerId,
        u.full_name as managerName,
        (SELECT COUNT(*) FROM users WHERE department_id = d.id) as memberCount,
        d.created_at as createdAt,
        d.updated_at as updatedAt
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      WHERE d.id = ?
    `,
      [id]
    );
    const departments = rows as Department[];
    return departments.length > 0 ? departments[0] : null;
  }

  async create(department: Partial<Department>): Promise<Department> {
    const [result] = await this.db.query(
      "INSERT INTO departments (name, code, description, manager_id) VALUES (?, ?, ?, ?)",
      [department.name, department.code || null, department.description || null, department.managerId || null]
    );
    const insertResult = result as any;
    const created = await this.findById(insertResult.insertId);
    if (!created) throw new Error("Failed to create department");
    return created;
  }

  async update(id: number, department: Partial<Department>): Promise<void> {
    await this.db.query(
      "UPDATE departments SET name = ?, code = ?, description = ?, manager_id = ? WHERE id = ?",
      [department.name, department.code || null, department.description || null, department.managerId || null, id]
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.query("DELETE FROM departments WHERE id = ?", [id]);
  }
}
