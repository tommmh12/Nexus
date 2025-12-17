/**
 * Database Infrastructure Exports
 */

export { dbPool } from "./connection.js";

// Pagination
export {
    type PaginationParams,
    type FilterParams,
    type PaginatedResult,
    normalizePaginationParams,
    calculateOffset,
    buildPaginatedResult,
    appendPaginationSQL,
    buildOrderBySQL,
    buildFilterSQL,
} from "./Pagination.js";

// Query Builder
export {
    escapeColumn,
    buildUpdateSet,
    camelToSnake,
    snakeToCamel,
    transformKeys,
    buildInsert,
    buildInClause,
} from "./QueryBuilder.js";

// Code Generation
export {
    generateProjectCodeAtomic,
    reserveProjectCode,
} from "./ProjectCodeGenerator.js";
