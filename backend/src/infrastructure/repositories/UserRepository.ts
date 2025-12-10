import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../database/connection.js";
import { User, UserWithDepartment } from "../../domain/entities/User.js";

export class UserRepository {
  async findByEmail(email: string): Promise<UserWithDepartment | null> {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT 
        u.*,
        d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.email = ? AND u.deleted_at IS NULL
      LIMIT 1`,
      [email]
    );

    if (rows.length === 0) return null;
    return rows[0] as UserWithDepartment;
  }

  async findById(id: string): Promise<UserWithDepartment | null> {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT 
        u.*,
        d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ? AND u.deleted_at IS NULL
      LIMIT 1`,
      [id]
    );

    if (rows.length === 0) return null;
    return rows[0] as UserWithDepartment;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await dbPool.query<ResultSetHeader>(
      "UPDATE users SET last_login_at = NOW() WHERE id = ?",
      [userId]
    );
  }

  async createSession(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<string> {
    const sessionId = crypto.randomUUID();

    await dbPool.query<ResultSetHeader>(
      `INSERT INTO user_sessions (id, user_id, token, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [sessionId, userId, token, expiresAt]
    );

    return sessionId;
  }

  async findSession(token: string): Promise<RowDataPacket | null> {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT * FROM user_sessions 
       WHERE token = ? AND expires_at > NOW() AND deleted_at IS NULL
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) return null;
    return rows[0];
  }

  async deleteSession(token: string): Promise<void> {
    await dbPool.query<ResultSetHeader>(
      "DELETE FROM user_sessions WHERE token = ?",
      [token]
    );
  }

  async searchUsers(
    searchTerm: string,
    currentUserId: string,
    limit = 20
  ): Promise<RowDataPacket[]> {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT 
        u.id,
        u.full_name,
        u.email,
        u.role,
        d.name as department_name,
        COALESCE(s.status, 'offline') as status
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN user_online_status s ON u.id = s.user_id
      WHERE u.id != ? 
        AND u.deleted_at IS NULL
        AND (
          u.full_name LIKE ? 
          OR u.email LIKE ?
          OR d.name LIKE ?
        )
      ORDER BY u.full_name
      LIMIT ?`,
      [
        currentUserId,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        limit,
      ]
    );

    return rows;
  }

  async getAllUsers(currentUserId?: string): Promise<RowDataPacket[]> {
    const query = currentUserId
      ? `SELECT 
          u.id,
          u.full_name,
          u.email,
          u.role,
          d.name as department_name,
          COALESCE(s.status, 'offline') as status
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN user_online_status s ON u.id = s.user_id
        WHERE u.id != ? AND u.deleted_at IS NULL
        ORDER BY u.full_name`
      : `SELECT 
          u.id,
          u.full_name,
          u.email,
          u.role,
          d.name as department_name,
          COALESCE(s.status, 'offline') as status
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN user_online_status s ON u.id = s.user_id
        WHERE u.deleted_at IS NULL
        ORDER BY u.full_name`;

    const [rows] = await dbPool.query<RowDataPacket[]>(
      query,
      currentUserId ? [currentUserId] : []
    );

    return rows;
  }

  async create(userData: {
    employee_id: string;
    email: string;
    password_hash: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
    position?: string;
    department_id?: string;
    role: "Admin" | "Manager" | "Employee";
    status: "Active" | "Blocked" | "Pending";
    join_date?: Date;
  }): Promise<User> {
    const userId = crypto.randomUUID();

    await dbPool.query<ResultSetHeader>(
      `INSERT INTO users (
        id, employee_id, email, password_hash, full_name, phone,
        avatar_url, position, department_id, role, status, join_date,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        userData.employee_id,
        userData.email,
        userData.password_hash,
        userData.full_name,
        userData.phone || null,
        userData.avatar_url || null,
        userData.position || null,
        userData.department_id || null,
        userData.role,
        userData.status,
        userData.join_date || null,
      ]
    );

    const created = await this.findById(userId);
    if (!created) throw new Error("Failed to create user");
    return created;
  }

  async findAll(): Promise<UserWithDepartment[]> {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT 
        u.*,
        d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC`
    );
    return rows as UserWithDepartment[];
  }

  async update(id: string, userData: Partial<User>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (userData.email) {
      updates.push("email = ?");
      values.push(userData.email);
    }
    if (userData.full_name) {
      updates.push("full_name = ?");
      values.push(userData.full_name);
    }
    if (userData.phone !== undefined) {
      updates.push("phone = ?");
      values.push(userData.phone);
    }
    if (userData.position !== undefined) {
      updates.push("position = ?");
      values.push(userData.position);
    }
    if (userData.department_id !== undefined) {
      updates.push("department_id = ?");
      values.push(userData.department_id);
    }
    if (userData.role) {
      updates.push("role = ?");
      values.push(userData.role);
    }
    if (userData.status) {
      updates.push("status = ?");
      values.push(userData.status);
    }
    if (userData.employee_id) {
      updates.push("employee_id = ?");
      values.push(userData.employee_id);
    }

    if (updates.length === 0) return;

    updates.push("updated_at = NOW()");
    values.push(id);

    await dbPool.query<ResultSetHeader>(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  async delete(id: string): Promise<void> {
    await dbPool.query<ResultSetHeader>(
      "UPDATE users SET deleted_at = NOW() WHERE id = ?",
      [id]
    );
  }
}
