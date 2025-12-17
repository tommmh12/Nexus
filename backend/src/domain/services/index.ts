/**
 * Domain Services
 * 
 * Business logic that doesn't naturally fit within a single entity.
 */

export {
    calculateProgress,
    suggestStatusBasedOnProgress,
    type TaskProgressData,
    type ChecklistProgressData,
    type ProgressCalculationResult,
} from "./ProgressCalculator.js";
