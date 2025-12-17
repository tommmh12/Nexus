/**
 * Pagination Utilities
 * 
 * Reusable pagination types and SQL helpers.
 */

export interface PaginationParams {
    page: number;      // 1-indexed
    limit: number;     // Max per page
    sortBy?: string;   // Column to sort by
    sortOrder?: "asc" | "desc";
}

export interface FilterParams {
    status?: string[];
    priority?: string[];
    managerId?: string;
    search?: string;   // Search in name, code
    dateFrom?: string; // ISO date
    dateTo?: string;   // ISO date
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// Default values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Normalize pagination params with defaults and bounds
 */
export function normalizePaginationParams(params: Partial<PaginationParams>): PaginationParams {
    const page = Math.max(1, params.page || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, params.limit || DEFAULT_LIMIT));

    return {
        page,
        limit,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder || "desc",
    };
}

/**
 * Calculate SQL OFFSET from page and limit
 */
export function calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
}

/**
 * Build pagination result from data and total count
 */
export function buildPaginatedResult<T>(
    data: T[],
    total: number,
    params: PaginationParams
): PaginatedResult<T> {
    const totalPages = Math.ceil(total / params.limit);

    return {
        data,
        pagination: {
            total,
            page: params.page,
            limit: params.limit,
            totalPages,
            hasNextPage: params.page < totalPages,
            hasPrevPage: params.page > 1,
        },
    };
}

/**
 * Append LIMIT and OFFSET to SQL query
 */
export function appendPaginationSQL(
    baseQuery: string,
    params: PaginationParams
): string {
    const offset = calculateOffset(params.page, params.limit);
    return `${baseQuery} LIMIT ${params.limit} OFFSET ${offset}`;
}

/**
 * Build ORDER BY clause
 */
export function buildOrderBySQL(
    params: PaginationParams,
    allowedColumns: string[],
    defaultColumn: string = "created_at"
): string {
    const column = allowedColumns.includes(params.sortBy || "")
        ? params.sortBy
        : defaultColumn;
    const order = params.sortOrder === "asc" ? "ASC" : "DESC";

    return `ORDER BY ${column} ${order}`;
}

/**
 * Build WHERE conditions for filters
 * Returns [whereClause, values] for prepared statement
 */
export function buildFilterSQL(
    filters: FilterParams,
    tableAlias: string = ""
): { conditions: string[]; values: any[] } {
    const conditions: string[] = [];
    const values: any[] = [];
    const prefix = tableAlias ? `${tableAlias}.` : "";

    if (filters.status && filters.status.length > 0) {
        conditions.push(`${prefix}status IN (?)`);
        values.push(filters.status);
    }

    if (filters.priority && filters.priority.length > 0) {
        conditions.push(`${prefix}priority IN (?)`);
        values.push(filters.priority);
    }

    if (filters.managerId) {
        conditions.push(`${prefix}manager_id = ?`);
        values.push(filters.managerId);
    }

    if (filters.search) {
        conditions.push(`(${prefix}name LIKE ? OR ${prefix}code LIKE ?)`);
        const searchTerm = `%${filters.search}%`;
        values.push(searchTerm, searchTerm);
    }

    if (filters.dateFrom) {
        conditions.push(`${prefix}created_at >= ?`);
        values.push(filters.dateFrom);
    }

    if (filters.dateTo) {
        conditions.push(`${prefix}created_at <= ?`);
        values.push(filters.dateTo);
    }

    return { conditions, values };
}
