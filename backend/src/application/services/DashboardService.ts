import { StatsRepository } from "../../infrastructure/repositories/StatsRepository.js";

export class DashboardService {
  private statsRepository: StatsRepository;

  constructor() {
    this.statsRepository = new StatsRepository();
  }

  async getDashboardOverview() {
    const stats = await this.statsRepository.getDashboardStats();
    const recentActivities = await this.statsRepository.getRecentActivities(10);
    const projectsProgress = await this.statsRepository.getProjectsProgress(5);
    const tasksSummary = await this.statsRepository.getTasksSummary(10);

    return {
      stats,
      recentActivities,
      projectsProgress,
      tasksSummary,
    };
  }

  async getDetailedStats() {
    const userStats = await this.statsRepository.getUserStats();
    const projectStats = await this.statsRepository.getProjectStats();
    const taskStats = await this.statsRepository.getTaskStats();

    return {
      users: userStats,
      projects: projectStats,
      tasks: taskStats,
    };
  }
}
