import { dbPool } from "./src/infrastructure/database/connection.js";

async function fixForumContentColumn() {
  console.log("🚀 Fixing forum_posts content column size...");

  try {
    // Change content column to LONGTEXT to support large content (including base64 images)
    await dbPool.query(`
      ALTER TABLE forum_posts 
      MODIFY COLUMN content LONGTEXT NOT NULL
    `);

    console.log("✅ Changed forum_posts.content to LONGTEXT");

    // Also fix forum_comments if needed
    await dbPool.query(`
      ALTER TABLE forum_comments 
      MODIFY COLUMN content LONGTEXT NOT NULL
    `);

    console.log("✅ Changed forum_comments.content to LONGTEXT");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixForumContentColumn();
