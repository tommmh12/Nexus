import { Request, Response } from "express";
import { TaskService } from "../../application/services/TaskService.js";

const taskService = new TaskService();

export const getTasksByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const tasks = await taskService.getTasksByProject(projectId);
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    console.error("Error getting tasks:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách task",
    });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskById(id);
    res.json({ success: true, data: task });
  } catch (error: any) {
    console.error("Error getting task:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy task",
    });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const task = await taskService.createTask({
      ...req.body,
      createdBy: userId,
    });
    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    console.error("Error creating task:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi tạo task",
    });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await taskService.updateTask(id, req.body);
    res.json({ success: true, data: task });
  } catch (error: any) {
    console.error("Error updating task:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật task",
    });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await taskService.deleteTask(id);
    res.json({ success: true, message: "Đã xóa task thành công" });
  } catch (error: any) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa task",
    });
  }
};

export const addChecklistItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const newItemId = await taskService.addChecklistItem(id, text);
    res.status(201).json({ success: true, data: { id: newItemId, text, isCompleted: false } });
  } catch (error: any) {
    console.error("Error adding checklist item:", error);
    res.status(500).json({ success: false, message: "Lỗi thêm checklist" });
  }
};

export const updateChecklistItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    await taskService.updateChecklistItem(itemId, req.body);
    res.json({ success: true, message: "Cập nhật checklist thành công" });
  } catch (error: any) {
    console.error("Error updating checklist item:", error);
    res.status(500).json({ success: false, message: "Lỗi cập nhật checklist" });
  }
};

export const deleteChecklistItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    await taskService.deleteChecklistItem(itemId);
    res.json({ success: true, message: "Xóa checklist thành công" });
  } catch (error: any) {
    console.error("Error deleting checklist item:", error);
    res.status(500).json({ success: false, message: "Lỗi xóa checklist" });
  }
};

/**
 * Update task status (for workflow drag-drop)
 * Requires admin or project manager permission
 */
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { statusId } = req.body;

    if (!statusId) {
      res.status(400).json({
        success: false,
        message: "Thiếu statusId",
      });
      return;
    }

    const result = await taskService.updateTaskStatus(id, statusId);
    res.json({
      success: true,
      data: result,
      message: `Task đã chuyển sang "${result.statusName}"`,
    });
  } catch (error: any) {
    console.error("Error updating task status:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật trạng thái task",
    });
  }
};
