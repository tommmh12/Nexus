import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";
import { User, UserWithDepartment } from "../../domain/entities/User.js";
import bcrypt from "bcryptjs";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(userData: {
    employee_id: string;
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
    position?: string;
    department_id?: string;
    role: "Admin" | "Manager" | "Employee";
    status: "Active" | "Blocked" | "Pending";
    join_date?: Date;
  }): Promise<User> {
    // Validate required fields
    if (!userData.employee_id || !userData.email || !userData.password || !userData.full_name) {
      throw new Error("Missing required fields");
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // Generate default avatar if not provided
    const avatarUrl = userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name)}`;

    return await this.userRepository.create({
      ...userData,
      password_hash: passwordHash,
      avatar_url: avatarUrl,
    });
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

