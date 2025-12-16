import {
    validate,
    requiredString,
    optionalString,
    isValidId,
    body,
} from "./index.js";

/**
 * Validation schemas for Project routes
 */

// POST /api/projects - Create project
export const createProjectValidation = [
    requiredString("code", 2, 20),
    requiredString("name", 2, 200),
    optionalString("description", 2000),
    body("start_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid start date format"),
    body("end_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid end date format")
        .custom((value, { req }) => {
            if (value && req.body.start_date && value < req.body.start_date) {
                throw new Error("End date must be after start date");
            }
            return true;
        }),
    body("status")
        .optional()
        .isIn(["Planning", "In Progress", "On Hold", "Completed", "Cancelled"])
        .withMessage("Invalid project status"),
    body("priority")
        .optional()
        .isIn(["Low", "Medium", "High", "Critical"])
        .withMessage("Invalid priority"),
    body("budget").optional().isNumeric().withMessage("Budget must be a number"),
    body("progress")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("Progress must be 0-100"),
    validate,
];

// PUT /api/projects/:id - Update project
export const updateProjectValidation = [
    isValidId(),
    optionalString("name", 200),
    optionalString("description", 2000),
    body("start_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid start date format"),
    body("end_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid end date format"),
    body("status")
        .optional()
        .isIn(["Planning", "In Progress", "On Hold", "Completed", "Cancelled"])
        .withMessage("Invalid project status"),
    body("priority")
        .optional()
        .isIn(["Low", "Medium", "High", "Critical"])
        .withMessage("Invalid priority"),
    body("budget").optional().isNumeric().withMessage("Budget must be a number"),
    body("progress")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("Progress must be 0-100"),
    validate,
];

// POST /api/projects/:id/members - Add member
export const addMemberValidation = [
    isValidId(),
    body("userId").notEmpty().withMessage("User ID is required"),
    body("role")
        .optional()
        .isIn(["owner", "manager", "member", "viewer"])
        .withMessage("Invalid member role"),
    validate,
];

// DELETE /api/projects/:id/members/:userId - Remove member
export const removeMemberValidation = [
    isValidId(),
    isValidId("userId"),
    validate,
];

// GET /api/projects/:id
export const getProjectByIdValidation = [isValidId(), validate];

// DELETE /api/projects/:id
export const deleteProjectValidation = [isValidId(), validate];
