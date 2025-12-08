import { RowDataPacket } from "mysql2";
import { dbPool } from "../database/connection.js";

export class ProjectRepository {
  private db = dbPool;

  async getAllProjects(includeDeleted = false) {
    const query = `
      SELECT 
        p.*,
        u.full_name as managerName,
        w.name as workflowName,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND deleted_at IS NULL) as taskCount,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'Done' AND deleted_at IS NULL) as completedTaskCount
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN workflows w ON p.workflow_id = w.id
      WHERE ${includeDeleted ? "1=1" : "p.deleted_at IS NULL"}
      ORDER BY p.created_at DESC
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(query);
    return rows;
  }

  async getProjectById(id: string) {
    const query = `
      SELECT 
        p.*,
        u.full_name as managerName,
        w.name as workflowName
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN workflows w ON p.workflow_id = w.id
      WHERE p.id = ? AND p.deleted_at IS NULL
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [id]);
    return rows[0] || null;
  }

  async getProjectDepartments(projectId: string) {
    const query = `
      SELECT 
        pd.*,
        d.name as departmentName
      FROM project_departments pd
      LEFT JOIN departments d ON pd.department_id = d.id
      WHERE pd.project_id = ?
      ORDER BY pd.assigned_at
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [projectId]);
    return rows;
  }

  async createProject(projectData: any) {
    const query = `
      INSERT INTO projects (
        code, name, description, manager_id, workflow_id, 
        status, priority, budget, start_date, end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.query(query, [
      projectData.code,
      projectData.name,
      projectData.description || null,
      projectData.managerId || null,
      projectData.workflowId || null,
      projectData.status || "Planning",
      projectData.priority || "Medium",
      projectData.budget || null,
      projectData.startDate || null,
      projectData.endDate || null,
    ]);

    return (result as any).insertId;
  }

  async updateProject(id: string, projectData: any) {
    const query = `
      UPDATE projects 
      SET 
        name = ?,
        description = ?,
        manager_id = ?,
        workflow_id = ?,
        status = ?,
        priority = ?,
        progress = ?,
        budget = ?,
        start_date = ?,
        end_date = ?
      WHERE id = ? AND deleted_at IS NULL
    `;

    await this.db.query(query, [
      projectData.name,
      projectData.description || null,
      projectData.managerId || null,
      projectData.workflowId || null,
      projectData.status,
      projectData.priority,
      projectData.progress || 0,
      projectData.budget || null,
      projectData.startDate || null,
      projectData.endDate || null,
      id,
    ]);
  }

  async deleteProject(id: string) {
    await this.db.query("UPDATE projects SET deleted_at = NOW() WHERE id = ?", [
      id,
    ]);
  }

  async assignDepartment(
    projectId: string,
    departmentId: string,
    role?: string
  ) {
    const query = `
      INSERT INTO project_departments (project_id, department_id, role)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE role = ?
    `;

    await this.db.query(query, [
      projectId,
      departmentId,
      role || null,
      role || null,
    ]);
  }

  async removeDepartment(projectId: string, departmentId: string) {
    await this.db.query(
      "DELETE FROM project_departments WHERE project_id = ? AND department_id = ?",
      [projectId, departmentId]
    );
  }
}
