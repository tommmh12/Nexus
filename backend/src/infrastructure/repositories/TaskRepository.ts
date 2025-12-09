import { RowDataPacket } from "mysql2";
import { dbPool } from "../database/connection.js";
import crypto from "crypto";

export class TaskRepository {
  private db = dbPool;

  async getTasksByProjectId(projectId: string) {
    const query = `
      SELECT 
        t.*,
        d.name as assigneeDepartmentName,
        u.full_name as createdByName
      FROM tasks t
      LEFT JOIN departments d ON t.assignee_department_id = d.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.project_id = ? AND t.deleted_at IS NULL
      ORDER BY t.created_at DESC
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [projectId]);
    return rows;
  }

  async getTaskById(id: string) {
    const query = `
      SELECT 
        t.*,
        d.name as assigneeDepartmentName,
        u.full_name as createdByName
      FROM tasks t
      LEFT JOIN departments d ON t.assignee_department_id = d.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ? AND t.deleted_at IS NULL
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [id]);
    return rows[0] || null;
  }

  async createTask(taskData: any) {
    const taskId = crypto.randomUUID();

    const query = `
      INSERT INTO tasks (
        id, code, project_id, title, description, 
        assignee_department_id, status, priority,
        start_date, due_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.query(query, [
      taskId,
      taskData.code || `TASK-${Date.now()}`,
      taskData.projectId,
      taskData.title,
      taskData.description || null,
      taskData.assigneeDepartmentId || null,
      taskData.status || "To Do",
      taskData.priority || "Medium",
      taskData.startDate || null,
      taskData.dueDate || null,
      taskData.createdBy || null,
    ]);

    return taskId;
  }

  async updateTask(id: string, taskData: any) {
    const query = `
      UPDATE tasks 
      SET 
        title = ?,
        description = ?,
        assignee_department_id = ?,
        status = ?,
        priority = ?,
        start_date = ?,
        due_date = ?,
        completed_at = ?
      WHERE id = ? AND deleted_at IS NULL
    `;

    await this.db.query(query, [
      taskData.title,
      taskData.description || null,
      taskData.assigneeDepartmentId || null,
      taskData.status,
      taskData.priority,
      taskData.startDate || null,
      taskData.dueDate || null,
      taskData.status === "Done" ? new Date() : null,
      id,
    ]);
  }

  async deleteTask(id: string) {
    await this.db.query("UPDATE tasks SET deleted_at = NOW() WHERE id = ?", [
      id,
    ]);
  }
}
