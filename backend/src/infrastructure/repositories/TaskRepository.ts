import { RowDataPacket } from "mysql2";
import { dbPool } from "../database/connection.js";
import crypto from "crypto";

export class TaskRepository {
  private db = dbPool;

  async getTasksByProjectId(projectId: string) {
    const query = `
      SELECT 
        t.*,
        u.full_name as createdByName,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', u2.id, 
              'name', u2.full_name, 
              'avatarUrl', u2.avatar_url
            )
          )
          FROM task_assignees ta
          JOIN users u2 ON ta.user_id = u2.id
          WHERE ta.task_id = t.id
        ) as assignees
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.project_id = ? AND t.deleted_at IS NULL
      ORDER BY t.created_at DESC
    `;

    try {
      const [rows] = await this.db.query<RowDataPacket[]>(query, [projectId]);
      return rows.map((row) => {
        let assignees = [];
        try {
          if (row.assignees) {
            assignees =
              typeof row.assignees === "string"
                ? JSON.parse(row.assignees)
                : row.assignees;
          }
        } catch (e) {
          console.error("Error parsing assignees JSON", e);
          assignees = [];
        }

        return {
          ...row,
          attachments:
            typeof row.attachments === "string"
              ? JSON.parse(row.attachments)
              : row.attachments || [],
          assignees: Array.isArray(assignees) ? assignees : [],
        };
      });
    } catch (error) {
      console.error("Error in getTasksByProjectId:", error);
      throw error;
    }
  }

  async getTaskById(id: string) {
    const query = `
      SELECT 
        t.*,
        u.full_name as createdByName,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', u2.id, 
              'name', u2.full_name, 
              'avatarUrl', u2.avatar_url
            )
          )
          FROM task_assignees ta
          JOIN users u2 ON ta.user_id = u2.id
          WHERE ta.task_id = t.id
        ) as assignees
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ? AND t.deleted_at IS NULL
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [id]);
    const task = rows[0] || null;
    if (task) {
      task.attachments =
        typeof task.attachments === "string"
          ? JSON.parse(task.attachments)
          : task.attachments || [];
      task.assignees = task.assignees
        ? typeof task.assignees === "string"
          ? JSON.parse(task.assignees)
          : task.assignees
        : [];
    }
    return task;
  }

  async createTask(taskData: any) {
    const connection = await this.db.getConnection();
    await connection.beginTransaction();

    try {
      const taskId = crypto.randomUUID();

      const query = `
        INSERT INTO tasks (
          id, code, project_id, title, description, 
          assignee_department_id, status, priority,
          start_date, due_date, created_by, attachments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.query(query, [
        taskId,
        taskData.code || `TASK-${Date.now()}`,
        taskData.projectId,
        taskData.title,
        taskData.description || null,
        null, // Deprecated assignee_department_id
        taskData.status || "To Do",
        taskData.priority || "Medium",
        taskData.startDate || null,
        taskData.dueDate || null,
        taskData.createdBy || null,
        JSON.stringify(taskData.attachments || []),
      ]);

      // Handle Assignees
      if (
        taskData.assigneeIds &&
        Array.isArray(taskData.assigneeIds) &&
        taskData.assigneeIds.length > 0
      ) {
        const values = taskData.assigneeIds.map((userId: string) => [
          taskId,
          userId,
        ]);
        const assigneeQuery = `INSERT IGNORE INTO task_assignees (task_id, user_id) VALUES ?`;
        await connection.query(assigneeQuery, [values]);
      }

      await connection.commit();
      return taskId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateTask(id: string, taskData: any) {
    const connection = await this.db.getConnection();
    await connection.beginTransaction();

    try {
      const query = `
        UPDATE tasks 
        SET 
          title = ?,
          description = ?,
          status = ?,
          priority = ?,
          start_date = ?,
          due_date = ?,
          completed_at = ?,
          attachments = ?
        WHERE id = ? AND deleted_at IS NULL
      `;

      await connection.query(query, [
        taskData.title,
        taskData.description || null,
        taskData.status,
        taskData.priority,
        taskData.startDate || null,
        taskData.dueDate || null,
        taskData.status === "Done" ? new Date() : null,
        JSON.stringify(taskData.attachments || []),
        id,
      ]);

      // Handle Assignees
      if (
        taskData.assigneeIds !== undefined &&
        Array.isArray(taskData.assigneeIds)
      ) {
        // Remove old
        await connection.query("DELETE FROM task_assignees WHERE task_id = ?", [
          id,
        ]);

        // Add new
        if (taskData.assigneeIds.length > 0) {
          const values = taskData.assigneeIds.map((userId: string) => [
            id,
            userId,
          ]);
          const assigneeQuery = `INSERT IGNORE INTO task_assignees (task_id, user_id) VALUES ?`;
          await connection.query(assigneeQuery, [values]);
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteTask(id: string) {
    await this.db.query("UPDATE tasks SET deleted_at = NOW() WHERE id = ?", [
      id,
    ]);
  }

  /**
   * Update task status by status_id or status name (workflow-based)
   * Also updates the legacy status field with the status name
   */
  async updateTaskStatusById(taskId: string, statusIdOrName: string) {
    let statusId: string | null = null;
    let statusName: string;

    // Check if it looks like a UUID (contains dashes and is 36 chars)
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        statusIdOrName
      );

    if (isUUID) {
      // Get status name from workflow_statuses by ID
      const [statusRows] = await this.db.query<RowDataPacket[]>(
        "SELECT id, name FROM workflow_statuses WHERE id = ?",
        [statusIdOrName]
      );

      if (statusRows[0]) {
        statusId = statusRows[0].id;
        statusName = statusRows[0].name;
      } else {
        throw new Error("Status not found");
      }
    } else {
      // Treat it as a status name (for fallback statuses)
      // Try to find matching workflow_status by name for this task's project
      const [taskRows] = await this.db.query<RowDataPacket[]>(
        `SELECT p.workflow_id FROM tasks t 
         JOIN projects p ON t.project_id = p.id 
         WHERE t.id = ?`,
        [taskId]
      );

      if (taskRows[0]?.workflow_id) {
        const [statusRows] = await this.db.query<RowDataPacket[]>(
          "SELECT id, name FROM workflow_statuses WHERE workflow_id = ? AND name = ?",
          [taskRows[0].workflow_id, statusIdOrName]
        );

        if (statusRows[0]) {
          statusId = statusRows[0].id;
          statusName = statusRows[0].name;
        } else {
          // No matching workflow status, just use the name directly (legacy mode)
          statusName = statusIdOrName;
        }
      } else {
        // No workflow_id, just use the name directly (legacy mode)
        statusName = statusIdOrName;
      }
    }

    const completedAt = statusName.toLowerCase() === "done" ? new Date() : null;

    await this.db.query(
      `UPDATE tasks 
       SET status_id = ?, status = ?, completed_at = ?, updated_at = NOW() 
       WHERE id = ? AND deleted_at IS NULL`,
      [statusId, statusName, completedAt, taskId]
    );

    return { statusId, statusName };
  }

  // --- Checklist Management ---

  async getTaskByChecklistId(itemId: string) {
    const query = `
        SELECT t.* 
        FROM tasks t
        JOIN task_checklist_items tci ON t.id = tci.task_id
        WHERE tci.id = ?
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [itemId]);
    return rows[0] || null;
  }

  async getTaskChecklist(taskId: string) {
    const query = `
      SELECT * FROM task_checklist_items 
      WHERE task_id = ? 
      ORDER BY \`order\`, created_at
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskId]);
    return rows.map((row) => ({
      id: row.id,
      taskId: row.task_id,
      text: row.text,
      isCompleted: !!row.is_completed, // Convert 1/0 to boolean
      order: row.order,
      createdAt: row.created_at,
    }));
  }

  async addChecklistItem(taskId: string, text: string) {
    // Get max order
    const [rows] = await this.db.query<RowDataPacket[]>(
      "SELECT MAX(`order`) as maxOrder FROM task_checklist_items WHERE task_id = ?",
      [taskId]
    );
    const order = (rows[0]?.maxOrder || 0) + 1;

    const id = crypto.randomUUID();
    await this.db.query(
      "INSERT INTO task_checklist_items (id, task_id, text, `order`) VALUES (?, ?, ?, ?)",
      [id, taskId, text, order]
    );
    return id;
  }

  async updateChecklistItem(
    id: string,
    updates: { text?: string; isCompleted?: boolean }
  ) {
    const updateParts: string[] = [];
    const values: any[] = [];

    if (updates.text !== undefined) {
      updateParts.push("text = ?");
      values.push(updates.text);
    }
    if (updates.isCompleted !== undefined) {
      updateParts.push("is_completed = ?");
      values.push(updates.isCompleted);
    }

    if (updateParts.length === 0) return;

    values.push(id);
    await this.db.query(
      `UPDATE task_checklist_items SET ${updateParts.join(", ")} WHERE id = ?`,
      values
    );
  }

  async deleteChecklistItem(id: string) {
    await this.db.query("DELETE FROM task_checklist_items WHERE id = ?", [id]);
  }

  async getTasksByUserId(userId: string) {
    const query = `
      SELECT DISTINCT
        t.*,
        p.name as projectName,
        p.code as projectCode,
        u.full_name as createdByName
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN task_assignees ta ON t.id = ta.task_id
      WHERE t.deleted_at IS NULL 
        AND (t.created_by = ? OR ta.user_id = ?)
      ORDER BY t.created_at DESC
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [
      userId,
      userId,
    ]);
    return rows;
  }

  async getTasksByDepartment(
    departmentId: string,
    startDate?: string,
    endDate?: string
  ) {
    let query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.assigned_to,
        u.full_name as assigned_to_name,
        t.created_by,
        t.due_date,
        t.progress,
        t.checklist,
        t.department_id,
        (SELECT COUNT(*) FROM comments WHERE task_id = t.id) as comments_count,
        t.created_at,
        t.updated_at
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.department_id = ? AND t.deleted_at IS NULL
    `;

    const params: any[] = [departmentId];

    if (startDate) {
      query += ` AND DATE(t.created_at) >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND DATE(t.created_at) <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY t.due_date ASC, t.priority DESC`;

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as any[];
  }

  async addComment(taskId: string, commentData: any) {
    const commentId = crypto.randomUUID();
    await this.db.query(
      `INSERT INTO comments (id, task_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)`,
      [
        commentId,
        taskId,
        commentData.user_id,
        commentData.content,
        commentData.created_at,
      ]
    );

    return {
      id: commentId,
      content: commentData.content,
    };
  }
}
