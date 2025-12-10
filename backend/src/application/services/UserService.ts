import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";
import { User, UserWithDepartment } from "../../domain/entities/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { emailService } from "../../infrastructure/email/EmailService.js";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  private generateRandomPassword(length: number = 12): string {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  async createUser(userData: {
    employee_id: string;
    email: string;
    password?: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
    position?: string;
    department_id?: string;
    role: "Admin" | "Manager" | "Employee";
    status: "Active" | "Blocked" | "Pending";
    join_date?: Date;
  }): Promise<{ user: User; password: string }> {
    // Validate required fields
    if (!userData.employee_id || !userData.email || !userData.full_name) {
      throw new Error("Missing required fields");
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Generate random password if not provided
    const plainPassword = userData.password || this.generateRandomPassword();

    // Hash password
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // Generate default avatar if not provided
    const avatarUrl =
      userData.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userData.full_name
      )}`;

    const user = await this.userRepository.create({
      ...userData,
      password_hash: passwordHash,
      avatar_url: avatarUrl,
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(
        userData.email,
        userData.full_name,
        userData.employee_id,
        plainPassword
      );
      console.log(`📧 Welcome email sent to ${userData.email}`);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      // Don't throw error - user creation should succeed even if email fails
    }

    return { user, password: plainPassword };
  }

  async getAllUsers(): Promise<UserWithDepartment[]> {
    return await this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<UserWithDepartment | null> {
    return await this.userRepository.findById(id);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<void> {
    await this.userRepository.update(id, userData);
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
