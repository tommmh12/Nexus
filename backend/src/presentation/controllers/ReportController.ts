import { Request, Response } from "express";
import { ReportService } from "../../application/services/ReportService.js";

const reportService = new ReportService();

export const getReportsByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const reports = await reportService.getReportsByProject(projectId);
    res.json({ success: true, data: reports });
  } catch (error: any) {
    console.error("Error getting reports:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách báo cáo",
    });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await reportService.getReportById(id);
    res.json({ success: true, data: report });
  } catch (error: any) {
    console.error("Error getting report:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy báo cáo",
    });
  }
};

export const createReport = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const report = await reportService.createReport({
      ...req.body,
      submittedBy: userId,
    });
    res.status(201).json({ success: true, data: report });
  } catch (error: any) {
    console.error("Error creating report:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi tạo báo cáo",
    });
  }
};

export const reviewReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    const userId = (req as any).user?.userId;

    const report = await reportService.reviewReport(
      id,
      status,
      feedback,
      userId
    );
    res.json({ success: true, data: report });
  } catch (error: any) {
    console.error("Error reviewing report:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi duyệt báo cáo",
    });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await reportService.deleteReport(id);
    res.json({ success: true, message: "Đã xóa báo cáo thành công" });
  } catch (error: any) {
    console.error("Error deleting report:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa báo cáo",
    });
  }
};
