import { RowDataPacket } from "mysql2";
import { dbPool } from "../database/connection.js";
import crypto from "crypto";

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
    // Generate UUID for the project
    const projectId = crypto.randomUUID();

    const query = `
      INSERT INTO projects (
        id, code, name, description, manager_id, workflow_id, 
        status, priority, budget, start_date, end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.query(query, [
      projectId,
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

    return projectId;
  }

  async updateProject(id: string, projectData: any) {
    // Build dynamic query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (projectData.name !== undefined) {
      updates.push("name = ?");
      values.push(projectData.name);
    }
    if (projectData.description !== undefined) {
      updates.push("description = ?");
      values.push(projectData.description || null);
    }
    if (projectData.managerId !== undefined) {
      updates.push("manager_id = ?");
      values.push(projectData.managerId || null);
    }
    if (projectData.workflowId !== undefined) {
      updates.push("workflow_id = ?");
      values.push(projectData.workflowId || null);
    }
    if (projectData.status !== undefined) {
      updates.push("status = ?");
      values.push(projectData.status);
    }
    if (projectData.priority !== undefined) {
      updates.push("priority = ?");
      values.push(projectData.priority);
    }
    if (projectData.progress !== undefined) {
      updates.push("progress = ?");
      values.push(projectData.progress || 0);
    }
    if (projectData.budget !== undefined) {
      updates.push("budget = ?");
      values.push(projectData.budget || null);
    }
    if (projectData.startDate !== undefined) {
      updates.push("start_date = ?");
      values.push(projectData.startDate || null);
    }
    if (projectData.endDate !== undefined) {
      updates.push("end_date = ?");
      values.push(projectData.endDate || null);
    }

    if (updates.length === 0) {
      return; // No fields to update
    }

    const query = `
      UPDATE projects 
      SET ${updates.join(", ")}
      WHERE id = ? AND deleted_at IS NULL
    `;

    values.push(id);
    await this.db.query(query, values);
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
