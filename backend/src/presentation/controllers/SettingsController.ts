import { Request, Response } from "express";
import { SettingsService } from "../../application/services/SettingsService.js";

const settingsService = new SettingsService();

export const getTaskSettings = async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getTaskSettings();
    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error("Error getting task settings:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy cấu hình task",
    });
  }
};

import { dbPool } from "../../infrastructure/database/connection.js";
import { RowDataPacket } from "mysql2";

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const [rows] = await dbPool.query<RowDataPacket[]>(`
      SELECT id, name, code, description
      FROM departments
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    res.json({ success: true, data: rows });
  } catch (error: any) {
    console.error("Error getting departments:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách phòng ban",
    });
  }
};
