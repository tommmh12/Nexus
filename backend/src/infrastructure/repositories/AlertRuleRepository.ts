import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../database/connection.js";

export interface AlertRule {
  id: string;
  name: string;
  description: string | null;
  category: "HR" | "System" | "Security";
  threshold: number;
  unit: "days" | "percent" | "count";
  notify_roles: string[];
  is_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export class AlertRuleRepository {
  private db = dbPool;

  async findAll(): Promise<AlertRule[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM alert_rules ORDER BY category, name`
    );
    return rows.map((row) => ({
      ...row,
      notify_roles: row.notify_roles ? JSON.parse(row.notify_roles) : [],
      is_enabled: Boolean(row.is_enabled),
    })) as AlertRule[];
  }

  async findById(id: string): Promise<AlertRule | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM alert_rules WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      notify_roles: row.notify_roles ? JSON.parse(row.notify_roles) : [],
      is_enabled: Boolean(row.is_enabled),
    } as AlertRule;
  }

  async create(data: {
    name: string;
    description?: string;
    category: "HR" | "System" | "Security";
    threshold: number;
    unit: "days" | "percent" | "count";
    notify_roles: string[];
    is_enabled?: boolean;
  }): Promise<AlertRule> {
    const id = crypto.randomUUID();
    await this.db.query<ResultSetHeader>(
      `INSERT INTO alert_rules (id, name, description, category, threshold, unit, notify_roles, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.description || null,
        data.category,
        data.threshold,
        data.unit,
        JSON.stringify(data.notify_roles),
        data.is_enabled !== false,
      ]
    );
    return (await this.findById(id))!;
  }

  async update(
    id: string,
    data: {
      threshold?: number;
      notify_roles?: string[];
      is_enabled?: boolean;
      description?: string;
    }
  ): Promise<AlertRule | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.threshold !== undefined) {
      updates.push("threshold = ?");
      values.push(data.threshold);
    }
    if (data.notify_roles !== undefined) {
      updates.push("notify_roles = ?");
      values.push(JSON.stringify(data.notify_roles));
    }
    if (data.is_enabled !== undefined) {
      updates.push("is_enabled = ?");
      values.push(data.is_enabled);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }

    if (updates.length === 0) return this.findById(id);

    values.push(id);
    await this.db.query<ResultSetHeader>(
      `UPDATE alert_rules SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async toggleEnabled(id: string): Promise<AlertRule | null> {
    await this.db.query<ResultSetHeader>(
      `UPDATE alert_rules SET is_enabled = NOT is_enabled WHERE id = ?`,
      [id]
    );
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await this.db.query<ResultSetHeader>(
      `DELETE FROM alert_rules WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  async seedDefaultRules(): Promise<void> {
    const [existing] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM alert_rules`
    );

    if (existing[0].count > 0) return;

    const defaultRules = [
      {
        name: "Hợp đồng sắp hết hạn",
        description: "Cảnh báo khi hợp đồng lao động sắp hết hạn",
        category: "HR",
        threshold: 30,
        unit: "days",
        notify_roles: ["Admin", "Manager"],
      },
      {
        name: "Sinh nhật nhân viên",
        description: "Thông báo sinh nhật nhân viên trong tuần",
        category: "HR",
        threshold: 7,
        unit: "days",
        notify_roles: ["Admin", "Manager", "Employee"],
      },
      {
        name: "Task quá hạn",
        description: "Cảnh báo khi có task quá hạn deadline",
        category: "System",
        threshold: 0,
        unit: "days",
        notify_roles: ["Manager"],
      },
      {
        name: "Dự án chậm tiến độ",
        description: "Cảnh báo khi tiến độ dự án thấp hơn kỳ vọng",
        category: "System",
        threshold: 20,
        unit: "percent",
        notify_roles: ["Admin", "Manager"],
      },
      {
        name: "Đăng nhập thất bại",
        description: "Cảnh báo khi có nhiều lần đăng nhập thất bại từ một IP",
        category: "Security",
        threshold: 5,
        unit: "count",
        notify_roles: ["Admin"],
      },
      {
        name: "Sao lưu dữ liệu",
        description: "Nhắc nhở sao lưu dữ liệu định kỳ",
        category: "System",
        threshold: 7,
        unit: "days",
        notify_roles: ["Admin"],
      },
      {
        name: "Phiên đăng nhập bất thường",
        description: "Cảnh báo khi phát hiện đăng nhập từ vị trí lạ",
        category: "Security",
        threshold: 1,
        unit: "count",
        notify_roles: ["Admin"],
      },
      {
        name: "Nhân viên nghỉ phép dài",
        description: "Thông báo khi nhân viên nghỉ phép quá số ngày quy định",
        category: "HR",
        threshold: 5,
        unit: "days",
        notify_roles: ["Admin", "Manager"],
      },
    ];

    for (const rule of defaultRules) {
      await this.create(rule as any);
    }
  }
}
