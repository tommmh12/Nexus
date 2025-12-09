import { Request, Response } from "express";
import { UserService } from "../../application/services/UserService.js";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export const createUser = async (req: Request, res: Response) => {
  try {
    // Generate random password if not provided
    const password = req.body.password || Math.random().toString(36).slice(-12) + "A1!";
    
    const user = await userService.createUser({
      employee_id: req.body.employee_id,
      email: req.body.email,
      password: password,
      full_name: req.body.full_name,
      phone: req.body.phone,
      position: req.body.position,
      department_id: req.body.department_id,
      role: req.body.role || "Employee",
      status: req.body.status || "Active",
      join_date: req.body.join_date ? new Date(req.body.join_date) : undefined,
    });

    res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
      // Don't send password back
      tempPassword: password, // Only for initial setup
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to create user",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    await userService.updateUser(req.params.id, req.body);
    res.json({ success: true, message: "User updated successfully" });
  } catch (error: any) {
    console.error("Error updating user:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    res.status(400).json({ error: error.message });
  }
};

