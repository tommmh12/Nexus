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

export const addMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const members = await projectService.addMember(id, userId, role);
    res.json({ success: true, data: members });
  } catch (error: any) {
    console.error("Error adding member:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm thành viên",
    });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    await projectService.removeMember(id, userId);
    res.json({ success: true, message: "Đã xóa thành viên" });
  } catch (error: any) {
    console.error("Error removing member:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa thành viên",
    });
  }
};

export const generateProjectCode = async (req: Request, res: Response) => {
  try {
    const code = await projectService.generateProjectCode();
    res.json({ success: true, code });
  } catch (error: any) {
    console.error("Error generating project code:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo mã dự án",
    });
  }
};
