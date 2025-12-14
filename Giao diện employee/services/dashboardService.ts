
export const dashboardService = {
  getOverview: async () => {
    // Mock data simulation
    return {
      success: true,
      data: {
        stats: {
          totalUsers: 120,
          totalProjects: 8,
          totalTasks: 32,
          totalDepartments: 5,
          activeProjects: 3,
          completedTasks: 24,
          pendingTasks: 8,
          totalForumPosts: 15,
          totalNewsArticles: 4,
          upcomingEvents: 2
        },
        recentActivities: [],
        projectsProgress: [
          { id: '1', code: 'PRJ-001', name: 'Website Revamp', status: 'In Progress', priority: 'High', progress: 75, managerName: 'Alice Smith' },
          { id: '2', code: 'PRJ-002', name: 'Mobile App', status: 'Planning', priority: 'Medium', progress: 20, managerName: 'Bob Jones' }
        ],
        tasksSummary: []
      }
    };
  }
};
