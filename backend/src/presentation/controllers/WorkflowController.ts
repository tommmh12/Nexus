import { Request, Response } from "express";
import { WorkflowService } from "../../application/services/WorkflowService.js";

const workflowService = new WorkflowService();

export const getWorkflows = async (req: Request, res: Response) => {
  try {
    const workflows = await workflowService.getAllWorkflows();
    res.json({ success: true, data: workflows });
  } catch (error: any) {
    console.error("Error getting workflows:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách quy trình",
    });
  }
};

export const getWorkflowById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workflow = await workflowService.getWorkflowById(id);
    res.json({ success: true, data: workflow });
  } catch (error: any) {
    console.error("Error getting workflow:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy quy trình",
    });
  }
};

export const createWorkflow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const workflow = await workflowService.createWorkflow(req.body, userId);
    res.status(201).json({ success: true, data: workflow });
  } catch (error: any) {
    console.error("Error creating workflow:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi tạo quy trình",
    });
  }
};

export const updateWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workflow = await workflowService.updateWorkflow(id, req.body);
    res.json({ success: true, data: workflow });
  } catch (error: any) {
    console.error("Error updating workflow:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật quy trình",
    });
  }
};

export const deleteWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await workflowService.deleteWorkflow(id);
    res.json({ success: true, message: "Đã xóa quy trình thành công" });
  } catch (error: any) {
    console.error("Error deleting workflow:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi xóa quy trình",
    });
  }
};
