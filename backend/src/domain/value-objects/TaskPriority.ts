/**
 * Task Priority Value Object
 * 
 * Encapsulates task priority levels with SLA configurations.
 */

export type TaskPriorityValue = "Low" | "Medium" | "High" | "Critical";

const SLA_HOURS: Record<TaskPriorityValue, number> = {
    "Low": 72,      // 3 days
    "Medium": 48,   // 2 days
    "High": 24,     // 1 day
    "Critical": 8,  // 8 hours
};

const PRIORITY_ORDER: Record<TaskPriorityValue, number> = {
    "Critical": 4,
    "High": 3,
    "Medium": 2,
    "Low": 1,
};

export class TaskPriority {
    private constructor(private readonly value: TaskPriorityValue) { }

    static create(priority: string): TaskPriority {
        if (!TaskPriority.isValid(priority)) {
            throw new Error(`Invalid task priority: ${priority}`);
        }
        return new TaskPriority(priority as TaskPriorityValue);
    }

    static isValid(priority: string): priority is TaskPriorityValue {
        return ["Low", "Medium", "High", "Critical"].includes(priority);
    }

    getValue(): TaskPriorityValue {
        return this.value;
    }

    getSlaHours(): number {
        return SLA_HOURS[this.value];
    }

    getOrder(): number {
        return PRIORITY_ORDER[this.value];
    }

    isHigherThan(other: TaskPriority): boolean {
        return this.getOrder() > other.getOrder();
    }

    isCritical(): boolean {
        return this.value === "Critical";
    }

    equals(other: TaskPriority): boolean {
        return this.value === other.getValue();
    }

    toString(): string {
        return this.value;
    }
}
