import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../database/connection.js";

export interface ActivityLog {
  id: string;
  user_id: string | null;
  type: string;
  content: string;
  target?: string;
  ip_address?: string;
  meta?: any;
  created_at: Date;
}

export class ActivityLogRepository {
  private db = dbPool;

  async create(logData: {
    user_id?: string | null;
    type: string;
    content: string;
    target?: string;
    ip_address?: string;
    meta?: any;
  }): Promise<ActivityLog> {
    const logId = crypto.randomUUID();
    
    await this.db.query<ResultSetHeader>(
      `INSERT INTO activity_logs (
        id, user_id, type, content, target, ip_address, meta, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        logId,
        logData.user_id || null,
        logData.type,
        logData.content,
        logData.target || null,
        logData.ip_address || null,
        logData.meta ? JSON.stringify(logData.meta) : null,
      ]
    );

    const [rows] = await this.db.query<RowDataPacket[]>(
      "SELECT * FROM activity_logs WHERE id = ?",
      [logId]
    );

    return rows[0] as ActivityLog;
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<ActivityLog[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        al.*,
        u.full_name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows as ActivityLog[];
  }

  async findByType(type: string, limit: number = 100): Promise<ActivityLog[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        al.*,
        u.full_name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.type = ?
      ORDER BY al.created_at DESC
      LIMIT ?`,
      [type, limit]
    );
    return rows as ActivityLog[];
  }

  async findByUserId(userId: string, limit: number = 100): Promise<ActivityLog[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT 
        al.*,
        u.full_name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.user_id = ?
      ORDER BY al.created_at DESC
      LIMIT ?`,
      [userId, limit]
    );
    return rows as ActivityLog[];
  }
}

