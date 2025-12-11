import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";
import {
  LoginCredentials,
  AuthResponse,
  User,
} from "../../domain/entities/User.js";

export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private jwtRefreshExpiresIn: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret =
      process.env.JWT_SECRET ||
      "nexus_super_secret_key_change_in_production_2024";
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password, rememberMe } = credentials;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    // Check if user is active
    if (user.status !== "Active") {
      throw new Error("Tài khoản đã bị khóa hoặc vô hiệu hóa");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Generate tokens
    const expiresIn = rememberMe ? this.jwtRefreshExpiresIn : this.jwtExpiresIn;
    const accessToken = this.generateToken(user, expiresIn);
    const refreshToken = this.generateToken(user, this.jwtRefreshExpiresIn);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await this.userRepository.createSession(user.id, refreshToken, expiresAt);

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
      const user = await this.userRepository.findById(decoded.userId);

      if (!user || user.status !== "Active") {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  async logout(token: string): Promise<void> {
    await this.userRepository.deleteSession(token);
  }

  private generateToken(user: User, expiresIn: string): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      this.jwtSecret,
      { expiresIn }
    );
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Find user by ID
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      throw new Error("Mật khẩu hiện tại không đúng");
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      throw new Error("Mật khẩu mới phải khác mật khẩu hiện tại");
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await this.userRepository.updatePassword(userId, newPasswordHash);
  }
}
