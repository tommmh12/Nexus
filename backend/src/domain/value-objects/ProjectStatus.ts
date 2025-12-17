/**
 * Project Status Value Object
 * 
 * Encapsulates valid project statuses and transition rules.
 */

export type ProjectStatusValue = "Planning" | "In Progress" | "Review" | "Done";

const VALID_TRANSITIONS: Record<ProjectStatusValue, ProjectStatusValue[]> = {
    "Planning": ["In Progress"],
    "In Progress": ["Review", "Planning"],
    "Review": ["Done", "In Progress"],
    "Done": ["In Progress"], // Can reopen
};

export class ProjectStatus {
    private constructor(private readonly value: ProjectStatusValue) { }

    static create(status: string): ProjectStatus {
        if (!ProjectStatus.isValid(status)) {
            throw new Error(`Invalid project status: ${status}`);
        }
        return new ProjectStatus(status as ProjectStatusValue);
    }

    static isValid(status: string): status is ProjectStatusValue {
        return ["Planning", "In Progress", "Review", "Done"].includes(status);
    }

    getValue(): ProjectStatusValue {
        return this.value;
    }

    canTransitionTo(newStatus: ProjectStatus): boolean {
        const allowedTransitions = VALID_TRANSITIONS[this.value];
        return allowedTransitions.includes(newStatus.getValue());
    }

    equals(other: ProjectStatus): boolean {
        return this.value === other.getValue();
    }

    toString(): string {
        return this.value;
    }

    isCompleted(): boolean {
        return this.value === "Done";
    }

    isActive(): boolean {
        return this.value === "In Progress" || this.value === "Review";
    }
}
