import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  // First create database without selecting it
  const connectionWithoutDb = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    multipleStatements: true,
  });

  console.log("🔗 Connected to MySQL server");

  try {
    // Create database
    console.log("📦 Creating database nexus_db...");
    await connectionWithoutDb.query(`
      CREATE DATABASE IF NOT EXISTS nexus_db
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci
    `);
    console.log("✅ Database created/verified");
    await connectionWithoutDb.end();

    // Connect to the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "123456",
      database: "nexus_db",
      multipleStatements: true,
    });

    // Get migration files
    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort();

    console.log(`\n📂 Found ${files.length} migration files\n`);

    for (const file of files) {
      if (file === "001_create_database.sql") continue; // Skip, already done
      
      console.log(`⏳ Running ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      
      // Remove USE statements since we're already connected to the db
      const cleanSql = sql.replace(/USE\s+nexus_db\s*;/gi, "");
      
      try {
        await connection.query(cleanSql);
        console.log(`✅ ${file} completed`);
      } catch (err: any) {
        if (err.code === "ER_TABLE_EXISTS_ERROR") {
          console.log(`⚠️  ${file} - Tables already exist, skipping`);
        } else {
          throw err;
        }
      }
    }

    await connection.end();
    console.log("\n🎉 All migrations completed!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
