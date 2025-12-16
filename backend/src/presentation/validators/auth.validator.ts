import {
    validate,
    isValidEmail,
    isValidPassword,
    body,
} from "./index.js";

/**
 * Validation schemas for Auth routes
 */

// POST /api/auth/login
export const loginValidation = [
    isValidEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    body("rememberMe").optional().isBoolean(),
    validate,
];

// PUT /api/auth/change-password
export const changePasswordValidation = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    isValidPassword("newPassword"),
    body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),
    validate,
];

// POST /api/auth/forgot-password (if exists)
export const forgotPasswordValidation = [isValidEmail(), validate];

// POST /api/auth/reset-password (if exists)
export const resetPasswordValidation = [
    body("token").notEmpty().withMessage("Reset token is required"),
    isValidPassword("newPassword"),
    validate,
];
