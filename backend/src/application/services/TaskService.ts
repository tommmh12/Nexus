import { TaskRepository } from "../../infrastructure/repositories/TaskRepository.js";

export class TaskService {
  private taskRepo = new TaskRepository();

  async getTasksByProject(projectId: string) {
    return await this.taskRepo.getTasksByProjectId(projectId);
  }

  async getTaskById(id: string) {
    const task = await this.taskRepo.getTaskById(id);
    if (!task) {
      throw new Error("Không tìm thấy task");
    }
    return task;
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
    return await this.getTaskById(taskId);
  }

  async updateTask(id: string, taskData: any) {
    await this.taskRepo.updateTask(id, taskData);
    return await this.getTaskById(id);
  }

  async deleteTask(id: string) {
    await this.taskRepo.deleteTask(id);
  }
}
