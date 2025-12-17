/**
 * Project Domain Entity
 * 
 * Rich domain model with business logic and validation.
 * This class is used for domain operations, distinct from the raw data interface.
 */

import { ProjectStatus, ProjectStatusValue } from "../value-objects/ProjectStatus.js";
import { ProjectCode } from "../value-objects/ProjectCode.js";

// Raw data interface (matches database)
export interface ProjectData {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    managerId?: string | null;
    managerName?: string | null;
    workflowId?: string | null;
    workflowName?: string | null;
    status: string;
    priority: string;
    progress: number;
    budget?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface ProjectWithDetails extends ProjectData {
    departments?: ProjectDepartmentData[];
    memberCount?: number;
    taskCount?: number;
    completedTaskCount?: number;
}

export interface ProjectDepartmentData {
    id: string;
    projectId: string;
    departmentId: string;
    departmentName: string;
    role?: string;
    assignedAt: string;
}

// Domain error types
export class InvalidStatusTransitionError extends Error {
    constructor(from: ProjectStatusValue, to: ProjectStatusValue) {
        super(`Cannot transition project status from "${from}" to "${to}"`);
        this.name = "InvalidStatusTransitionError";
    }
}

export class ProjectValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ProjectValidationError";
    }
}

/**
 * Rich Project Domain Entity
 */
export class ProjectEntity {
    private readonly _id: string;
    private readonly _code: ProjectCode;
    private _name: string;
    private _description: string | null;
    private _managerId: string | null;
    private _status: ProjectStatus;
    private _priority: string;
    private _progress: number;
    private _budget: number | null;
    private _startDate: Date | null;
    private _endDate: Date | null;

    private constructor(
        id: string,
        code: ProjectCode,
        name: string,
        description: string | null,
        managerId: string | null,
        status: ProjectStatus,
        priority: string,
        progress: number,
        budget: number | null,
        startDate: Date | null,
        endDate: Date | null
    ) {
        this._id = id;
        this._code = code;
        this._name = name;
        this._description = description;
        this._managerId = managerId;
        this._status = status;
        this._priority = priority;
        this._progress = progress;
        this._budget = budget;
        this._startDate = startDate;
        this._endDate = endDate;
    }

    /**
     * Create from raw database data
     */
    static fromData(data: ProjectData): ProjectEntity {
        return new ProjectEntity(
            data.id,
            ProjectCode.create(data.code),
            data.name,
            data.description || null,
            data.managerId || null,
            ProjectStatus.create(data.status),
            data.priority,
            data.progress,
            data.budget || null,
            data.startDate ? new Date(data.startDate) : null,
            data.endDate ? new Date(data.endDate) : null
        );
    }

    /**
     * Create a new project (for creation use case)
     */
    static create(params: {
        id: string;
        code: string;
        name: string;
        description?: string;
        managerId?: string;
        priority?: string;
        budget?: number;
        startDate?: Date;
        endDate?: Date;
    }): ProjectEntity {
        if (!params.name || params.name.trim().length === 0) {
            throw new ProjectValidationError("Project name is required");
        }

        if (params.startDate && params.endDate && params.startDate > params.endDate) {
            throw new ProjectValidationError("End date cannot be before start date");
        }

        return new ProjectEntity(
            params.id,
            ProjectCode.create(params.code),
            params.name.trim(),
            params.description?.trim() || null,
            params.managerId || null,
            ProjectStatus.create("Planning"), // New projects start in Planning
            params.priority || "Medium",
            0, // New projects start with 0% progress
            params.budget || null,
            params.startDate || null,
            params.endDate || null
        );
    }

    // ===== Getters =====
    get id(): string { return this._id; }
    get code(): string { return this._code.getValue(); }
    get name(): string { return this._name; }
    get description(): string | null { return this._description; }
    get managerId(): string | null { return this._managerId; }
    get status(): ProjectStatusValue { return this._status.getValue(); }
    get priority(): string { return this._priority; }
    get progress(): number { return this._progress; }
    get budget(): number | null { return this._budget; }
    get startDate(): Date | null { return this._startDate; }
    get endDate(): Date | null { return this._endDate; }

    // ===== Business Logic =====

    /**
     * Change project status with validation
     */
    changeStatus(newStatusValue: ProjectStatusValue): void {
        const newStatus = ProjectStatus.create(newStatusValue);

        if (!this._status.canTransitionTo(newStatus)) {
            throw new InvalidStatusTransitionError(this._status.getValue(), newStatusValue);
        }

        this._status = newStatus;
    }

    /**
     * Update project progress
     * Progress is calculated from tasks, but validated here
     */
    updateProgress(newProgress: number): void {
        if (newProgress < 0 || newProgress > 100) {
            throw new ProjectValidationError("Progress must be between 0 and 100");
        }
        this._progress = Math.round(newProgress);

        // Auto-complete if progress is 100%
        if (this._progress === 100 && !this._status.isCompleted()) {
            // Don't auto-change status, let user decide
        }
    }

    /**
     * Check if project is overdue
     */
    isOverdue(): boolean {
        if (!this._endDate || this._status.isCompleted()) {
            return false;
        }
        return new Date() > this._endDate;
    }

    /**
     * Check if project can be deleted
     * Only non-active projects can be deleted
     */
    canBeDeleted(): boolean {
        return !this._status.isActive();
    }

    /**
     * Update basic info
     */
    updateInfo(params: {
        name?: string;
        description?: string;
        priority?: string;
        budget?: number;
        startDate?: Date;
        endDate?: Date;
    }): void {
        if (params.name !== undefined) {
            if (!params.name.trim()) {
                throw new ProjectValidationError("Project name cannot be empty");
            }
            this._name = params.name.trim();
        }

        if (params.description !== undefined) {
            this._description = params.description?.trim() || null;
        }

        if (params.priority !== undefined) {
            this._priority = params.priority;
        }

        if (params.budget !== undefined) {
            this._budget = params.budget || null;
        }

        if (params.startDate !== undefined) {
            this._startDate = params.startDate || null;
        }

        if (params.endDate !== undefined) {
            this._endDate = params.endDate || null;
        }

        // Validate dates after update
        if (this._startDate && this._endDate && this._startDate > this._endDate) {
            throw new ProjectValidationError("End date cannot be before start date");
        }
    }

    /**
     * Assign a new manager
     */
    assignManager(managerId: string): void {
        this._managerId = managerId;
    }

    /**
     * Convert to plain object for persistence
     */
    toData(): Partial<ProjectData> {
        return {
            id: this._id,
            code: this._code.getValue(),
            name: this._name,
            description: this._description,
            managerId: this._managerId,
            status: this._status.getValue(),
            priority: this._priority,
            progress: this._progress,
            budget: this._budget,
            startDate: this._startDate?.toISOString().split("T")[0] || null,
            endDate: this._endDate?.toISOString().split("T")[0] || null,
        };
    }
}

// Re-export interfaces for backward compatibility
export type { ProjectData as Project };
