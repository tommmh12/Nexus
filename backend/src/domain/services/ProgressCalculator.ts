/**
 * Progress Calculator Domain Service
 * 
 * Calculates project progress from task and checklist data.
 * This logic was previously in ProjectRepository - moved here for proper separation.
 */

export interface TaskProgressData {
    totalTasks: number;
    completedTasks: number;
}

export interface ChecklistProgressData {
    totalItems: number;
    completedItems: number;
}

export interface ProgressCalculationResult {
    progress: number;
    totalPoints: number;
    earnedPoints: number;
    breakdown: {
        tasks: TaskProgressData;
        checklist: ChecklistProgressData;
    };
}

/**
 * Calculate project progress based on tasks and checklist items
 * 
 * Formula: (Completed Tasks + Completed Items) / (Total Tasks + Total Items) * 100
 * 
 * @param tasks - Task completion data
 * @param checklist - Checklist item completion data
 * @returns Progress percentage (0-100) and breakdown
 */
export function calculateProgress(
    tasks: TaskProgressData,
    checklist: ChecklistProgressData
): ProgressCalculationResult {
    const totalPoints = tasks.totalTasks + checklist.totalItems;
    const earnedPoints = tasks.completedTasks + checklist.completedItems;

    let progress = 0;
    if (totalPoints > 0) {
        progress = Math.round((earnedPoints / totalPoints) * 100);
    }

    return {
        progress,
        totalPoints,
        earnedPoints,
        breakdown: {
            tasks,
            checklist,
        },
    };
}

/**
 * Calculates if progress warrants status change suggestions
 */
export function suggestStatusBasedOnProgress(
    currentStatus: string,
    progress: number
): string | null {
    // If 100% complete but not Done, suggest completing
    if (progress === 100 && currentStatus !== "Done") {
        return "Done";
    }

    // If starting work (>0%) but still Planning, suggest In Progress
    if (progress > 0 && currentStatus === "Planning") {
        return "In Progress";
    }

    // If going back to 0% from higher, might want to revert to Planning
    // But we don't auto-suggest this as it might be intentional

    return null;
}
