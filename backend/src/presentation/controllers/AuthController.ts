import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../application/services/AuthService.js";
import { auditLogger } from "../../utils/auditLogger.js";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password, rememberMe } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      // Validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email và mật khẩu là bắt buộc",
        });
        return;
      }

      // Authenticate
      const authResponse = await this.authService.login({
        email,
        password,
        rememberMe: rememberMe || false,
      });

      // Log successful login
      auditLogger.logLogin(
        authResponse.user.id,
        authResponse.user.email,
        ipAddress,
        userAgent,
        true
      );

      res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: authResponse,
      });
    } catch (error) {
      // Log failed login attempt
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";
      auditLogger.logLogin(
        "unknown",
        req.body.email || "unknown",
        ipAddress,
        userAgent,
        false,
        error instanceof Error ? error.message : "Unknown error"
      );

      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const user = (req as any).user;

      if (token) {
        await this.authService.logout(token);
      }

      // Log logout
      if (user) {
        auditLogger.logLogout(user.id, user.email);
      }

      res.status(200).json({
        success: true,
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Token không hợp lệ",
        });
        return;
      }

      const user = await this.authService.verifyToken(token);

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Token đã hết hạn hoặc không hợp lệ",
        });
        return;
      }

      const { password_hash, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Token không hợp lệ",
        });
        return;
      }

      const user = await this.authService.verifyToken(token);

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Phiên đăng nhập đã hết hạn",
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới",
        });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: "Mật khẩu mới phải có ít nhất 8 ký tự",
        });
        return;
      }

      // Change password via AuthService
      await this.authService.changePassword(
        user.id,
        currentPassword,
        newPassword
      );

      // Log password change
      auditLogger.logPasswordChange(user.id, user.email);

      res.status(200).json({
        success: true,
        message: "Đổi mật khẩu thành công",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  };
}
