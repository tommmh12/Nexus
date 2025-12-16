/**
 * Run migration 024: Chat Moderation Tables
 * Creates message_reports and chat_bans tables
 */

import { dbPool } from "./src/infrastructure/database/connection.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log("🚀 Running migration 024: Chat Moderation Tables...\n");

  try {
    const migrationPath = path.join(
      __dirname,
      "src/infrastructure/database/migrations/024_chat_moderation_tables.sql"
    );

    const sql = fs.readFileSync(migrationPath, "utf8");

    // Split by semicolon and run each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      try {
        await dbPool.query(statement);
        console.log("✅ Executed:", statement.substring(0, 60) + "...");
      } catch (err: any) {
        // Ignore "already exists" errors
        if (err.code === "ER_TABLE_EXISTS_ERROR" || err.code === "ER_DUP_FIELDNAME") {
          console.log("⚠️  Skipped (already exists):", statement.substring(0, 60) + "...");
        } else {
          throw err;
        }
      }
    }

    console.log("\n✅ Migration 024 completed successfully!");
    console.log("\n📋 Created/Updated:");
    console.log("   - message_reports table");
    console.log("   - chat_bans table");
    console.log("   - Added moderation columns to chat_messages");

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();
