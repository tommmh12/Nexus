import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all user routes
router.use(authMiddleware);

// GET /api/users - Lấy danh sách nhân sự đang làm việc
router.get("/", UserController.getAll);

// GET /api/users/resigned - Lấy danh sách đã nghỉ việc
router.get("/resigned", UserController.getResigned);

// GET /api/users/generate-employee-id/:departmentId - Preview mã nhân viên
router.get("/generate-employee-id/:departmentId", UserController.previewEmployeeId);

// GET /api/users/:id - Lấy chi tiết nhân sự
router.get("/:id", UserController.getById);

// POST /api/users - Tạo nhân sự mới
router.post("/", UserController.create);

// PUT /api/users/:id - Cập nhật nhân sự
router.put("/:id", UserController.update);

// DELETE /api/users/:id - Xóa mềm (chuyển sang nghỉ việc)
router.delete("/:id", UserController.softDelete);

// POST /api/users/:id/restore - Khôi phục nhân sự đã nghỉ
router.post("/:id/restore", UserController.restore);

// POST /api/users/:id/change-password - Đổi mật khẩu (user tự đổi)
router.post("/:id/change-password", UserController.changePassword);

// POST /api/users/:id/reset-password - Cấp lại mật khẩu (admin cấp lại)
router.post("/:id/reset-password", UserController.resetPassword);

export default router;
