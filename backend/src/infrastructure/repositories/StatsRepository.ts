import { RowDataPacket } from "mysql2";
import { dbPool } from "../database/connection.js";

export class StatsRepository {
  private db = dbPool;

  async getDashboardStats() {
    // Get total counts
    const [usersCount] = await this.db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL"
    );
    const [projectsCount] = await this.db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM projects WHERE deleted_at IS NULL"
    );
    const [tasksCount] = await this.db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM tasks WHERE deleted_at IS NULL"
    );
    const [departmentsCount] = await this.db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM departments WHERE deleted_at IS NULL"
    );

    // Get active projects
    const [activeProjects] = await this.db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM projects WHERE status = 'In Progress' AND deleted_at IS NULL"
    );

    // Get completed tasks
    const [completedTasks] = await this.db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM tasks WHERE status = 'Done' AND deleted_at IS NULL"
    );

    // Get pending tasks
    const [pendingTasks] = await this.db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM tasks WHERE status IN ('Planning', 'In Progress') AND deleted_at IS NULL"
    );

    // Get forum posts count
    const [forumPostsCount] = await this.db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM forum_posts WHERE deleted_at IS NULL"
    );

    // Get news articles count
    const [newsCount] = await this.db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM news_articles WHERE status = 'Published' AND deleted_at IS NULL"
    );

    // Get upcoming events
    const [upcomingEvents] = await this.db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM events WHERE status = 'Upcoming' AND deleted_at IS NULL"
    );

    return {
      totalUsers: usersCount[0].count,
      totalProjects: projectsCount[0].count,
      totalTasks: tasksCount[0].count,
      totalDepartments: departmentsCount[0].count,
      activeProjects: activeProjects[0].count,
      completedTasks: completedTasks[0].count,
      pendingTasks: pendingTasks[0].count,
      totalForumPosts: forumPostsCount[0].count,
      totalNewsArticles: newsCount[0].count,
      upcomingEvents: upcomingEvents[0].count,
    };
  }

  async getRecentActivities(limit: number = 10) {
    const [activities] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        a.id,
        a.user_id as userId,
        u.full_name as userName,
        u.avatar_url as userAvatar,
        a.type,
        a.content,
        a.target,
        a.created_at as createdAt
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ?`,
      [limit]
    );

    return activities;
  }

  async getProjectsProgress(limit: number = 5) {
    const [projects] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        p.id,
        p.code,
        p.name,
        p.status,
        p.priority,
        p.progress,
        p.budget,
        p.start_date as startDate,
        p.end_date as endDate,
        GROUP_CONCAT(DISTINCT d.name SEPARATOR ', ') as departmentName,
        u.full_name as managerName
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN project_departments pd ON p.id = pd.project_id
      LEFT JOIN departments d ON pd.department_id = d.id
      WHERE p.deleted_at IS NULL
      GROUP BY p.id, p.code, p.name, p.status, p.priority, p.progress, p.budget, p.start_date, p.end_date, u.full_name
      ORDER BY p.created_at DESC
      LIMIT ?`,
      [limit]
    );

    return projects;
  }

  async getProjectsByDepartment() {
    const [projects] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        p.id,
        p.code,
        p.name,
        p.status,
        p.priority,
        p.progress,
        p.budget,
        p.start_date as startDate,
        p.end_date as endDate,
        pd.department_id as departmentId,
        d.name as departmentName,
        u.full_name as managerName
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN project_departments pd ON p.id = pd.project_id
      LEFT JOIN departments d ON pd.department_id = d.id
      WHERE p.deleted_at IS NULL
      ORDER BY d.name, p.created_at DESC`
    );

    // Group by department
    const grouped = projects.reduce((acc: any, project: any) => {
      const deptName = project.departmentName || "Chưa phân bổ";
      if (!acc[deptName]) {
        acc[deptName] = [];
      }
      acc[deptName].push(project);
      return acc;
    }, {});

    return grouped;
  }

  async getTasksSummary(limit: number = 10) {
    const [tasks] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        t.id,
        t.title,
        t.status,
        t.priority,
        t.due_date as dueDate,
        p.name as projectName,
        u.full_name as assigneeName
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.deleted_at IS NULL
      ORDER BY 
        CASE 
          WHEN t.status = 'In Progress' THEN 1
          WHEN t.status = 'Planning' THEN 2
          ELSE 3
        END,
        t.due_date ASC
      LIMIT ?`,
      [limit]
    );

    return tasks;
  }

  async getUserStats() {
    const [usersByDepartment] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        d.name as department,
        COUNT(u.id) as count
      FROM departments d
      LEFT JOIN users u ON d.id = u.department_id AND u.deleted_at IS NULL
      GROUP BY d.id, d.name
      ORDER BY count DESC`
    );

    const [usersByRole] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        role,
        COUNT(*) as count
      FROM users
      WHERE deleted_at IS NULL
      GROUP BY role`
    );

    return {
      byDepartment: usersByDepartment,
      byRole: usersByRole,
    };
  }

  async getProjectStats() {
    const [projectsByStatus] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        status,
        COUNT(*) as count
      FROM projects
      WHERE deleted_at IS NULL
      GROUP BY status`
    );

    const [projectsByPriority] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        priority,
        COUNT(*) as count
      FROM projects
      WHERE deleted_at IS NULL
      GROUP BY priority`
    );

    return {
      byStatus: projectsByStatus,
      byPriority: projectsByPriority,
    };
  }

  async getTaskStats() {
    const [tasksByStatus] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        status,
        COUNT(*) as count
      FROM tasks
      WHERE deleted_at IS NULL
      GROUP BY status`
    );

    const [tasksByPriority] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        priority,
        COUNT(*) as count
      FROM tasks
      WHERE deleted_at IS NULL
      GROUP BY priority`
    );

    return {
      byStatus: tasksByStatus,
      byPriority: tasksByPriority,
    };
  }
}
