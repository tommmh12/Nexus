/**
 * Repository Interface for Projects
 * 
 * Defines the contract for project persistence.
 * Implementation details are in infrastructure layer.
 */

import { ProjectData, ProjectWithDetails, ProjectDepartmentData } from "../entities/ProjectEntity.js";

export interface IProjectRepository {
    // Read operations
    findAll(includeDeleted?: boolean): Promise<ProjectData[]>;
    findById(id: string): Promise<ProjectData | null>;
    findByCode(code: string): Promise<ProjectData | null>;
    findByUserId(userId: string): Promise<ProjectData[]>;

    // Get latest code for generation
    getLatestCode(): Promise<string | null>;

    // Write operations
    create(data: Partial<ProjectData>): Promise<string>;
    update(id: string, data: Partial<ProjectData>): Promise<void>;
    delete(id: string): Promise<void>; // Soft delete

    // Relationships
    getDepartments(projectId: string): Promise<ProjectDepartmentData[]>;
    getMembers(projectId: string): Promise<any[]>;
    assignDepartment(projectId: string, departmentId: string, role?: string): Promise<void>;
    removeDepartment(projectId: string, departmentId: string): Promise<void>;
    addMember(projectId: string, userId: string, role?: string): Promise<void>;
    removeMember(projectId: string, userId: string): Promise<void>;

    // Aggregates
    getWithDetails(id: string): Promise<ProjectWithDetails | null>;
}
