import { dbPool } from "./src/infrastructure/database/connection.js";

async function fixActivityLogsType() {
  console.log("🚀 Fixing activity_logs type ENUM...");

  try {
    // Add 'content_management' to the type ENUM
    await dbPool.query(`
      ALTER TABLE activity_logs 
      MODIFY COLUMN type ENUM(
        'post_create',
        'comment', 
        'task_complete',
        'login',
        'profile_update',
        'system',
        'personnel_change',
        'data_backup',
        'content_management',
        'forum_post',
        'forum_comment',
        'forum_moderate',
        'category_management'
      ) NOT NULL
    `);

    console.log(
      "✅ Updated activity_logs type ENUM to include content_management"
    );

    // Verify the change
    const [rows] = await dbPool.query("DESCRIBE activity_logs");
    const typeColumn = (rows as any[]).find((r) => r.Field === "type");
    console.log("New type column:", typeColumn);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixActivityLogsType();
