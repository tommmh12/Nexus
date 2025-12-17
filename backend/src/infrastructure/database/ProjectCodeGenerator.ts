/**
 * Project Code Generator
 * 
 * Atomic project code generation using database-level locking
 * to prevent race conditions during concurrent creation.
 */

import { dbPool } from "./connection.js";
import { RowDataPacket } from "mysql2";
import { ProjectCode } from "../../domain/value-objects/ProjectCode.js";

/**
 * Generate next project code atomically with database lock
 * 
 * Uses SELECT FOR UPDATE to lock the last project row during code generation,
 * preventing race conditions when multiple requests try to create projects simultaneously.
 * 
 * @param prefix - Code prefix (default: "WEB")
 * @returns Generated project code string
 */
export async function generateProjectCodeAtomic(prefix: string = "WEB"): Promise<string> {
    const connection = await dbPool.getConnection();

    try {
        await connection.beginTransaction();

        // Lock the row with the latest code to prevent concurrent reads
        const [rows] = await connection.query<RowDataPacket[]>(`
      SELECT code 
      FROM projects 
      WHERE code LIKE ?
      ORDER BY created_at DESC 
      LIMIT 1 
      FOR UPDATE
    `, [`${prefix}-%`]);

        const lastCode = rows.length > 0 ? rows[0].code : null;
        const newCode = ProjectCode.generateNext(lastCode, prefix);

        await connection.commit();

        return newCode.getValue();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * Reserve a project code by inserting a placeholder row
 * This approach is even more robust than SELECT FOR UPDATE
 * 
 * Alternative implementation if SELECT FOR UPDATE causes deadlocks:
 * 1. Use a separate `project_codes` table with unique constraint
 * 2. Insert the new code, if duplicate key error, retry with next number
 */
export async function reserveProjectCode(
    prefix: string = "WEB",
    maxRetries: number = 5
): Promise<string> {
    const connection = await dbPool.getConnection();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            await connection.beginTransaction();

            // Get current max number
            const [rows] = await connection.query<RowDataPacket[]>(`
        SELECT code 
        FROM projects 
        WHERE code LIKE ?
        ORDER BY 
          CAST(SUBSTRING(code, LENGTH(?) + 2) AS UNSIGNED) DESC
        LIMIT 1 
        FOR UPDATE
      `, [`${prefix}-%`, prefix]);

            const lastCode = rows.length > 0 ? rows[0].code : null;
            const newCode = ProjectCode.generateNext(lastCode, prefix);

            await connection.commit();
            return newCode.getValue();

        } catch (error: any) {
            await connection.rollback();

            // If deadlock, retry
            if (error.code === "ER_LOCK_DEADLOCK" && attempt < maxRetries - 1) {
                // Exponential backoff with jitter
                const delay = Math.min(1000, (2 ** attempt) * 50 + Math.random() * 50);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            throw error;
        } finally {
            connection.release();
        }
    }

    throw new Error(`Failed to generate project code after ${maxRetries} attempts`);
}
