import { dbPool } from "./src/infrastructure/database/connection.js";

async function runMigration() {
  console.log("🚀 Running Migration 021: Forum Reactions & Attachments...");

  try {
    // 1. Create forum_reactions table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS forum_reactions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        target_type ENUM('post', 'comment') NOT NULL,
        target_id VARCHAR(36) NOT NULL,
        reaction_type ENUM('like', 'love', 'laugh', 'wow', 'sad', 'angry') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_reaction (user_id, target_type, target_id),
        INDEX idx_target (target_type, target_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Created forum_reactions table");

    // 2. Create forum_attachments table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS forum_attachments (
        id VARCHAR(36) PRIMARY KEY,
        post_id VARCHAR(36) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(512) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INT DEFAULT 0,
        mime_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_post (post_id),
        FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Created forum_attachments table");

    // 3. Add karma_points to users if not exists
    try {
      await dbPool.query(`ALTER TABLE users ADD COLUMN karma_points INT DEFAULT 0`);
      console.log("✅ Added karma_points column to users");
    } catch (e: any) {
      if (e.code === "ER_DUP_FIELDNAME") {
        console.log("ℹ️ karma_points column already exists");
      } else {
        console.log("ℹ️ karma_points:", e.message);
      }
    }

    // 4. Add join_date to users if not exists  
    try {
      await dbPool.query(`ALTER TABLE users ADD COLUMN join_date DATE DEFAULT NULL`);
      console.log("✅ Added join_date column to users");
    } catch (e: any) {
      if (e.code === "ER_DUP_FIELDNAME") {
        console.log("ℹ️ join_date column already exists");
      } else {
        console.log("ℹ️ join_date:", e.message);
      }
    }

    console.log("\n✅ Migration 021 completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await dbPool.end();
    process.exit(0);
  }
}

runMigration();
