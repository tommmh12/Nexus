import {
    validate,
    requiredString,
    optionalString,
    isValidId,
    body,
    param,
} from "./index.js";

/**
 * Validation schemas for Task routes
 */

// POST /api/tasks - Create task
export const createTaskValidation = [
    requiredString("title", 2, 200),
    optionalString("description", 5000),
    body("project_id").notEmpty().withMessage("Project ID is required"),
    body("assignee_id").optional().isString(),
    body("due_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid due date format"),
    body("priority")
        .optional()
        .isIn(["Low", "Medium", "High", "Critical"])
        .withMessage("Invalid priority"),
    body("status")
        .optional()
        .isIn(["Todo", "In Progress", "Review", "Done", "Cancelled"])
        .withMessage("Invalid task status"),
    body("estimated_hours")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Estimated hours must be a positive number"),
    validate,
];

// PUT /api/tasks/:id - Update task
export const updateTaskValidation = [
    isValidId(),
    optionalString("title", 200),
    optionalString("description", 5000),
    body("assignee_id").optional(),
    body("due_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid due date format"),
    body("priority")
        .optional()
        .isIn(["Low", "Medium", "High", "Critical"])
        .withMessage("Invalid priority"),
    body("status")
        .optional()
        .isIn(["Todo", "In Progress", "Review", "Done", "Cancelled"])
        .withMessage("Invalid task status"),
    body("progress")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("Progress must be 0-100"),
    body("estimated_hours")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Estimated hours must be a positive number"),
    body("actual_hours")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Actual hours must be a positive number"),
    validate,
];

// PATCH /api/tasks/:id/status - Update task status
export const updateTaskStatusValidation = [
    isValidId(),
    body("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn(["Todo", "In Progress", "Review", "Done", "Cancelled"])
        .withMessage("Invalid task status"),
    validate,
];

// POST /api/tasks/:id/checklist - Add checklist item
export const addChecklistItemValidation = [
    isValidId(),
    requiredString("title", 1, 500),
    body("is_completed").optional().isBoolean(),
    validate,
];

// PUT /api/tasks/checklist/:itemId - Update checklist item
export const updateChecklistItemValidation = [
    param("itemId").notEmpty().withMessage("Item ID is required"),
    optionalString("title", 500),
    body("is_completed").optional().isBoolean(),
    validate,
];

// GET /api/tasks/:id
export const getTaskByIdValidation = [isValidId(), validate];

// GET /api/tasks/project/:projectId
export const getTasksByProjectValidation = [
    param("projectId").notEmpty().withMessage("Project ID is required"),
    validate,
];

// DELETE /api/tasks/:id
export const deleteTaskValidation = [isValidId(), validate];
