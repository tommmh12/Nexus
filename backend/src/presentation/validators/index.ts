import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Validation Middleware Helper
 * Checks for validation errors and returns 400 if any exist
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((err) => ({
                field: err.type === "field" ? (err as any).path : "unknown",
                message: err.msg,
            })),
        });
        return;
    }
    next();
};

// ============================================================
// Common Validators
// ============================================================

export const isValidId = (fieldName: string = "id") =>
    param(fieldName)
        .trim()
        .notEmpty()
        .withMessage(`${fieldName} is required`)
        .isLength({ min: 1, max: 100 })
        .withMessage(`${fieldName} must be between 1-100 characters`);

export const isValidUUID = (fieldName: string = "id") =>
    param(fieldName)
        .trim()
        .isUUID()
        .withMessage(`${fieldName} must be a valid UUID`);

export const optionalString = (fieldName: string, maxLength: number = 500) =>
    body(fieldName)
        .optional()
        .isString()
        .trim()
        .isLength({ max: maxLength })
        .withMessage(`${fieldName} must be at most ${maxLength} characters`);

export const requiredString = (
    fieldName: string,
    minLength: number = 1,
    maxLength: number = 500
) =>
    body(fieldName)
        .trim()
        .notEmpty()
        .withMessage(`${fieldName} is required`)
        .isLength({ min: minLength, max: maxLength })
        .withMessage(
            `${fieldName} must be between ${minLength}-${maxLength} characters`
        );

export const isValidEmail = () =>
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail();

export const isValidPassword = (fieldName: string = "password") =>
    body(fieldName)
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters");

export const isValidRole = () =>
    body("role")
        .optional()
        .isIn(["admin", "manager", "employee"])
        .withMessage("Role must be admin, manager, or employee");

export const requiredRole = () =>
    body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["admin", "manager", "employee"])
        .withMessage("Role must be admin, manager, or employee");

// Pagination validators
export const paginationValidators = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1-100"),
];

// ============================================================
// Re-exports for convenience
// ============================================================
export { body, param, query } from "express-validator";
