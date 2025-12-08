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
