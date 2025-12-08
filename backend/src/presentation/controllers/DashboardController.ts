import { Request, Response } from "express";
import { DashboardService } from "../../application/services/DashboardService.js";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getOverview = async (req: Request, res: Response) => {
    try {
      const data = await this.dashboardService.getDashboardOverview();

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error getting dashboard overview:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin tổng quan",
      });
    }
  };

  getStats = async (req: Request, res: Response) => {
    try {
      const data = await this.dashboardService.getDetailedStats();

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error getting detailed stats:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê chi tiết",
      });
    }
  };
}
