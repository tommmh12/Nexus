import { Request, Response } from "express";
import { dbPool } from "../../infrastructure/database/connection.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { emailService } from "../../infrastructure/services/email.service.js";

// Generate employee ID: DEPT_CODE + 5 random digits
const generateEmployeeId = async (departmentId: string): Promise<string> => {
  const [depts] = await dbPool.query<RowDataPacket[]>(
    "SELECT code FROM departments WHERE id = ?",
    [departmentId]
  );

  const deptCode = depts[0]?.code || "EMP";
  const randomNum = Math.floor(10000 + Math.random() * 90000);

  return `${deptCode}${randomNum}`;
};

export class UserController {
  // GET /api/users - Lấy danh sách nhân sự
  static async getAll(req: Request, res: Response) {
    try {
      const [rows] = await dbPool.query<RowDataPacket[]>(`
        SELECT 
          u.id,
          u.employee_id as employeeId,
          u.full_name as fullName,
          u.email,
          u.phone,
          u.avatar_url as avatarUrl,
          u.position,
          u.role,
          u.status,
          u.join_date as joinDate,
          u.karma_points as karmaPoints,
          u.last_login_at as lastLoginAt,
          d.name as department
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.deleted_at IS NULL
        ORDER BY u.created_at DESC
      `);

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Không thể lấy danh sách nhân sự",
      });
    }
  }

  // GET /api/users/:id - Lấy chi tiết nhân sự
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [rows] = await dbPool.query<RowDataPacket[]>(
        `SELECT 
          u.id,
          u.employee_id as employeeId,
          u.full_name as fullName,
          u.email,
          u.phone,
          u.avatar_url as avatarUrl,
          u.position,
          u.role,
          u.status,
          u.join_date as joinDate,
          u.karma_points as karmaPoints,
          u.last_login_at as lastLoginAt,
          d.name as department,
          d.id as departmentId
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.id = ? AND u.deleted_at IS NULL`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhân sự",
        });
      }

      return res.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể lấy thông tin nhân sự",
      });
    }
  }

  // POST /api/users - Tạo nhân sự mới
  static async create(req: Request, res: Response) {
    try {
      const { fullName, email, phone, position, departmentId, role, status } =
        req.body;

      // Kiểm tra các trường bắt buộc (loại bỏ empty string và whitespace)
      if (!fullName?.trim() || !email?.trim() || !departmentId?.trim() || !role?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng điền đầy đủ thông tin bắt buộc",
        });
      }

      const [existing] = await dbPool.query<RowDataPacket[]>(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email đã tồn tại trong hệ thống",
        });
      }

      const employeeId = await generateEmployeeId(departmentId);
      const randomPassword = crypto.randomBytes(4).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const id = crypto.randomUUID();

      await dbPool.query<ResultSetHeader>(
        `INSERT INTO users (
          id, employee_id, full_name, email, password_hash, phone,
          position, department_id, role, status, avatar_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id,
          employeeId,
          fullName,
          email,
          passwordHash,
          phone || null,
          position || null,
          departmentId,
          role,
          status || "Active",
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${employeeId}`,
        ]
      );

      // Gửi email thông tin tài khoản
      emailService.sendNewAccountEmail(
        email,
        fullName,
        employeeId,
        email,
        randomPassword
      ).catch((error) => {
        console.error("Failed to send email:", error);
        // Không throw error để không ảnh hưởng đến response
      });

      return res.status(201).json({
        success: true,
        message: "Tạo nhân sự thành công. Email thông tin tài khoản đã được gửi.",
        data: {
          id,
          employeeId,
          fullName,
          email,
          temporaryPassword: randomPassword,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể tạo nhân sự",
      });
    }
  }

  // GET /api/users/generate-employee-id/:departmentId - Preview mã nhân viên
  static async previewEmployeeId(req: Request, res: Response) {
    try {
      const { departmentId } = req.params;
      const employeeId = await generateEmployeeId(departmentId);

      return res.json({
        success: true,
        data: { employeeId },
      });
    } catch (error) {
      console.error("Error generating employee ID:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể tạo mã nhân viên",
      });
    }
  }

  // PUT /api/users/:id - Cập nhật nhân sự
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { fullName, email, phone, position, departmentId, role, status } =
        req.body;

      // Check if user exists
      const [existing] = await dbPool.query<RowDataPacket[]>(
        "SELECT id FROM users WHERE id = ? AND deleted_at IS NULL",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhân sự",
        });
      }

      // Check email uniqueness (exclude current user)
      if (email) {
        const [emailCheck] = await dbPool.query<RowDataPacket[]>(
          "SELECT id FROM users WHERE email = ? AND id != ?",
          [email, id]
        );

        if (emailCheck.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Email đã tồn tại trong hệ thống",
          });
        }
      }

      await dbPool.query<ResultSetHeader>(
        `UPDATE users SET
          full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          position = COALESCE(?, position),
          department_id = COALESCE(?, department_id),
          role = COALESCE(?, role),
          status = COALESCE(?, status),
          updated_at = NOW()
        WHERE id = ?`,
        [fullName, email, phone, position, departmentId, role, status, id]
      );

      return res.json({
        success: true,
        message: "Cập nhật nhân sự thành công",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể cập nhật nhân sự",
      });
    }
  }

  // DELETE /api/users/:id - Xóa mềm (chuyển sang đã nghỉ làm)
  static async softDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [existing] = await dbPool.query<RowDataPacket[]>(
        "SELECT id FROM users WHERE id = ? AND deleted_at IS NULL",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhân sự",
        });
      }

      // Soft delete: set deleted_at and change status
      await dbPool.query<ResultSetHeader>(
        `UPDATE users SET 
          deleted_at = NOW(),
          status = 'Blocked',
          updated_at = NOW()
        WHERE id = ?`,
        [id]
      );

      return res.json({
        success: true,
        message: "Nhân sự đã được chuyển sang danh sách nghỉ việc",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể xóa nhân sự",
      });
    }
  }

  // GET /api/users/resigned - Lấy danh sách đã nghỉ việc
  static async getResigned(req: Request, res: Response) {
    try {
      const [rows] = await dbPool.query<RowDataPacket[]>(`
        SELECT 
          u.id,
          u.employee_id as employeeId,
          u.full_name as fullName,
          u.email,
          u.phone,
          u.avatar_url as avatarUrl,
          u.position,
          u.role,
          u.status,
          u.join_date as joinDate,
          u.deleted_at as resignedDate,
          d.name as department
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.deleted_at IS NOT NULL
        ORDER BY u.deleted_at DESC
      `);

      return res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("Error fetching resigned users:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể lấy danh sách nhân sự đã nghỉ việc",
      });
    }
  }

  // POST /api/users/:id/restore - Khôi phục nhân sự đã nghỉ
  static async restore(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [existing] = await dbPool.query<RowDataPacket[]>(
        "SELECT id FROM users WHERE id = ? AND deleted_at IS NOT NULL",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhân sự trong danh sách nghỉ việc",
        });
      }

      await dbPool.query<ResultSetHeader>(
        `UPDATE users SET 
          deleted_at = NULL,
          status = 'Active',
          updated_at = NOW()
        WHERE id = ?`,
        [id]
      );

      return res.json({
        success: true,
        message: "Đã khôi phục nhân sự thành công",
      });
    } catch (error) {
      console.error("Error restoring user:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể khôi phục nhân sự",
      });
    }
  }

  // POST /api/users/:id/change-password - Đổi mật khẩu (user tự đổi)
  static async changePassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      const currentUserId = req.user?.userId; // Từ authMiddleware

      // Validation
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        });
      }

      // Chỉ cho phép user đổi mật khẩu của chính mình (trừ Admin)
      const [userCheck] = await dbPool.query<RowDataPacket[]>(
        "SELECT role FROM users WHERE id = ?",
        [currentUserId]
      );

      const isAdmin = userCheck[0]?.role === "Admin";
      if (id !== currentUserId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền đổi mật khẩu của người khác",
        });
      }

      // Lấy thông tin user
      const [users] = await dbPool.query<RowDataPacket[]>(
        "SELECT id, password_hash FROM users WHERE id = ? AND deleted_at IS NULL",
        [id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhân sự",
        });
      }

      const user = users[0];

      // Xác thực mật khẩu hiện tại (chỉ khi user tự đổi, không áp dụng cho admin reset)
      if (id === currentUserId) {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isPasswordValid) {
          return res.status(400).json({
            success: false,
            message: "Mật khẩu hiện tại không đúng",
          });
        }
      }

      // Hash mật khẩu mới
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Cập nhật mật khẩu
      await dbPool.query<ResultSetHeader>(
        "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
        [passwordHash, id]
      );

      return res.json({
        success: true,
        message: "Đổi mật khẩu thành công",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể đổi mật khẩu",
      });
    }
  }

  // POST /api/users/:id/reset-password - Cấp lại mật khẩu (admin cấp lại)
  static async resetPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.userId;
      const currentUserRole = req.user?.role;

      // Chỉ Admin mới được cấp lại mật khẩu
      if (currentUserRole !== "Admin") {
        return res.status(403).json({
          success: false,
          message: "Chỉ quản trị viên mới được cấp lại mật khẩu",
        });
      }

      // Kiểm tra user tồn tại
      const [users] = await dbPool.query<RowDataPacket[]>(
        "SELECT id, employee_id, full_name, email FROM users WHERE id = ? AND deleted_at IS NULL",
        [id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhân sự",
        });
      }

      const user = users[0];

      // Tạo mật khẩu ngẫu nhiên
      const randomPassword = crypto.randomBytes(8).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      // Cập nhật mật khẩu
      await dbPool.query<ResultSetHeader>(
        "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
        [passwordHash, id]
      );

      // Gửi email mật khẩu mới
      if (user.email) {
        emailService.sendResetPasswordEmail(
          user.email,
          user.full_name,
          user.employee_id,
          randomPassword
        ).catch((error) => {
          console.error("Failed to send email:", error);
          // Không throw error để không ảnh hưởng đến response
        });
      }

      return res.json({
        success: true,
        message: "Cấp lại mật khẩu thành công. Email mật khẩu mới đã được gửi.",
        data: {
          temporaryPassword: randomPassword,
          employeeId: user.employee_id,
          fullName: user.full_name,
        },
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể cấp lại mật khẩu",
      });
    }
  }
}
