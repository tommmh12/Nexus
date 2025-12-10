import { TaskRepository } from "../../infrastructure/repositories/TaskRepository.js";

import { ProjectRepository } from "../../infrastructure/repositories/ProjectRepository.js";

import { NotificationService } from "./NotificationService.js";

export class TaskService {
  private taskRepo = new TaskRepository();
  private projectRepo = new ProjectRepository();
  private notificationService = new NotificationService();

  async getTasksByProject(projectId: string) {
    return await this.taskRepo.getTasksByProjectId(projectId);
  }

  async getTaskById(id: string) {
    const task = await this.taskRepo.getTaskById(id);
    if (!task) {
      throw new Error("Không tìm thấy task");
    }
    const checklist = await this.taskRepo.getTaskChecklist(id);
    return { ...task, checklist };
  }

  async createTask(taskData: any) {
    if (!taskData.projectId || !taskData.title) {
      throw new Error("Thiếu thông tin bắt buộc: projectId và title");
    }

    // Convert projectId to string if needed
    const taskDataWithStringId = {
      ...taskData,
      projectId: String(taskData.projectId),
    };

    const taskId = await this.taskRepo.createTask(taskDataWithStringId);

    // Add checklist items if provided
    if (taskData.checklist && Array.isArray(taskData.checklist)) {
      for (const item of taskData.checklist) {
        await this.taskRepo.addChecklistItem(taskId, item.text || item);
      }
    }

    // Recalculate project progress
    await this.projectRepo.recalculateProgress(taskDataWithStringId.projectId);

    // Notify assignees
    if (taskData.assigneeIds && taskData.assigneeIds.length > 0) {
      await this.notificationService.notifyUsers(
        taskData.assigneeIds,
        "Bạn được giao task mới",
        `Bạn đã được giao task "${taskData.title}"`,
        "task_assigned",
        taskId
      );
    }

    return await this.getTaskById(taskId);
  }

  async updateTask(id: string, taskData: any) {
    const currentTask = await this.taskRepo.getTaskById(id);

    if (taskData.status === 'Done' && currentTask.status !== 'Done') {
      // Task completed, update progress
      await this.taskRepo.updateTask(id, taskData);
      await this.projectRepo.recalculateProgress(currentTask.project_id);

      // Notify creator? Or just manager? For now simple.
    } else if (taskData.status !== 'Done' && currentTask.status === 'Done') {
      // Task reopened, update progress
      await this.taskRepo.updateTask(id, taskData);
      await this.projectRepo.recalculateProgress(currentTask.project_id);
    } else {
      await this.taskRepo.updateTask(id, taskData);
    }

    // Check for new assignees to notify (simple logic: just notify all current assignees of update, or diffing)
    // For simplicity, let's notify if explicitly assigned (which usually happens on create or distinct update)
    if (taskData.assigneeIds && taskData.assigneeIds.length > 0) {
      // Ideally we check diff, but for now notifying is safer/simpler
      // await this.notificationService.notifyUsers(taskData.assigneeIds, "Task Updated", ...);
    }

    return await this.getTaskById(id);
  }

  async deleteTask(id: string) {
    const task = await this.taskRepo.getTaskById(id);
    if (!task) return;

    await this.taskRepo.deleteTask(id);
    await this.projectRepo.recalculateProgress(task.project_id);
  }

  // --- Checklist ---

  async addChecklistItem(taskId: string, text: string) {
    const id = await this.taskRepo.addChecklistItem(taskId, text);
    const task = await this.taskRepo.getTaskById(taskId);
    await this.projectRepo.recalculateProgress(task.project_id);
    return id;
  }

  async updateChecklistItem(id: string, updates: any) {
    // Need to find task id to update progress
    // This is inefficient but necessary without a direct lookup or trigger
    // Alternatively, we can assume the frontend will refresh or we just recalculate later.
    // For correctness, let's find the task. 
    // Since we don't have getTaskByChecklistItem, we might need to add it or just pass projectId from frontend
    // But to be safe, let's just update and then try to find the project if possible, 
    // or just rely on the fact that we need the task ID.
    // Wait, `updateChecklistItem` doesn't take taskId.
    // Let's modify `getTaskChecklist` or add a new method `getTaskByChecklistItem`? 
    // Or simpler: pass taskId from frontend? Use the task repo to find it?
    // Let's add `getTaskByChecklistItemId` to Repo?
    // Actually, for now let's just update perfectly and maybe skip progress update if it's just text change?
    // But if `isCompleted` changes, we MUST update progress.

    await this.taskRepo.updateChecklistItem(id, updates);

    if (updates.isCompleted !== undefined) {
      // We need to trigger progress update.
      // We can iterate all projects? No.
      // Let's query the task ID for this item.
      // SELECT task_id FROM task_checklist_items WHERE id = ?
      // Implementing this inline query here using the db pool directly might be leaky but efficient.
      // Better: Add helper in repo.
      const task = await this.taskRepo.getTaskByChecklistId(id);
      if (task) {
        await this.projectRepo.recalculateProgress(task.project_id);
      }
    }
  }

  async deleteChecklistItem(id: string) {
    const task = await this.taskRepo.getTaskByChecklistId(id);
    await this.taskRepo.deleteChecklistItem(id);
    if (task) {
      await this.projectRepo.recalculateProgress(task.project_id);
    }
  }
}
