/**
 * Query Builder Helpers
 * 
 * Safe SQL building utilities to reduce SQL injection risk
 * while maintaining raw SQL flexibility.
 */

/**
 * Safely escape column name to prevent SQL injection
 */
export function escapeColumn(column: string): string {
    // Only allow alphanumeric and underscore
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) {
        throw new Error(`Invalid column name: ${column}`);
    }
    return `\`${column}\``;
}

/**
 * Build UPDATE SET clause dynamically
 * Returns [setClause, values] for prepared statement
 */
export function buildUpdateSet(
    updates: Record<string, any>,
    fieldMapping: Record<string, string> = {}
): { setClause: string; values: any[] } {
    const setParts: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
            // Map camelCase to snake_case or use provided mapping
            const columnName = fieldMapping[key] || camelToSnake(key);
            setParts.push(`${escapeColumn(columnName)} = ?`);
            values.push(value);
        }
    }

    return {
        setClause: setParts.join(", "),
        values,
    };
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Transform snake_case object keys to camelCase
 */
export function transformKeys(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        result[snakeToCamel(key)] = value;
    }
    return result;
}

/**
 * Build INSERT query with named parameters
 */
export function buildInsert(
    table: string,
    data: Record<string, any>,
    fieldMapping: Record<string, string> = {}
): { query: string; values: any[] } {
    const columns: string[] = [];
    const placeholders: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            const columnName = fieldMapping[key] || camelToSnake(key);
            columns.push(escapeColumn(columnName));
            placeholders.push("?");
            values.push(value);
        }
    }

    const query = `INSERT INTO ${escapeColumn(table)} (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`;

    return { query, values };
}

/**
 * Build safe IN clause with correct number of placeholders
 */
export function buildInClause(values: any[]): string {
    if (values.length === 0) {
        return "(NULL)"; // Empty IN clause that matches nothing
    }
    return `(${values.map(() => "?").join(", ")})`;
}
