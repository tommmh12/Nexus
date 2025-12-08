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
}
