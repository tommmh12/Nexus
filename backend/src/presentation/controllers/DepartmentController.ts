import { Request, Response } from "express";
import { DepartmentService } from "../../application/services/DepartmentService.js";
import { DepartmentRepository } from "../../infrastructure/repositories/DepartmentRepository.js";

const departmentRepository = new DepartmentRepository();
const departmentService = new DepartmentService(departmentRepository);

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.json(departments);
  } catch (error: any) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const department = await departmentService.getDepartmentById(id);

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json(department);
  } catch (error: any) {
    console.error("Error fetching department:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    res.status(201).json(department);
  } catch (error: any) {
    console.error("Error creating department:", error);
    res.status(400).json({ error: error.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await departmentService.updateDepartment(id, req.body);
    res.json({ message: "Department updated successfully" });
  } catch (error: any) {
    console.error("Error updating department:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await departmentService.deleteDepartment(id);
    res.json({ message: "Department deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting department:", error);
    res.status(400).json({ error: error.message });
  }
};
