import {
    validate,
    isValidEmail,
    isValidPassword,
    requiredString,
    optionalString,
    isValidRole,
    requiredRole,
    isValidId,
    body,
} from "./index.js";

/**
 * Validation schemas for User routes
 */

// POST /api/users - Create user (admin only)
export const createUserValidation = [
    requiredString("full_name", 2, 100),
    isValidEmail(),
    isValidPassword("password"),
    requiredRole(),
    optionalString("phone", 20),
    optionalString("position", 100),
    body("department_id").optional().isString(),
    body("status")
        .optional()
        .isIn(["Active", "Inactive", "Pending"])
        .withMessage("Status must be Active, Inactive, or Pending"),
    validate,
];

// PUT /api/users/:id - Update user (admin only)
export const updateUserValidation = [
    isValidId(),
    optionalString("full_name", 100),
    body("email").optional().isEmail().withMessage("Invalid email format"),
    isValidRole(),
    optionalString("phone", 20),
    optionalString("position", 100),
    body("department_id").optional(),
    body("status")
        .optional()
        .isIn(["Active", "Inactive", "Pending"])
        .withMessage("Status must be Active, Inactive, or Pending"),
    validate,
];

// PUT /api/users/profile - Update own profile
export const updateProfileValidation = [
    optionalString("full_name", 100),
    optionalString("phone", 20),
    optionalString("position", 100),
    optionalString("bio", 500),
    body("avatar_url").optional().isURL().withMessage("Invalid avatar URL"),
    // Prevent role escalation via profile update
    body("role").not().exists().withMessage("Cannot change role via profile"),
    body("status").not().exists().withMessage("Cannot change status via profile"),
    validate,
];

// GET /api/users/:id
export const getUserByIdValidation = [isValidId(), validate];

// DELETE /api/users/:id
export const deleteUserValidation = [isValidId(), validate];
