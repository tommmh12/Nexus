import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function addDeptCode() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: "nexus_db",
  });

  try {
    // Add code column if not exists
    try {
      await conn.query("ALTER TABLE departments ADD COLUMN code VARCHAR(10)");
      console.log("✅ Added code column");
    } catch (e: any) {
      if (e.code === "ER_DUP_FIELDNAME") {
        console.log("ℹ️ Code column already exists");
      } else {
        throw e;
      }
    }

    // Update department codes
    await conn.query("UPDATE departments SET code = 'IT' WHERE name LIKE '%Công nghệ%'");
    await conn.query("UPDATE departments SET code = 'HR' WHERE name LIKE '%Nhân sự%'");
    await conn.query("UPDATE departments SET code = 'FIN' WHERE name LIKE '%Tài chính%'");
    await conn.query("UPDATE departments SET code = 'MKT' WHERE name LIKE '%Marketing%'");

    const [rows] = await conn.query("SELECT code, name FROM departments");
    console.table(rows);
    console.log("✅ Department codes updated!");
  } finally {
    await conn.end();
  }
}

addDeptCode();
