import { Request, Response } from "express";
import { ProjectService } from "../../application/services/ProjectService.js";

const projectService = new ProjectService();

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getAllProjects();
    res.json({ success: true, data: projects });
  } catch (error: any) {
    console.error("Error getting projects:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách dự án",
    });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectWithDetails(id);
    res.json({ success: true, data: project });
  } catch (error: any) {
    console.error("Error getting project:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy dự án",
    });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const project = await projectService.createProject(req.body, userId);
    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    console.error("Error creating project:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi tạo dự án",
    });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectService.updateProject(id, req.body);
    res.json({ success: true, data: project });
  } catch (error: any) {
    console.error("Error updating project:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật dự án",
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await projectService.deleteProject(id);
    res.json({ success: true, message: "Đã xóa dự án thành công" });
  } catch (error: any) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa dự án",
    });
  }
};
