import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const createConnection = async () => {
  try {
    // Require DB credentials in production
    if (process.env.NODE_ENV === "production") {
      if (!process.env.DB_PASSWORD) {
        throw new Error("DB_PASSWORD environment variable is required in production");
      }
      if (!process.env.DB_USER) {
        throw new Error("DB_USER environment variable is required in production");
      }
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || (process.env.NODE_ENV === "production" ? undefined : ""),
      database: process.env.DB_NAME || "nexus_db",
      charset: "utf8mb4",
    });

    console.log("✅ Database connected successfully");
    return connection;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

export const createPool = () => {
  // Require DB credentials in production
  if (process.env.NODE_ENV === "production") {
    if (!process.env.DB_PASSWORD) {
      throw new Error("DB_PASSWORD environment variable is required in production");
    }
    if (!process.env.DB_USER) {
      throw new Error("DB_USER environment variable is required in production");
    }
  }

  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || (process.env.NODE_ENV === "production" ? undefined : ""),
    database: process.env.DB_NAME || "nexus_db",
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  console.log("✅ Database pool created");
  return pool;
};

export const dbPool = createPool();
