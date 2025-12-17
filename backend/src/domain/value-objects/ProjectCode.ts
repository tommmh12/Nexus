/**
 * Project Code Value Object
 * 
 * Encapsulates project code format and generation logic.
 * Format: {PREFIX}-{NUMBER} (e.g., WEB-001)
 */

export class ProjectCode {
    private static readonly PREFIX_PATTERN = /^[A-Z]{2,5}$/;
    private static readonly FULL_PATTERN = /^([A-Z]{2,5})-(\d{3,})$/;

    private constructor(
        private readonly prefix: string,
        private readonly number: number
    ) { }

    static create(code: string): ProjectCode {
        const match = code.match(ProjectCode.FULL_PATTERN);
        if (!match) {
            throw new Error(`Invalid project code format: ${code}. Expected format: PREFIX-NUMBER (e.g., WEB-001)`);
        }
        return new ProjectCode(match[1], parseInt(match[2], 10));
    }

    static generateNext(lastCode: string | null, prefix: string = "WEB"): ProjectCode {
        if (!ProjectCode.PREFIX_PATTERN.test(prefix)) {
            throw new Error(`Invalid prefix format: ${prefix}. Must be 2-5 uppercase letters.`);
        }

        if (!lastCode) {
            return new ProjectCode(prefix, 1);
        }

        const match = lastCode.match(ProjectCode.FULL_PATTERN);
        if (!match) {
            // Fallback if last code doesn't match pattern
            return new ProjectCode(prefix, 1);
        }

        const lastNumber = parseInt(match[2], 10);
        return new ProjectCode(prefix, lastNumber + 1);
    }

    getValue(): string {
        return `${this.prefix}-${this.number.toString().padStart(3, "0")}`;
    }

    getPrefix(): string {
        return this.prefix;
    }

    getNumber(): number {
        return this.number;
    }

    equals(other: ProjectCode): boolean {
        return this.prefix === other.prefix && this.number === other.number;
    }

    toString(): string {
        return this.getValue();
    }
}
